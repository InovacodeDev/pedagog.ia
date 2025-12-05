'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Users, Camera, Settings, FileQuestion } from 'lucide-react';
import { SidebarFooter } from '@/components/layout/sidebar-footer';

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/home',
    color: 'text-sky-500',
  },
  {
    label: 'Questões',
    icon: FileQuestion,
    href: '/questions',
    color: 'text-emerald-500',
  },
  {
    label: 'Provas',
    icon: FileText,
    href: '/exams',
    color: 'text-violet-500',
  },
  {
    label: 'Minhas Turmas',
    icon: Users,
    href: '/classes',
    color: 'text-pink-700',
  },
  {
    label: 'Correção',
    icon: Camera,
    href: '/scan',
    color: 'text-orange-700',
    disabled: true, // Added for disabled state
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
  },
];

interface SidebarProps {
  isPro?: boolean;
}

export function Sidebar({ isPro = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] transition-colors duration-300">
      <div className="px-3 py-2 flex-1">
        <Link href="/home" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <div className="bg-primary rounded-full w-full h-full flex items-center justify-center text-primary-foreground font-bold">
              P
            </div>
          </div>
          <h1 className="text-2xl font-bold">Pedagogi.ai</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);

            if (route.disabled) {
              return (
                <div
                  key={route.href}
                  className={cn(
                    'text-sm group flex p-3 w-full justify-start font-medium cursor-not-allowed rounded-lg opacity-50',
                    'text-[hsl(var(--sidebar-fg))]/70'
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className="h-5 w-5 mr-3 text-current" />
                    {route.label}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 hover:translate-x-1',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-accent))] text-primary'
                    : 'text-[hsl(var(--sidebar-fg))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-fg))]'
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon
                    className={cn('h-5 w-5 mr-3', isActive ? 'text-primary' : 'text-current')}
                  />
                  {route.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <SidebarFooter isPro={isPro} />
    </div>
  );
}
