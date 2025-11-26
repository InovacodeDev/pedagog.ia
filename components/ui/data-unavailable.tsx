'use client';

import { AlertCircle, LucideIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataUnavailableProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
}

export function DataUnavailable({
  title = 'Não foi possível carregar os dados',
  message = 'Houve um problema de comunicação com o banco de dados. Tente novamente mais tarde.',
  icon: Icon = AlertCircle,
}: DataUnavailableProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <Icon className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{message}</p>
      <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Recarregar Página
      </Button>
    </div>
  );
}
