'use client'

import { GlassCard } from '@/components/shared/GlassCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { History } from 'lucide-react'
import { useRealtimeAudit } from '@/lib/hooks/useRealtimeAudit'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  actor_name: string
  actor_avatar: string | null
  action: string
  entity_type: string
  entity_name: string
  created_at: string
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  useRealtimeAudit()
  
  return (
    <GlassCard className="col-span-1 lg:col-span-3 flex flex-col animate-fade-in" padding="none">
      <div className="p-6 border-b border-[var(--border-glass)] flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--accent-cyan)]" />
          Mission Log
        </h3>
        <span className="mono text-[10px] text-[var(--text-muted)] uppercase">Realtime Active</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar p-6">
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <History className="w-8 h-8 text-[var(--text-muted)] mb-3 opacity-20" />
              <p className="text-sm text-[var(--text-muted)] font-medium">No recent operations logged.</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={cn(
                  "flex gap-4 group animate-fade-up",
                  index !== 0 && "opacity-80 hover:opacity-100 transition-opacity"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8 border border-[var(--border-glass)]">
                    <AvatarImage src={activity.actor_avatar || ''} />
                    <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs">
                      {activity.actor_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      activity.action.toLowerCase() === 'insert' ? "bg-emerald-500" : 
                      activity.action.toLowerCase() === 'update' ? "bg-blue-500" : "bg-red-500"
                    )} />
                  </div>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                      {activity.actor_name}
                    </span>
                    <span className="mx-1">
                      {activity.action.toLowerCase() === 'insert' ? 'deployed' : 
                       activity.action.toLowerCase() === 'update' ? 'modified' : 'decommissioned'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-elevated)] border border-[var(--border-glass)] text-[11px] mono text-[var(--accent-cyan)] mx-1">
                      {activity.entity_type.toUpperCase()}
                    </span>
                    <span className="font-medium text-[var(--text-primary)] italic truncate inline-block max-w-[150px] align-bottom">
                      &quot;{activity.entity_name}&quot;
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mono text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">
                    <ClockIcon className="w-3 h-3" />
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

