'use client'

import { GlassCard } from '@/components/shared/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, MessageSquare, Paperclip } from 'lucide-react'
import { format, isPast } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: {
    id: string
    title: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    assignees: { full_name: string; avatar_url: string | null }[]
    comment_count: number
    attachment_count: number
  }
}

export function TaskCard({ task }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      case 'low': return 'var(--priority-low)'
      default: return 'var(--text-muted)'
    }
  }

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.priority !== 'low'

  return (
    <Link href={`/tasks/${task.id}`} className="block group">
      <GlassCard 
        padding="sm" 
        hoverable 
        className="relative transition-all duration-200 hover:border-[var(--accent-cyan)]"
      >
        {/* Priority Indicator */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[3px]" 
          style={{ backgroundColor: getPriorityColor(task.priority) }} 
        />

        <div className="space-y-3 pl-1">
          <div className="flex items-center justify-between">
            <span className={cn(
              "mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border",
              task.priority === 'high' ? "border-red-500/20 text-red-400 bg-red-500/5" :
              task.priority === 'medium' ? "border-orange-500/20 text-orange-400 bg-orange-500/5" :
              "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
            )}>
              {task.priority}
            </span>
          </div>

          <h4 className="font-sans text-[14px] font-medium leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors line-clamp-2">
            {task.title}
          </h4>

          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-1.5">
              {(task.assignees || []).map((assignee, i) => (
                <Avatar key={i} className="w-6 h-6 border-2 border-[var(--bg-surface)]">
                  <AvatarImage src={assignee.avatar_url || ''} />
                  <AvatarFallback className="text-[9px] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                    {assignee.full_name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            
            <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
              {task.comment_count > 0 && (
                <div className="flex items-center gap-1 mono text-[10px]">
                  <MessageSquare className="w-3 h-3" />
                  {task.comment_count}
                </div>
              )}
              {task.attachment_count > 0 && (
                <div className="flex items-center gap-1 mono text-[10px]">
                  <Paperclip className="w-3 h-3" />
                  {task.attachment_count}
                </div>
              )}
            </div>
          </div>

          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1.5 mono text-[10px] mt-2",
              isOverdue ? "text-red-400 font-bold" : "text-[var(--text-muted)]"
            )}>
              <Clock className="w-3 h-3" />
              <span>{format(new Date(task.due_date), 'dd MMM yy')}</span>
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  )
}
