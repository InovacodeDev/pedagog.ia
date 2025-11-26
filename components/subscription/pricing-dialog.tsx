'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createCheckoutSessionAction } from '@/server/actions/stripe';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PricingDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PricingDialog({ trigger, isOpen, onOpenChange }: PricingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { url } = await createCheckoutSessionAction();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Erro ao iniciar checkout. Tente novamente.');
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Desbloqueie todo o potencial da Pedagogi.ai
          </DialogTitle>
          <DialogDescription className="text-center">
            Escolha o plano ideal para suas necessidades
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Free Plan */}
          <div className="border rounded-lg p-6 flex flex-col gap-4 opacity-70 bg-muted/50">
            <div>
              <h3 className="font-semibold text-lg">Gratuito</h3>
              <p className="text-sm text-muted-foreground">Para começar</p>
            </div>
            <div className="text-2xl font-bold">R$ 0</div>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" /> 10 Correções/mês
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Recursos Básicos
              </li>
            </ul>
            <Button variant="outline" disabled className="mt-auto">
              Plano Atual
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-indigo-500 rounded-lg p-6 flex flex-col gap-4 relative bg-card">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Recomendado
            </div>
            <div>
              <h3 className="font-semibold text-lg text-indigo-600">Pro</h3>
              <p className="text-sm text-muted-foreground">Para professores</p>
            </div>
            <div className="text-2xl font-bold">
              R$ 29,90 <span className="text-sm font-normal text-muted-foreground">/ mês</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-500" /> Ilimitado
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-500" /> IA Avançada
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-500" /> Suporte Prioritário
              </li>
            </ul>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Assinar Agora'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
