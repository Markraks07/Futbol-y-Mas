import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'bordered';
  hoverEffect?: boolean;
}

export function Card({ className, variant = 'default', hoverEffect = false, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-fym-card border border-fym-border rounded-xl p-5',
    panel: 'bg-fym-panel border border-fym-border rounded-2xl p-6 shadow-xl shadow-black/40',
    bordered: 'bg-transparent border border-fym-border rounded-xl p-5',
  };

  return (
    <div
      className={cn(
        variants[variant],
        hoverEffect && 'transition-all duration-300 hover:border-fym-accent/50 hover:shadow-lg hover:shadow-red-950/20 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  className,
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: 'default' | 'accent' | 'gold' | 'admin' | 'live';
  children: React.ReactNode;
}) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    accent: 'bg-red-500/10 text-red-400 border-red-500/30',
    gold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    admin: 'bg-fym-accent/20 text-fym-accent border-fym-accent/40 font-bold',
    live: 'bg-red-600 text-white font-bold animate-pulse',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
