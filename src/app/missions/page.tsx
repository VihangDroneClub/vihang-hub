import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GlassCard } from '@/components/shared/GlassCard'
import { Target, ArrowRight } from 'lucide-react'

export default async function MissionsPage() {
  const supabase = await createClient()

  const { data: missions } = await supabase
    .from('missions')
    .select(`
      *,
      projects ( id )
    `)

  const getGlowType = (slug: string) => {
    if (slug.includes('tesseract')) return 'tesseract'
    if (slug.includes('avinya')) return 'avinya'
    return 'cyan'
  }

  return (
    <div className="p-6 md:p-10 space-y-10 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Active Missions
        </h1>
        <p className="text-[var(--text-secondary)] text-sm max-w-xl">
          Authorized personnel only. Select an operational theatre to manage related research projects and tactical units.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {missions?.map((mission) => {
          const glow = getGlowType(mission.slug)
          
          return (
            <Link key={mission.id} href={`/missions/${mission.slug}`} className="group block">
              <GlassCard 
                glow={glow as "cyan" | "tesseract" | "avinya" | "other" | "none"}
                hoverable
                className="h-full flex flex-col justify-between transition-all duration-300 border-l-2"
                style={{ borderLeftColor: mission.color_hex }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                      {mission.name}
                    </h2>
                    <Target 
                      className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" 
                      style={{ color: mission.color_hex }} 
                    />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {mission.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[11px] font-bold text-[var(--text-primary)] bg-[var(--bg-elevated)] px-2.5 py-1 rounded-full border border-[var(--border-glass)]">
                      {mission.projects.length}
                    </span>
                    <span className="mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                      Projects
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    <span className="mono text-[9px] font-bold uppercase">Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

