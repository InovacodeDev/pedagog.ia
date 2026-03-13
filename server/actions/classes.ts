'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { trackServerEvent } from '@/lib/amplitude-server';
import { ExamRow } from '@/types/app';

export interface ClassItem {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  lesson_days: number[];
  disciplines: string[];
  academic_year: number;
  period_type: 'bimestre' | 'trimestre' | 'semestre';
  period_starts: string[];
  passing_grade: number;
  min_frequency: number;
  exams_config: Record<string, number>;
  is_archived: boolean;
  students: { count: number }[];
}

export async function getClassesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('classes')
    .select('*, students(count)')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes');
  }

  return data as unknown as ClassItem[];
}

export async function getClassAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching class:', error);
    return null;
  }

  return data as ClassItem;
}

export async function createClassAction(
  name: string,
  lessonDays: number[] = [],
  disciplines: string[] = [],
  academicYear: number = new Date().getFullYear(),
  periodType: 'bimestre' | 'trimestre' | 'semestre' = 'bimestre',
  periodStarts: string[] = [],
  passingGrade: number = 6.0,
  minFrequency: number = 75.0,
  examsConfig: Record<string, number> = {}
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // Check subscription and classes limit
  const { getSubscriptionPlan } = await import('@/lib/subscription');
  const { isPro } = await getSubscriptionPlan();

  if (!isPro) {
    const { count, error: countError } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error checking classes count:', countError);
      return { success: false, message: 'Erro ao verificar limite de turmas' };
    }

    if (count && count >= 1) {
      return { 
        success: false, 
        message: 'Usuários do plano gratuito podem criar apenas uma turma. Faça upgrade para criar turmas ilimitadas!' 
      };
    }
  }

  const { error } = await supabase.from('classes').insert({
    name,
    user_id: user.id,
    lesson_days: lessonDays,
    disciplines: disciplines,
    academic_year: academicYear,
    period_type: periodType,
    period_starts: periodStarts,
    passing_grade: passingGrade,
    min_frequency: minFrequency,
    exams_config: examsConfig,
  });

  if (error) {
    console.error('Error creating class:', error);
    return { success: false, message: 'Failed to create class' };
  }

  // Track event
  await trackServerEvent('Class Created', user.id, {
    Subjects: disciplines || [],
  });

  revalidatePath('/classes');
  return { success: true, message: 'Turma criada com sucesso!' };
}


export async function updateClassAction(
  id: string, 
  name: string, 
  lessonDays: number[] = [], 
  disciplines: string[] = [],
  academicYear?: number,
  periodType?: 'bimestre' | 'trimestre' | 'semestre',
  periodStarts?: string[],
  passingGrade?: number,
  minFrequency?: number,
  examsConfig?: Record<string, number>,
  isArchived?: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('classes')
    .update({ 
      name,
      lesson_days: lessonDays,
      disciplines: disciplines,
      academic_year: academicYear,
      period_type: periodType,
      period_starts: periodStarts,
      passing_grade: passingGrade,
      min_frequency: minFrequency,
      exams_config: examsConfig,
      is_archived: isArchived,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating class:', error);
    return { success: false, message: 'Failed to update class' };
  }

  revalidatePath('/classes');
  return { success: true, message: 'Turma atualizada com sucesso!' };
}

export async function deleteClassAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // Check for students
  const { count, error: countError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', id);

  if (countError) {
    console.error('Error checking students:', countError);
    return { success: false, message: 'Failed to check class status' };
  }

  if (count && count > 0) {
    return { success: false, message: 'A turma possui alunos. Remova-os antes de excluir.' };
  }

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting class:', error);
    return { success: false, message: 'Failed to delete class' };
  }

  revalidatePath('/classes');
  return { success: true, message: 'Turma excluída com sucesso!' };
}

export async function archiveClassAction(id: string, isArchived: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('classes')
    .update({ is_archived: isArchived })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error archiving class:', error);
    return { success: false, message: 'Failed to archive class' };
  }

  revalidatePath('/classes');
  return {
    success: true,
    message: isArchived ? 'Turma arquivada com sucesso!' : 'Turma desarquivada com sucesso!',
  };
}

// ... (previous code)

export interface StudentGradeInfo {
  id: string;
  name: string | null;
  discipline_grades: Record<string, number | null>;
  discipline_exam_details: Record<string, { exam_title: string; score: number }[]>;
  average: number | null;
  frequency: number | null;
  status: 'Aprovado' | 'Reprovado' | 'Reprovado por Falta' | 'Pendente';
}

export interface ClassWithGrades extends ClassItem {
  students_with_grades: StudentGradeInfo[];
  disciplines: string[];
}

