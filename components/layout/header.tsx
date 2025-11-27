'use client';

import { Menu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { TopUpModal } from '@/components/credits/top-up-modal';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tables } from '@/types/database';

export function Header() {
  const [credits, setCredits] = useState<number | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchCredits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('subscriptions')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCredits((data as Tables<'subscriptions'>).credits_balance);
      }
    };

    fetchCredits();

    const channel = supabase
      .channel('credits-update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subscriptions',
        },
        (payload) => {
          setCredits((payload.new as Tables<'subscriptions'>).credits_balance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex items-center p-4 h-16 text-zinc-400">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex w-full justify-end items-center gap-2">
        {credits !== null && (
          <Badge
            variant="outline"
            className={cn(
              'cursor-pointer gap-1 transition-colors hover:bg-accent',
              credits < 5
                ? 'border-red-500 text-red-500 hover:bg-red-500/10'
                : 'border-primary text-primary hover:bg-primary/10'
            )}
            onClick={() => setShowTopUp(true)}
          >
            <Zap className="h-3 w-3 fill-current" />
            {credits.toFixed(1)} Créditos
          </Badge>
        )}
        <ThemeToggle />
        <UserNav />
      </div>

      <TopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
    </div>
  );
}
