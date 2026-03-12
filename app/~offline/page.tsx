'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Offline fallback page displayed by the Service Worker
 * when the user tries to navigate without internet connectivity.
 */
export default function OfflinePage(): React.ReactElement {
  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Sem Conexão</h1>
        <p className="max-w-sm text-muted-foreground">
          Parece que você está offline. Verifique sua conexão com a internet e tente novamente.
        </p>
      </div>
      <Button onClick={handleRetry} size="lg" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar Novamente
      </Button>
    </div>
  );
}
