'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  actionOnClick?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  actionOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-muted/50 p-4 rounded-full mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <>
          {actionLink ? (
            <Button asChild>
              <Link href={actionLink}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button onClick={actionOnClick}>{actionLabel}</Button>
          )}
        </>
      )}
    </div>
  );
}
