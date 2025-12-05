'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  created_at: string;
  status: string;
  questions_list: unknown[];
  correction_count: number;
}

interface ClassExamsListProps {
  exams: Exam[];
}

export function ClassExamsList({ exams }: ClassExamsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Questões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhuma prova vinculada a esta turma.
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{((exam.questions_list as unknown[])?.length ?? 2) - 2}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {exam.correction_count > 0 ? (
                      <Badge variant="destructive" className="flex gap-1 items-center">
                        <Lock className="h-3 w-3" /> Travada
                      </Badge>
                    ) : exam.status === 'published' ? (
                      <Badge className="bg-green-600">Pronta</Badge>
                    ) : (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{new Date(exam.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/exams/${exam.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
