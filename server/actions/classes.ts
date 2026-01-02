'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ClassItem {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
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

  // TODO: Refactor 'any' to strict type [Jules] - 'students' relation missing in DB types
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data, error } = await (supabase as any)
    .from('classes')
    .select('*, students(count)')
    .eq('user_id', user.id)
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

  return data;
}

export async function createClassAction(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const { error } = await supabase.from('classes').insert({
    name,
    user_id: user.id,
  });

  if (error) {
    console.error('Error creating class:', error);
    return { success: false, message: 'Failed to create class' };
  }

  revalidatePath('/classes');
  return { success: true, message: 'Turma criada com sucesso!' };
}

export async function updateClassAction(id: string, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('classes')
    .update({ name })
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
  // TODO: Refactor 'any' to strict type [Jules] - 'students' relation missing in DB types
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { count, error: countError } = await (supabase as any)
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

// ... (previous code)

export interface StudentGradeInfo {
  id: string;
  name: string;
  average: number | null;
}

export interface ClassWithGrades extends ClassItem {
  students_with_grades: StudentGradeInfo[];
}

export async function getClassesWithGradesAction(term: string = '1_bimestre') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Fetch Classes
  // TODO: Refactor 'any' to strict type [Jules] - 'students' relation missing in DB types
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: classes, error: classesError } = await (supabase as any)
    .from('classes')
    .select('*, students(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (classesError) throw new Error('Failed to fetch classes');

  // 2. Fetch Students
  // TODO: Refactor 'any' to strict type [Jules] - 'students' relation missing in DB types
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: studentsRaw, error: studentsError } = await (supabase as any)
    .from('students')
    .select('id, name, class_id')
    // TODO: Refactor 'any' to strict type [Jules] - 'students' relation missing in DB types
    .eq('user_id', user.id);

  if (studentsError) throw new Error('Failed to fetch students');

  // 3. Fetch Exams for the Term
  const { data: exams, error: examsError } = await supabase
    .from('exams')
    .select('id, term' as any) // term is not in types? exams table has discipline, grade_level, but no term?
    // Types: exams has title, description, discipline, grade_level, status, etc. NO TERM.
    // So 'term' is also missing in types.
    .eq('user_id', user.id)
    // .eq('term', term); // If term is missing, this is also 'any' territory.
    // TODO: Refactor 'any' to strict type [Jules] - 'term' column missing in DB types
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    .eq('term', term);

  if (examsError) throw new Error('Failed to fetch exams');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const examIds = (exams as any[]).map((e: any) => e.id);

  // 4. Fetch Results if there are exams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any[] = [];
  if (examIds.length > 0) {
    const { data: examResults, error: resultsError } = await supabase
      .from('exam_results')
      .select('exam_id, student_id, score')
      .in('exam_id', examIds);
    
    if (resultsError) throw new Error('Failed to fetch results');
    results = examResults || [];
  }

  // 5. Calculate Averages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classesWithGrades = (classes as any[]).map((cls: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classStudents = (studentsRaw || []).filter((s: any) => s.class_id === cls.id);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentsWithGrades = classStudents.map((student: any) => {
      // Find all results for this student in the fetched exams (which are already filtered by term)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentResults = results.filter((r: any) => r.student_id === student.id);
      
      let average = null;
      if (studentResults.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sum = studentResults.reduce((acc: number, curr: any) => acc + (Number(curr.score) || 0), 0);
        average = parseFloat((sum / studentResults.length).toFixed(1));
      }

      return {
        id: student.id,
        name: student.name,
        average,
      };
    });

    return {
      ...cls,
      students_with_grades: studentsWithGrades,
    };
  });

  return classesWithGrades as ClassWithGrades[];
}

export async function getExamsByClassAction(classId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // TODO: Refactor 'any' to strict type [Jules] - 'exam' relation missing in DB types (joined)
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data, error } = await (supabase as any)
    .from('exam_classes')
    .select('exam:exams(*)')
    .eq('class_id', classId);

  if (error) {
    console.error('Error fetching class exams:', error);
    return [];
  }

  // Flatten the result to return just the exam objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => item.exam).filter(Boolean);
}
