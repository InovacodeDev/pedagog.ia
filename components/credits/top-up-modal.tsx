'use client';

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { buyCreditsAction } from '@/server/actions/credits';

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyCredits = async () => {
    if (amount < 10) {
      toast.error('O valor mínimo é de 10 créditos.');
      return;
    }

    setIsLoading(true);
    try {
      const { url } = await buyCreditsAction(amount);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error buying credits:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recarregar Créditos</DialogTitle>
          <DialogDescription>
            Adicione créditos à sua conta para continuar usando os recursos de IA.
            <br />
            <strong>1 Crédito = R$ 1,00</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Quantidade
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
              min={10}
            />
          </div>
          <div className="flex justify-end text-sm font-medium text-muted-foreground">
            Total:{' '}
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBuyCredits} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar com Stripe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
