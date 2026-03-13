'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ExamAnalytics } from '@/server/actions/get-exam-analytics';
import { Users, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ExamAnalyticsProps {
  analytics: ExamAnalytics;
}

export function ExamAnalyticsComponent({ analytics }: ExamAnalyticsProps) {
  const {
    students,
    questions,
    totalStudents,
    averageScore,
    isGradedOnPlatform,
  } = analytics;

  const chartData = questions.map((q) => ({
    name: `Q${q.questionNumber}`,
    rate: Math.round(q.successRate),
    correct: q.correctCount,
    incorrect: q.incorrectCount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Alunos que realizaram a prova</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Nota média final</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correção</CardTitle>
            {isGradedOnPlatform ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isGradedOnPlatform ? 'Plataforma' : 'Manual'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isGradedOnPlatform 
                ? 'Dados detalhados disponíveis' 
                : 'Apenas notas gerais disponíveis'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Performance Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Desempenho por Questão</CardTitle>
            <CardDescription>
              Média de acertos por cada questão da prova.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {!isGradedOnPlatform ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                Analytics detalhado disponível apenas para provas corrigidas na plataforma.
              </div>
            ) : questions.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado de questão encontrado.
                </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Acertos']}
                      labelFormatter={(label) => `Questão ${label.replace('Q', '')}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.rate > 70 ? 'var(--chart-1, #22c55e)' : entry.rate > 40 ? 'var(--chart-2, #eab308)' : 'var(--chart-3, #ef4444)'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Errors / Insights */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Insights & Erros Comuns</CardTitle>
            <CardDescription>O que os alunos mais erraram.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isGradedOnPlatform ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground px-6">
                  Insights automáticos requerem correção via Pedagog.IA para identificar padrões de erro.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions
                  .filter((q) => q.successRate < 50)
                  .sort((a, b) => a.successRate - b.successRate)
                  .slice(0, 5)
                  .map((q) => (
                    <div key={q.questionNumber} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Questão {q.questionNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Apenas {Math.round(q.successRate)}% de acerto.
                        </p>
                        {q.mostCommonError && (
                          <p className="text-xs font-medium text-destructive">
                            Erro comum: &quot;{q.mostCommonError}&quot;
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">
                        Crítica
                      </Badge>
                    </div>
                  ))}
                {questions.filter((q) => q.successRate < 50).length === 0 && (
                     <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <p className="text-sm text-muted-foreground">
                            Excelente desempenho! Nenhuma questão com menos de 50% de acerto.
                        </p>
                    </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos e Notas</CardTitle>
          <CardDescription>Lista completa de alunos que realizaram esta prova.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Aluno</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Data de Realização</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum aluno realizou esta prova ainda.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant={student.score >= 6 ? 'secondary' : 'destructive'} className={student.score >= 6 ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                        {student.score.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(student.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{student.score >= 6 ? 'Aprovado' : 'Abaixo da média'}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