export async function getClassesWithGradesAction(term?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Fetch Classes
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*, students(count)')
    .eq('user_id', user.id)
    .order('is_archived', { ascending: true })
    .order('created_at', { ascending: false });

  if (classesError) throw new Error('Failed to fetch classes');

  // 2. Fetch Students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, name, class_id')
    .eq('user_id', user.id);

  if (studentsError) throw new Error('Failed to fetch students');

  // 3. Fetch ALL Exams for this user
  const { data: exams, error: examsError } = await supabase
    .from('exams')
    .select('id, title, term, discipline')
    .eq('user_id', user.id);

  if (examsError) throw new Error('Failed to fetch exams');

  const examIds = exams?.map((e) => e.id) || [];

  // 4. Fetch ALL Results
  let results: { exam_id: string | null; student_id: string | null; score: number | null }[] = [];
  if (examIds.length > 0) {
    const { data: examResults, error: resultsError } = await supabase
      .from('exam_results')
      .select('exam_id, student_id, score')
      .in('exam_id', examIds);
    
    if (resultsError) throw new Error('Failed to fetch results');
    results = examResults || [];
  }

  // 5. Fetch exam-class relationships
  const { data: examClassesRefs, error: refsError } = await supabase
    .from('exam_classes')
    .select('exam_id, class_id')
    .in('exam_id', examIds);

  if (refsError) throw new Error('Failed to fetch exam class references');

  // 6. Fetch ALL Attendance records for these classes
  const classIds = classes?.map(c => c.id) || [];
  let attendanceData: { student_id: string; status: string }[] = [];
  if (classIds.length > 0) {
    const { data: attendance, error: attendanceError } = await supabase
      .from('class_attendance')
      .select('student_id, status')
      .in('class_id', classIds);
    
    if (attendanceError) {
       console.error('Error fetching attendance:', attendanceError);
    } else {
      attendanceData = attendance || [];
    }
  }

  // 7. Calculate Averages per Class based on CURRENT term
  const classesWithGrades = (classes || []).map((cls) => {
    const classStudents = (students || []).filter((s) => s.class_id === cls.id);
    
    let currentTerm = term;
    if (!currentTerm) {
      // Determine the current term for this class
      const periodStarts = (cls.period_starts || []) as string[];
      const periodType = cls.period_type || 'bimestre';
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      let currentTermIndex = 0;
      for (let i = periodStarts.length - 1; i >= 0; i--) {
        if (todayStr >= periodStarts[i]) {
          currentTermIndex = i;
          break;
        }
      }
      
      currentTerm = `${currentTermIndex + 1}_${periodType}`;
    }
    
    // Filter exams that are in the current term AND linked to this class
    const classTermExams = (exams || []).filter(e => {
      const isCorrectTerm = e.term === currentTerm;
      const isLinkedToClass = (examClassesRefs || []).some(ref => ref.exam_id === e.id && ref.class_id === cls.id);
      return isCorrectTerm && isLinkedToClass;
    });
    
    const classTermExamIds = classTermExams.map(e => e.id);
    
    const classDefinedDisciplines = cls.disciplines || [];
    const examDisciplines = classTermExams.map((e) => e.discipline).filter((d): d is string => !!d);
    const allClassDisciplines = Array.from(new Set([...classDefinedDisciplines, ...examDisciplines])).sort();

    const studentsWithGrades = classStudents.map((student) => {
      const studentResults = results.filter((r) => r.student_id === student.id && classTermExamIds.includes(r.exam_id || ''));
      
      const disciplineGrades: Record<string, number | null> = {};
      const disciplineExamDetails: Record<string, { exam_title: string; score: number }[]> = {};

      allClassDisciplines.forEach(discipline => {
        const disciplineExams = classTermExams.filter((e) => e.discipline === discipline);
        const disciplineExamIds = disciplineExams.map((e) => e.id);
        const disciplineResults = studentResults.filter(r => disciplineExamIds.includes(r.exam_id || ''));
        
        disciplineExamDetails[discipline] = disciplineResults.map(res => ({
          exam_title: disciplineExams.find((e) => e.id === res.exam_id)?.title || 'Prova',
          score: Number(res.score) || 0
        }));

        if (disciplineResults.length > 0) {
          const examsConfig = (cls.exams_config || {}) as Record<string, number>;
          const sum = disciplineResults.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
          const divisor = examsConfig[discipline] || 4;
          disciplineGrades[discipline] = parseFloat((sum / divisor).toFixed(2));
        } else {
          disciplineGrades[discipline] = null;
        }
      });
      
      const examsConfig = (cls.exams_config || {}) as Record<string, number>;

      // Calculate General Average
      let average = null;
      if (studentResults.length > 0) {
        const sum = studentResults.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
        
        // Sum of exams count configured for all disciplines in this class (from exams_config)
        const totalExamsConfig = allClassDisciplines.reduce((acc, disc) => {
          return acc + (examsConfig[disc] || 4);
        }, 0);

        const divisor = totalExamsConfig || studentResults.length || 1;
        average = parseFloat((sum / divisor).toFixed(2));
      }

      // Calculate Frequency
      const studentAttendance = attendanceData.filter(a => a.student_id === student.id);
      const totalClasses = studentAttendance.length;
      const presences = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const frequency = totalClasses > 0 ? parseFloat((presences / totalClasses * 100).toFixed(2)) : null;

      // Determine Status
      let status: 'Aprovado' | 'Reprovado' | 'Reprovado por Falta' | 'Pendente' = 'Pendente';
      
      if (frequency !== null || average !== null) {
        const hasFailedByFrequency = frequency !== null && frequency < (cls.min_frequency || 75);
        const hasFailedByGrade = average !== null && average < (cls.passing_grade || 6.0);

        if (hasFailedByFrequency) {
          status = 'Reprovado por Falta';
        } else if (hasFailedByGrade) {
          status = 'Reprovado';
        } else if (average !== null && frequency !== null) {
          status = 'Aprovado';
        }
      }

      return {
        id: student.id,
        name: student.name,
        discipline_grades: disciplineGrades,
        discipline_exam_details: disciplineExamDetails,
        average,
        frequency,
        status,
      };
    });

    return {
      ...cls,
      students_with_grades: studentsWithGrades,
      disciplines: allClassDisciplines,
    };
  });

  return classesWithGrades as ClassWithGrades[];
}

