import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditUsageLog } from '@/server/queries/get-credit-usage';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditUsageListProps {
  logs: CreditUsageLog[];
  balance: number;
}

export function CreditUsageList({ logs, balance }: CreditUsageListProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Saldo Atual</CardTitle>
            <CardDescription>Seus créditos disponíveis para uso de IA</CardDescription>
          </div>
          <Coins className="h-8 w-8 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{balance} créditos</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consumo</CardTitle>
          <CardDescription>Veja como seus créditos foram utilizados</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Zap className="h-8 w-8 mb-2 opacity-50" />
              <p>Nenhum consumo registrado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Funcionalidade</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-right">Tokens (Entrada/Saída)</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "dd 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{formatFeatureName(log.feature)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {formatModelName(log.model_used)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {log.input_tokens} / {log.output_tokens}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        log.cost_credits < 0
                          ? 'text-green-600'
                          : log.cost_credits > 0
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {log.cost_credits < 0
                        ? `+${Math.abs(log.cost_credits)}`
                        : log.cost_credits > 0
                          ? `-${log.cost_credits}`
                          : '0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatFeatureName(feature: string): string {
  const map: Record<string, string> = {
    generate_questions: 'Geração de Questões',
    generate_questions_v2: 'Geração de Questões (IA)',
    generate_plan: 'Plano de Aula',
    chat: 'Chat IA',
    correction: 'Correção Automática',
    generate_exam_db: 'Geração de Prova Inteligente',
    credit_purchase: 'Compra de Créditos',
    monthly_renewal: 'Renovação Mensal',
  };
  return map[feature] || feature;
}

function formatModelName(model: string): string {
  const map: Record<string, string> = {
    'gemini-2.5-flash': 'Gemini Flash',
    'gemini-2.5-pro': 'Gemini Pro',
    db_selection: 'Banco de Questões',
    stripe_topup: 'Recarga',
    plan_pro: 'Plano Pro',
  };
  return map[model] || model;
}
