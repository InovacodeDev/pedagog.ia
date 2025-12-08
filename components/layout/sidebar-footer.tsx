'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { PricingDialog } from '@/components/subscription/pricing-dialog';
import { useState } from 'react';

interface SidebarFooterProps {
  usageCount?: number;
  usageLimit?: number;
  isPro?: boolean;
}

export function SidebarFooter({
  usageCount = 7, // Mock default
  usageLimit = 10, // Mock default
  isPro = false,
}: SidebarFooterProps) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const percentage = Math.min((usageCount / usageLimit) * 100, 100);
  const isLimitReached = usageCount >= usageLimit;

  return (
    <div className="p-4 mt-auto border-t border-border/10">
      <div className="bg-card/50 rounded-lg p-4 space-y-3 border border-border/50">
        <div className="flex justify-between items-center text-xs font-medium">
          <span>{isPro ? 'Plano Pro' : 'Plano Gratuito'}</span>
          {!isPro && (
            <span className={isLimitReached ? 'text-destructive' : 'text-muted-foreground'}>
              {usageCount}/{usageLimit} Provas
            </span>
          )}
        </div>

        {!isPro ? (
          <>
            <Progress value={percentage} className="h-2" />

            <PricingDialog
              isOpen={isPricingOpen}
              onOpenChange={setIsPricingOpen}
              trigger={
                <Button
                  className={`w-full text-xs font-bold gap-2 active:scale-95 transition-transform ${isLimitReached ? 'animate-pulse' : ''}`}
                  size="sm"
                >
                  <Zap className="h-3 w-3 fill-current" />
                  Fazer Upgrade
                </Button>
              }
            />
          </>
        ) : (
          <div className="text-xs text-muted-foreground">
            Sua assinatura está ativa. Aproveite todos os recursos ilimitados.
          </div>
        )}
      </div>
    </div>
  );
}
