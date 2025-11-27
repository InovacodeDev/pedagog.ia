import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { GlobalJobListener } from '@/components/layout/global-job-listener';

import { getSubscriptionPlan } from '@/lib/subscription';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { isPro } = await getSubscriptionPlan();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <GlobalJobListener />
      <div className="fixed inset-0 flex w-full overflow-hidden bg-[hsl(var(--sidebar-bg))] text-foreground transition-colors duration-300">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar isPro={!!isPro} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex flex-col m-2 mt-0 bg-background rounded-2xl overflow-hidden shadow-xl ring-1 ring-border">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
