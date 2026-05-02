'use client'

import { GlassCard } from '@/components/shared/GlassCard'
import { Badge } from '@/components/ui/badge'
import { CalendarClock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Deadline {
  id: string
  title: string
  due_date: string
  type: 'task' | 'project'
}

export function UpcomingDeadlines({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <GlassCard className="col-span-1 lg:col-span-2 flex flex-col animate-fade-in" padding="none">
      <div className="p-6 border-b border-[var(--border-glass)] flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-[var(--accent-cyan)]" />
          Critical Deadlines
        </h3>
      </div>

      <div className="p-6 overflow-y-auto max-h-[500px] custom-scrollbar">
        <div className="space-y-3">
          {deadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarClock className="w-8 h-8 text-[var(--text-muted)] mb-3 opacity-20" />
              <p className="text-sm text-[var(--text-muted)] font-medium">No impending deadlines.</p>
            </div>
          ) : (
            deadlines.map((deadline, index) => (
              <div 
                key={deadline.id} 
                className="flex items-center justify-between p-4 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.02)] border border-[var(--border-glass)] animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {deadline.title}
                    </span>
                    <span className="mono text-[8px] px-1.5 py-0.5 rounded-[2px] border border-[var(--border-glass)] text-[var(--text-muted)] uppercase tracking-tighter">
                      {deadline.type}
                    </span>
                  </div>
                  <p className="mono text-[10px] text-[var(--text-secondary)] uppercase tracking-tight">
                    Expiring {formatDistanceToNow(new Date(deadline.due_date), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex-shrink-0 mono text-[11px] font-bold text-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--accent-cyan-dim)]">
                  {format(new Date(deadline.due_date), 'dd MMM').toUpperCase()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  )
}

