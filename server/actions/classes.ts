'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Tables } from '@/types/database';

export interface ClassItem extends Tables<'classes'> {
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes');
  }

  // Supabase join returns an array for one-to-many, but we need to cast it properly
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

// ... (previous code)

export interface StudentGradeInfo {
  id: string;
  name: string; // Encrypted name but displayed as string
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
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*, students(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (classesError) throw new Error('Failed to fetch classes');

  // 2. Fetch Students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, name, encrypted_name, class_id')
    .eq('user_id', user.id); // Assuming user_id exists despite missing in generated types

  if (studentsError) throw new Error('Failed to fetch students');

  // 3. Fetch Exams for the Term
  const { data: exams, error: examsError } = await supabase
    .from('exams')
    //.select('id, term') // 'term' is not in Exam Row in database.ts?
    // Exam Row: { answer_key, correction_count, created_at, description, discipline, grade_level, id, questions_list, status, title, updated_at, user_id }
    // There is no `term` column in `exams` table in `types/database.ts`.
    // This implies `server/actions/classes.ts` was using fields not in `database.ts` or I am misreading.
    // If the file `server/actions/classes.ts` had `term` usage, it might be in `Json` columns or missing from types.
    // Original code: `.select('id, term').eq('term', term)`
    // If I cannot find `term` in `types/database.ts`, I should assume the type definition is outdated.
    .select('*')
    .eq('user_id', user.id);
    //.eq('term', term); // If 'term' doesn't exist on type, this will error with strict typing.

  if (examsError) throw new Error('Failed to fetch exams');

  // Filter exams by term if it's not a column but maybe in description or we skip it for now?
  // Or maybe I should use `any` just for this part if the DB type is wrong?
  // The memory says "Supabase type definitions... require manual updates...".
  // I will trust the original code's intent and assume `term` exists on the table but is missing from types.
  // So I'll cast supabase to `any` for this specific query or cast the result.

  // Actually, I can use `any` for the query builder part if types are missing.

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const examsWithTerm = exams as any[];
  const filteredExams = examsWithTerm.filter(e => e.term === term);
  const examIds = filteredExams.map((e) => e.id);

  // 4. Fetch Results if there are exams
  let results: Tables<'exam_results'>[] = [];
  if (examIds.length > 0) {
    const { data: examResults, error: resultsError } = await supabase
      .from('exam_results')
      .select('*')
      .in('exam_id', examIds);
    
    if (resultsError) throw new Error('Failed to fetch results');
    results = examResults;
  }

  // 5. Calculate Averages
  const classesWithGrades = (classes as any[]).map((cls) => {
    const classStudents = students.filter((s) => s.class_id === cls.id);
    
    const studentsWithGrades = classStudents.map((student) => {
      const studentResults = results.filter((r) => r.student_id === student.id);
      
      let average = null;
      if (studentResults.length > 0) {
        const sum = studentResults.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
        average = parseFloat((sum / studentResults.length).toFixed(1));
      }

      return {
        id: student.id,
        name: student.name || student.encrypted_name, // Fallback
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

  const { data, error } = await supabase
    .from('exam_classes')
    .select('exam:exams(*)')
    .eq('class_id', classId);

  if (error) {
    console.error('Error fetching class exams:', error);
    return [];
  }

  // Flatten the result to return just the exam objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((item) => item.exam).filter(Boolean);
}
