'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { PricingDialog } from '@/components/subscription/pricing-dialog';
import { createPortalSessionAction } from '@/server/actions/stripe';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SettingsBillingProps {
  isPro?: boolean;
  subscription?: {
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  } | null;
}

export function SettingsBilling({ isPro = false, subscription }: SettingsBillingProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Mock usage data for now, can be fetched similarly if needed
  const usage = 3;
  const limit = 10;

  const handleManageSubscription = async () => {
    try {
      setIsLoadingPortal(true);
      const { url } = await createPortalSessionAction();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Erro ao abrir portal de assinatura.');
      console.error(error);
      setIsLoadingPortal(false);
    }
  };

  const showCancellationAlert =
    subscription?.cancel_at_period_end && subscription?.status === 'active';
  const formattedDate = subscription?.current_period_end
    ? new Intl.DateTimeFormat('pt-BR').format(new Date(subscription.current_period_end))
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinatura</CardTitle>
        <CardDescription>Gerencie seu plano e cobrança.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showCancellationAlert && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Renovação Cancelada</AlertTitle>
            <AlertDescription>
              Sua assinatura permanecerá ativa até <strong>{formattedDate}</strong>. Após essa data,
              sua conta voltará para o plano gratuito.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Plano Atual</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isPro ? 'Pedagogi Pro' : 'Pedagogi Gratuito'}
                </span>
                <Badge variant={isPro ? 'default' : 'secondary'}>
                  {isPro ? 'Pro' : 'Gratuito'}
                </Badge>
              </div>
            </div>
          </div>

          {isPro ? (
            <Button variant="outline" onClick={handleManageSubscription} disabled={isLoadingPortal}>
              {isLoadingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Gerenciar Assinatura
            </Button>
          ) : (
            <PricingDialog
              isOpen={isPricingOpen}
              onOpenChange={setIsPricingOpen}
              trigger={
                <Button className="gap-2">
                  <Zap className="h-4 w-4" /> Fazer Upgrade
                </Button>
              }
            />
          )}
        </div>

        {!isPro && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso de Provas (Mensal)</span>
              <span className="text-muted-foreground">
                {usage} / {limit}
              </span>
            </div>
            <Progress value={(usage / limit) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Faça upgrade para gerar provas ilimitadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
