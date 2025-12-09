'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle(): React.JSX.Element {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState<boolean>(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="opacity-0">
        <span className="sr-only">Carregando tema</span>
      </Button>
    );
  }

  const isDark: boolean = resolvedTheme === 'dark';

  const toggleTheme = (): void => {
    const newTheme = isDark ? 'light' : 'dark';

    // Use View Transitions API if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((document as any).startViewTransition) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).startViewTransition(() => {
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden"
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {/* Sun Icon: 
          - Active (Dark): Translate Y 0 (Center)
          - Inactive (Light): Translate Y -100% (Top) -> Enters from top falling down
      */}
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 absolute
          ${isDark ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}
      />

      {/* Moon Icon: 
          - Active (Light): Translate Y 0 (Center)
          - Inactive (Dark): Translate Y 100% (Bottom) -> Exits to bottom falling down
      */}
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 absolute
          ${isDark ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
        `}
      />

      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
