import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-fade-up", className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-2xl bg-[var(--accent-cyan-dim)] opacity-20 rounded-full" />
        <div className="relative bg-[var(--bg-elevated)] p-5 rounded-2xl border border-[var(--border-glass)]">
          <Icon className="w-10 h-10 text-[var(--accent-cyan)]" />
        </div>
      </div>
      
      <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] max-w-xs mb-8">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="bg-[var(--accent-cyan)] hover:bg-cyan-500 text-[var(--bg-void)] font-bold px-8 rounded-full transition-all hover:scale-105"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
