'use client'

import { GlassCard } from '@/components/shared/GlassCard'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Clock, ArrowUpRight } from 'lucide-react'
import { format, isPast } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MyTask {
  id: string
  title: string
  status: string
  due_date: string | null
  project_name: string
  priority?: string
}

export function MyTasks({ tasks }: { tasks: MyTask[] }) {
  return (
    <GlassCard className="col-span-1 lg:col-span-2 flex flex-col animate-fade-in" padding="none">
      <div className="p-6 border-b border-[var(--border-glass)] flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[var(--accent-cyan)]" />
          Personal Assignments
        </h3>
        <Link href="/tasks" className="mono text-[10px] text-[var(--accent-cyan)] hover:underline flex items-center gap-1">
          VIEW ALL <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-6 overflow-y-auto max-h-[500px] custom-scrollbar">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckSquare className="w-8 h-8 text-[var(--text-muted)] mb-3 opacity-20" />
              <p className="text-sm text-[var(--text-muted)] font-medium">No active assignments found.</p>
            </div>
          ) : (
            tasks.map((task, index) => {
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'
              
              return (
                <Link 
                  key={task.id} 
                  href={`/tasks/${task.id}`}
                  className="block group animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.02)] border border-[var(--border-glass)] hover:border-[var(--accent-cyan-dim)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200">
                    <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors truncate">
                        {task.title}
                      </p>
                      <p className="mono text-[10px] text-[var(--text-muted)] uppercase tracking-tight truncate">
                        {task.project_name}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={cn(
                        "mono text-[9px] px-2 py-0.5 rounded-full border",
                        task.status === 'done' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        task.status === 'in_progress' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        "bg-[var(--bg-elevated)] border-[var(--border-glass)] text-[var(--text-secondary)]"
                      )}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {task.due_date && (
                        <div className={cn(
                          "flex items-center gap-1.5 mono text-[10px]",
                          isOverdue ? "text-red-400 font-bold" : "text-[var(--text-muted)]"
                        )}>
                          <Clock className="w-3 h-3" />
                          {format(new Date(task.due_date), 'dd MMM')}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </GlassCard>
  )
}

