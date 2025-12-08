import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Camera, Wand2, ArrowRight } from 'lucide-react';
import { getDashboardMetrics } from '@/server/actions/dashboard';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardRealtimeMetrics } from '@/components/dashboard/realtime-metrics';

export default async function DashboardPage() {
  const { data } = await getDashboardMetrics();

  // Fallback values if data is undefined (though action handles it, extra safety)
  const metrics = data || {
    examsCount: 0,
    questionsCount: 0,
    correctionsCount: 0,
    timeSavedHours: 0,
    recentExams: [],
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Painel</h1>
        <p className="text-muted-foreground">Visão geral da sua atividade e produtividade.</p>
      </div>

      {/* Top Row: Stats Cards */}
      <DashboardRealtimeMetrics initialMetrics={metrics} />

      {/* Middle Row */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity (Left 2/3 -> 5/7 cols) */}
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentExams.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                title="Nenhuma atividade recente"
                description="Você ainda não criou nenhuma prova. Comece agora!"
                actionLabel="Criar Prova"
                actionLink="/exams/builder"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prova</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Correções</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentExams.map((exam) => (
                    <TableRow key={exam.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>
                        <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                          {exam.status === 'published' ? 'Pronta' : 'Rascunho'}
                        </Badge>
                      </TableCell>
                      <TableCell>{exam.correction_count}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {exam.created_at ? new Date(exam.created_at).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (Right 1/3 -> 2/7 cols) */}
        <Card className="col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Atalhos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              asChild
              className="w-full justify-start active:scale-95 transition-transform"
              size="lg"
            >
              <Link href="/exams/builder">
                <Plus className="mr-2 h-4 w-4" /> Nova Prova
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start active:scale-95 transition-transform"
              size="lg"
            >
              <Link href="/scan">
                <Camera className="mr-2 h-4 w-4" /> Escanear Provas
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full justify-start active:scale-95 transition-transform"
              size="lg"
            >
              <Link href="/questions/generator">
                <Wand2 className="mr-2 h-4 w-4" /> Gerar Questões
              </Link>
            </Button>
            <div className="pt-4 border-t mt-2">
              <Button asChild variant="ghost" className="w-full justify-between group">
                <Link href="/exams">
                  Ver todas as provas
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
