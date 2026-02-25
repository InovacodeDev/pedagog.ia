import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  className,
  iconOnly = false,
  iconClassName,
  textClassName,
  ...props
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('w-8 h-8 shrink-0', iconClassName)}
      >
        <defs>
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="120" fill="url(#primaryGrad)" />
        <path
          d="M192 160 L192 352"
          stroke="#ffffff"
          strokeWidth="48"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M192 160 C280 160 352 192 352 248 C352 304 280 336 192 336"
          fill="none"
          stroke="#ffffff"
          strokeWidth="48"
          strokeLinecap="round"
        />
        <path
          d="M352 144 Q384 144 384 112 Q384 144 416 144 Q384 144 384 176 Q384 144 352 144 Z"
          fill="#ffffff"
        />
        <path
          d="M384 272 Q400 272 400 256 Q400 272 416 272 Q400 272 400 288 Q400 272 384 272 Z"
          fill="#e2e8f0"
        />
      </svg>
      {!iconOnly && (
        <span
          className={cn(
            'text-xl font-bold tracking-tighter text-indigo-600 dark:text-indigo-400',
            textClassName
          )}
        >
          Pedagog.IA
        </span>
      )}
    </div>
  );
}