// ... (previous code above is fine, just fixing the end)

export async function getExamsByClassAction(classId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('exam_classes')
    .select('exam:exams(*)')
    .eq('class_id', classId);

  if (error) {
    console.error('Error fetching class exams:', error);
    return [];
  }

  // Flatten the result to return just the exam objects
  return (data as unknown as { exam: ExamRow }[] || []).map((item) => item.exam).filter(Boolean);
}

export async function getClassDisciplineAnalyticsAction(
  classId: string,
  startDate?: string,
  endDate?: string,
  term?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 1. Get class details for predefined disciplines
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('disciplines')
    .eq('id', classId)
    .single();

  if (classError) return { success: false, error: 'Erro ao buscar dados da turma' };

  const classDisciplines = classData?.disciplines || [];

  // 2. Get exams linked to this class
  const { data: examRefs, error: refError } = await supabase
    .from('exam_classes')
    .select('exam_id')
    .eq('class_id', classId);

  if (refError || !examRefs) return { success: false, error: 'Erro ao buscar provas da turma' };

  const examIds = (examRefs || []).map((r) => r.exam_id);
  
  // 3. Initialize disciplineGrades with all class disciplines
  const disciplineGrades: Record<string, { total: number; count: number }> = {};
  classDisciplines.forEach((d: string) => {
    disciplineGrades[d] = { total: 0, count: 0 };
  });

  if (examIds.length > 0) {
    // 4. Get exams details (discipline) and their results
    let examsQuery = supabase
      .from('exams')
      .select('id, discipline, term, created_at')
      .in('id', examIds);
    
    if (term) {
      examsQuery = examsQuery.eq('term', term);
    }
    if (startDate) {
      examsQuery = examsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      // Add one day to endDate to include the full day
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      examsQuery = examsQuery.lt('created_at', end.toISOString().split('T')[0]);
    }

    const { data: exams, error: examsError } = await examsQuery;

    if (examsError) return { success: false, error: 'Erro ao buscar disciplinas' };

    // Filter examIds to only those that matched the filters
    const filteredExamIds = (exams || []).map((e: { id: string }) => e.id);

    if (filteredExamIds.length === 0) {
      return { success: true, data: Object.entries(disciplineGrades).map(([discipline]) => ({ discipline, average: 0 })) };
    }

    const { data: results, error: resultsError } = await supabase
      .from('exam_results')
      .select('exam_id, score')
      .in('exam_id', filteredExamIds);

    if (resultsError) return { success: false, error: 'Erro ao buscar resultados' };

    // 5. Aggregate results
    (results || []).forEach((res) => {
      const exam = (exams || []).find((e) => e.id === res.exam_id);
      const discipline = exam?.discipline || 'Outros';
      
      if (!disciplineGrades[discipline]) {
        disciplineGrades[discipline] = { total: 0, count: 0 };
      }
      disciplineGrades[discipline].total += Number(res.score) || 0;
      disciplineGrades[discipline].count += 1;
    });
  }

  const chartData = Object.entries(disciplineGrades).map(([discipline, stats]) => ({
    discipline,
    average: stats.count > 0 ? parseFloat((stats.total / stats.count).toFixed(2)) : 0
  })).sort((a, b) => a.discipline.localeCompare(b.discipline));

  return { success: true, data: chartData };
}

