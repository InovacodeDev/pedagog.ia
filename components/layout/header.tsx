'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
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
        <ThemeToggle />
        <UserNav />
      </div>
    </div>
  );
}
