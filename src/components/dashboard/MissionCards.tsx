'use client'

import { GlassCard } from '@/components/shared/GlassCard'
import { Mission } from '@/types'
import { Target, Layers, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MissionWithStats extends Mission {
  totalTasks: number
  completedTasks: number
  activeProjects: number
}

export function MissionCards({ missions }: { missions: MissionWithStats[] }) {
  const getGlowType = (slug: string) => {
    if (slug.includes('tesseract')) return 'tesseract'
    if (slug.includes('avinya')) return 'avinya'
    return 'cyan'
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 animate-fade-up">
      {missions.map((mission, index) => {
        const progress = mission.totalTasks > 0 
          ? Math.round((mission.completedTasks / mission.totalTasks) * 100) 
          : 0

        const glow = getGlowType(mission.slug)

        return (
          <GlassCard 
            key={mission.id} 
            glow={glow as "cyan" | "tesseract" | "avinya" | "other" | "none"}
            hoverable
            className="flex flex-col h-full transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-6 rounded-full" 
                  style={{ backgroundColor: mission.color_hex, boxShadow: `0 0 10px ${mission.color_hex}` }} 
                />
                <h3 className="font-heading text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase">
                  {mission.name}
                </h3>
              </div>
              <Target className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>

            <div className="flex items-end gap-2 mb-2">
              <span className="mono text-3xl font-bold text-[var(--text-primary)]">
                {progress}%
              </span>
              <span className="mono text-[10px] text-[var(--text-muted)] mb-1 uppercase tracking-tight">
                Completion
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] mb-6 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--accent-cyan)]" />
              {mission.completedTasks} / {mission.totalTasks} operational tasks
            </p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4 text-[10px] mono text-[var(--text-secondary)] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{mission.activeProjects} Projects</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{mission.completedTasks} Done</span>
                </div>
              </div>

              <div className="relative w-full bg-[rgba(255,255,255,0.03)] rounded-full h-1 overflow-hidden border border-[rgba(255,255,255,0.05)]">
                <div 
                  className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full" 
                  style={{ 
                    width: `${progress}%`, 
                    backgroundColor: mission.color_hex,
                    boxShadow: `0 0 12px ${mission.color_hex}`
                  }}
                />
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

