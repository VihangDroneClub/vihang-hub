'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Circle, Clock, MoreHorizontal } from 'lucide-react'

interface HistoryEntry {
  id: string
  action: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  created_at: string
  profiles: {
    full_name: string
  }
}

export function ChangeHistory({ history }: { history: HistoryEntry[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        History
      </h3>
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic ml-8">No history yet.</p>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="relative flex items-center gap-4 ml-4">
              <div className="absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full bg-card border shadow-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 ml-6 p-3 rounded-lg border bg-accent/30">
                <p className="text-sm">
                  <span className="font-semibold">{entry.profiles?.full_name}</span>{' '}
                  {entry.action === 'INSERT' ? 'created this task' : 
                   entry.action === 'UPDATE' ? 'updated this task' : 'deleted something'}
                </p>
                {!!entry.new_value?.status && !!entry.old_value?.status && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Changed status: {String(entry.old_value.status)} → {String(entry.new_value.status)}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
