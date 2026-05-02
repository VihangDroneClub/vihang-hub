'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Filter } from 'lucide-react'
import { useCallback } from 'react'
import { GlassCard } from '@/components/shared/GlassCard'

export function AuditFilterBar({ profiles, missions }: { profiles: { id: string, full_name: string }[], missions: { id: string, name: string }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to first page on filter change
    router.push(`/audit?${params.toString()}`)
  }, [router, searchParams])

  const clearFilters = () => {
    router.push('/audit')
  }

  const actor = searchParams.get('actor') || 'all'
  const entityType = searchParams.get('type') || 'all'
  const mission = searchParams.get('mission') || 'all'
  const fromDate = searchParams.get('from') || ''
  const toDate = searchParams.get('to') || ''

  return (
    <GlassCard className="animate-fade-in border-dashed" padding="md">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-[var(--accent-cyan)]" />
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Filters</span>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="mono text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-tighter">Authorized Actor</label>
          <Select value={actor} onValueChange={(v) => updateFilters('actor', v)}>
            <SelectTrigger className="bg-[var(--bg-elevated)] border-[var(--border-glass)] h-9 text-xs">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-glass)]">
              <SelectItem value="all">All Personnel</SelectItem>
              {profiles.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-40">
          <label className="mono text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-tighter">Entity Class</label>
          <Select value={entityType} onValueChange={(v) => updateFilters('type', v)}>
            <SelectTrigger className="bg-[var(--bg-elevated)] border-[var(--border-glass)] h-9 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-glass)]">
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="activities">Activities</SelectItem>
              <SelectItem value="profiles">Members</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="mono text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-tighter">Mission Sector</label>
          <Select value={mission} onValueChange={(v) => updateFilters('mission', v)}>
            <SelectTrigger className="bg-[var(--bg-elevated)] border-[var(--border-glass)] h-9 text-xs">
              <SelectValue placeholder="All Missions" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-glass)]">
              <SelectItem value="all">All Sectors</SelectItem>
              {missions.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="mono text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-tighter">Time Horizon (From)</label>
          <Input 
            type="date" 
            value={fromDate} 
            onChange={(e) => updateFilters('from', e.target.value)} 
            className="bg-[var(--bg-elevated)] border-[var(--border-glass)] h-9 text-xs w-40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="mono text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-tighter">Time Horizon (To)</label>
          <Input 
            type="date" 
            value={toDate} 
            onChange={(e) => updateFilters('to', e.target.value)} 
            className="bg-[var(--bg-elevated)] border-[var(--border-glass)] h-9 text-xs w-40"
          />
        </div>

        <div className="pt-5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="h-9 hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] mono text-[10px] font-bold uppercase"
          >
            <X className="w-3.5 h-3.5 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
