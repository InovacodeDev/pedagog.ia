'use client';

import { Invoice } from '@/server/queries/get-invoices';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Receipt } from 'lucide-react';
import { createPortalSessionAction } from '@/server/actions/stripe';
import { toast } from 'sonner';

interface InvoicesListProps {
  invoices: Invoice[];
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const handlePortalSession = async () => {
    try {
      const { url } = await createPortalSessionAction();
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Erro ao redirecionar para o portal de faturamento.');
      }
    } catch {
      toast.error('Erro ao criar sessão do portal.');
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center space-y-4">
        <div className="p-3 bg-muted rounded-full">
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">Nenhuma fatura encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Você ainda não possui faturas registradas.
          </p>
        </div>
        <Button variant="outline" onClick={handlePortalSession}>
          Gerenciar Assinatura e Pagamentos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{new Date(invoice.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(invoice.amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    className={
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : ''
                    }
                  >
                    {invoice.status === 'paid' ? 'Pago' : invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {invoice.pdfUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={handlePortalSession}>
          Ver todas as faturas no Stripe
        </Button>
      </div>
    </div>
  );
}
