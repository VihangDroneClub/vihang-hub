'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

import { GlassCard } from '@/components/shared/GlassCard'

export function AuditLogList({ logs }: { logs: { id: string, action: string, entity_type: string, entity_id: string, old_value?: Record<string, unknown> | null, new_value?: Record<string, unknown> | null, created_at: string, profiles?: { full_name: string, avatar_url: string | null, role: string } }[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-3">
      <div className="px-6 py-3 mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] grid grid-cols-12 gap-4">
        <div className="col-span-3">Operational Actor</div>
        <div className="col-span-2">Vector</div>
        <div className="col-span-2">Target Class</div>
        <div className="col-span-4">Operation Summary</div>
        <div className="col-span-1 text-right">Timestamp</div>
      </div>

      <div className="space-y-2">
        {logs.map((log) => {
          const isExpanded = expandedId === log.id
          return (
            <div key={log.id} className="animate-fade-up">
              <button 
                onClick={() => toggleExpand(log.id)}
                className="w-full group outline-none"
              >
                <GlassCard 
                  padding="none" 
                  className={cn(
                    "transition-all duration-200 border-l-2",
                    isExpanded ? "border-[var(--accent-cyan)] bg-[var(--bg-glass-hover)]" : "border-transparent hover:border-[var(--border-glow)]",
                    log.action === 'INSERT' ? "border-l-emerald-500/50" : 
                    log.action === 'UPDATE' ? "border-l-blue-500/50" : "border-l-red-500/50"
                  )}
                >
                  <div className="p-4 grid grid-cols-12 gap-4 items-center text-sm text-left">
                    <div className="col-span-3 flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-[var(--border-glass)]">
                        <AvatarImage src={log.profiles?.avatar_url || ''} />
                        <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-[10px]">{log.profiles?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)] transition-colors">{log.profiles?.full_name}</span>
                        <span className="mono text-[8px] text-[var(--text-muted)] uppercase tracking-tighter">{log.profiles?.role}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={cn(
                        "mono text-[9px] px-2 py-0.5 rounded-[2px] border font-bold",
                        log.action === 'INSERT' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                        log.action === 'UPDATE' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                      )}>
                        {log.action}
                      </span>
                    </div>
                    <div className="col-span-2 mono text-[10px] uppercase text-[var(--text-secondary)] tracking-tight">
                      {log.entity_type}
                    </div>
                    <div className="col-span-4 truncate text-[var(--text-muted)] italic text-xs">
                      {log.action === 'UPDATE' 
                        ? `Modified: ${Object.keys(log.new_value || {}).filter(k => log.old_value?.[k] !== log.new_value?.[k]).join(', ')}` 
                        : log.action === 'INSERT' ? 'Initialization of new unit record' : 'Decommissioned record'
                      }
                    </div>
                    <div className="col-span-1 mono text-[10px] text-[var(--text-muted)] text-right flex items-center justify-end gap-2">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-[var(--accent-cyan)]" /> : <ChevronDown className="w-3 h-3" />}
                    </div>
                  </div>
                </GlassCard>
              </button>

              {isExpanded && (
                <div className="px-4 py-6 bg-[var(--bg-void)]/40 border-x border-b border-[var(--border-glass)] rounded-b-[var(--radius-lg)] mx-2 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  {log.action === 'INSERT' ? (
                    <div className="col-span-2 space-y-4">
                       <h4 className="mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Initialization Data</h4>
                       <DiffGrid data={log.new_value || null} />
                    </div>
                  ) : log.action === 'DELETE' ? (
                    <div className="col-span-2 space-y-4">
                       <h4 className="mono text-[10px] font-bold text-red-400 uppercase tracking-widest">Final State Record</h4>
                       <DiffGrid data={log.old_value || null} />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h4 className="mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-red-500/50" />
                          Pre-Operation State
                        </h4>
                        <DiffGrid data={log.old_value || null} newData={log.new_value || null} />
                      </div>
                      <div className="space-y-4">
                        <h4 className="mono text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[var(--accent-cyan)]" />
                          Post-Operation State
                        </h4>
                        <DiffGrid data={log.new_value || null} oldData={log.old_value || null} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {logs.length === 0 && (
          <GlassCard padding="lg" className="text-center border-dashed">
            <p className="mono text-xs text-[var(--text-muted)] uppercase tracking-widest">No telemetry matches the current filters.</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

function DiffGrid({ data, oldData, newData }: { data: Record<string, unknown> | null, oldData?: Record<string, unknown> | null, newData?: Record<string, unknown> | null }) {
  if (!data) return <div className="text-[var(--text-muted)] italic mono text-[10px]">EMPTY_RECORD</div>

  return (
    <div className="border border-[var(--border-glass)] rounded-[var(--radius-sm)] divide-y divide-[var(--border-glass)] bg-[var(--bg-elevated)]/30 overflow-hidden">
      {Object.entries(data).map(([key, value]) => {
        const isChanged = (oldData && oldData[key] !== value) || (newData && newData[key] !== value)
        
        return (
          <div key={key} className={cn(
            "grid grid-cols-3 gap-4 p-2.5",
            isChanged && "bg-[var(--accent-cyan-glow)]"
          )}>
            <div className="mono text-[10px] font-bold text-[var(--text-muted)] truncate uppercase tracking-tighter" title={key}>{key}</div>
            <div className="col-span-2 break-all whitespace-pre-wrap mono text-[11px] text-[var(--text-secondary)]">
              {value === null ? <span className="text-[var(--text-muted)] italic opacity-50">NULL</span> : String(value)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
