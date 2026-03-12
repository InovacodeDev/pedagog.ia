'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late';
  date?: string; // Optional date for multi-date records
}

/**
 * Records attendance for multiple students (and potentially multiple dates) in a class.
 */
export async function recordAttendanceAction(
  classId: string,
  records: AttendanceRecord[],
  singleDate?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    const attendanceData = records.map(record => ({
      class_id: classId,
      student_id: record.student_id,
      date: record.date || singleDate,
      status: record.status,
      user_id: user.id
    }));

    const { error } = await (supabase as unknown as { 
      from: (t: string) => { 
        upsert: (d: unknown[], o: { onConflict: string }) => Promise<{ error: unknown }> 
      } 
    })
      .from('class_attendance')
      .upsert(attendanceData, {
        onConflict: 'student_id,date'
      });



    if (error) {
      console.error('[Record Attendance] error:', error);
      return { success: false, message: 'Erro ao salvar presença' };
    }

    revalidatePath(`/classes/${classId}`);
    return { success: true, message: 'Presença registrada com sucesso!' };
  } catch (error) {
    console.error('[Record Attendance] unexpected error:', error);
    return { success: false, message: 'Erro inesperado ao registrar presença' };
  }
}

/**
 * Fetches attendance records for a class on a specific date.
 */
export async function getAttendanceAction(classId: string, date: string): Promise<{ success: boolean; records?: AttendanceRecord[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { data, error } = await (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (c: string, v: string) => {
            eq: (c: string, v: string) => Promise<{ data: unknown[] | null; error: unknown }>
          }
        }
      }
    })
      .from('class_attendance')
      .select('student_id, status')
      .eq('class_id', classId)
      .eq('date', date);

    if (error) {
      console.error('[Get Attendance] error:', error);
      return { success: false, error: 'Erro ao buscar presença' };
    }

    return { success: true, records: (data as AttendanceRecord[]) || [] };
  } catch (error) {
    console.error('[Get Attendance] unexpected error:', error);
    return { success: false, error: 'Erro inesperado ao buscar presença' };
  }
}

/**
 * Fetches attendance records for a class within a date range (e.g., a month).
 */
export async function getMonthAttendanceAction(
  classId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; records?: (AttendanceRecord & { date: string })[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { data, error } = await (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (c: string, v: string) => {
            gte: (c: string, v: string) => {
              lte: (c: string, v: string) => Promise<{ data: unknown[] | null; error: unknown }>
            }
          }
        }
      }
    })
      .from('class_attendance')
      .select('student_id, status, date')
      .eq('class_id', classId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('[Get Month Attendance] error:', error);
      return { success: false, error: 'Erro ao buscar presença do mês' };
    }

    return { success: true, records: (data as (AttendanceRecord & { date: string })[]) || [] };
  } catch (error) {
    console.error('[Get Month Attendance] unexpected error:', error);
    return { success: false, error: 'Erro inesperado ao buscar presença do mês' };
  }
}

interface GroupedAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  [key: string]: string | number;
}

/**
 * Fetches aggregated attendance analytics for a class.
 */
export async function getClassAttendanceAnalyticsAction(classId: string) {
  try {
    const supabase = await createClient();
    
    // Fetch last 30 days of attendance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await (supabase as unknown as { 
      from: (t: string) => { 
        select: (s: string) => { 
          eq: (c: string, v: string) => { 
            gte: (c: string, v: string) => Promise<{ data: unknown[] | null; error: unknown }> 
          } 
        } 
      } 
    })
      .from('class_attendance')
      .select('date, status')
      .eq('class_id', classId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);



    if (error) throw error;

    if (!data) return { success: true, data: [] };

    // Group by date
    const groupedData = (data as { date: string; status: string }[]).reduce<Record<string, GroupedAttendance>>((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) {
        acc[date] = { date, present: 0, absent: 0, late: 0, total: 0 };
      }
      const status = curr.status as keyof Omit<GroupedAttendance, 'date' | 'total'>;
      if (acc[date][status] !== undefined) {
        (acc[date][status] as number)++;
      }
      acc[date].total++;
      return acc;
    }, {});

    const chartData = Object.values(groupedData).map((day) => ({
      ...day,
      presenceRate: parseFloat(((day.present + day.late) / (day.total || 1) * 100).toFixed(1))
    })).sort((a, b) => a.date.localeCompare(b.date));


    return { success: true, data: chartData };

  } catch (error) {
    console.error('[Attendance Analytics] error:', error);
    return { success: false, error: 'Erro ao gerar análise de presença' };
  }
}
