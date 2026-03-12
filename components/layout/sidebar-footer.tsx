'use client';

import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { PricingDialog } from '@/components/subscription/pricing-dialog';
import { useState } from 'react';

interface SidebarFooterProps {
  isPro?: boolean;
}

export function SidebarFooter({
  isPro = false,
}: SidebarFooterProps) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className="p-4 mt-auto border-t border-border/10">
      <div className="bg-card/50 rounded-lg p-4 space-y-3 border border-border/50">
        <div className="flex justify-center items-center text-sm font-medium">
          <span>{isPro ? 'Plano Pro' : 'Plano Gratuito'}</span>
        </div>

        {!isPro ? (
          <PricingDialog
            isOpen={isPricingOpen}
            onOpenChange={setIsPricingOpen}
            trigger={
              <Button
                className="w-full text-xs font-bold gap-2 active:scale-95 transition-transform"
                size="sm"
              >
                <Zap className="h-3 w-3 fill-current" />
                Fazer Upgrade
              </Button>
            }
          />
        ) : (
          <div className="text-xs text-muted-foreground text-center">
            Sua assinatura está ativa. Aproveite todos os recursos ilimitados.
          </div>
        )}
      </div>
    </div>
  );
}
