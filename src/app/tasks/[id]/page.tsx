import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CommentThread } from '@/components/tasks/CommentThread'
import { AttachmentList } from '@/components/tasks/AttachmentList'
import { ChangeHistory } from '@/components/tasks/ChangeHistory'
import { GlassCard } from '@/components/shared/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, ChevronLeft, Layout, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { TaskHeaderActions } from '@/components/tasks/TaskHeaderActions'
import { cn } from '@/lib/utils'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      *,
      projects ( 
        id, 
        name, 
        missions ( name, slug ) 
      ),
      task_assignments (
        profiles ( id, full_name, avatar_url )
      )
    `)
    .eq('id', id)
    .single()

  if (!task) notFound()

  // Fetch all members for the edit modal (including leads and admins for assignments)
  const { data: allMembers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .order('full_name')

  // Get current user role
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', currentUser?.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'
  const isLead = userProfile?.role === 'lead'

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles ( id, full_name, avatar_url )
    `)
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  const { data: attachments } = await supabase
    .from('attachments')
    .select('*')
    .eq('task_id', id)
    .order('created_at', { ascending: false })

  const { data: auditLog } = await supabase
    .from('audit_log')
    .select(`
      *,
      profiles:actor_id ( full_name )
    `)
    .eq('entity_id', id)
    .eq('entity_type', 'tasks')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 md:px-10 py-6 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}>
        <div className="flex items-center gap-6">
          <Link href={`/missions/${task.projects.missions.slug}/projects/${task.projects.id}`}>
            <Button variant="ghost" size="icon" className="hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
               <span>{task.projects.missions.name}</span>
               <span className="text-[var(--accent-cyan)]">/</span>
               <span>{task.projects.name}</span>
            </div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {task.title}
            </h1>
          </div>
        </div>
        <TaskHeaderActions 
          task={task} 
          allMembers={allMembers || []} 
          isAdmin={isAdmin} 
          isLead={isLead}
          missionSlug={task.projects.missions.slug}
          projectId={task.projects.id}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-10">
          <GlassCard padding="lg" className="bg-[rgba(255,255,255,0.01)] border-dashed">
            <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)] mb-4 flex items-center gap-2">
              <Layout className="w-3.5 h-3.5" />
              Operational Objectives
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
              {task.description || 'No specialized directives recorded for this unit.'}
            </p>
          </GlassCard>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-xs font-bold tracking-[0.2em] text-[var(--accent-cyan)] uppercase whitespace-nowrap">
                Comm-Link / Internal Thread
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-[var(--accent-cyan-dim)] to-transparent" />
            </div>
            <CommentThread taskId={task.id} initialComments={comments || []} isAdmin={isAdmin} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-[400px] border-l border-[var(--border-glass)] bg-[var(--bg-glass)] p-8 space-y-8 overflow-y-auto hidden xl:block" style={{ backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}>
          <section className="space-y-4">
             <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">
               Unit Status
             </h3>
             <GlassCard padding="sm" className="space-y-4 bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Phase</span>
                  <span className={cn(
                    "mono text-[10px] px-2 py-0.5 rounded-full border",
                    task.status === 'done' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    task.status === 'in_progress' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                    "bg-[var(--bg-elevated)] border-[var(--border-glass)] text-[var(--text-secondary)]"
                  )}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Priority</span>
                  <span className={cn(
                    "mono text-[10px] px-2 py-0.5 rounded-[2px] border",
                    task.priority === 'high' ? "border-red-500/20 text-red-400 bg-red-500/5" :
                    task.priority === 'medium' ? "border-orange-500/20 text-orange-400 bg-orange-500/5" :
                    "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                  )}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-glass)]">
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Deadline</span>
                  <div className="flex items-center gap-2 mono text-[11px] font-bold text-[var(--text-primary)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                    {task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy').toUpperCase() : 'NO SCHEDULE'}
                  </div>
                </div>
             </GlassCard>
          </section>

          <section className="space-y-4">
             <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">
               Active Personnel
             </h3>
             <div className="flex flex-wrap gap-2">
                {task.task_assignments.map((a: { profiles: { id: string, full_name: string, avatar_url: string | null } }) => (
                  <div key={a.profiles.id} className="flex items-center gap-2 pl-1 py-1 pr-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-glass)] hover:border-[var(--accent-cyan-dim)] transition-colors group">
                    <Avatar className="w-6 h-6 border border-[var(--border-glass)]">
                      <AvatarImage src={a.profiles.avatar_url || ''} />
                      <AvatarFallback className="bg-[var(--bg-surface)] text-[10px]">{a.profiles.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                      {a.profiles.full_name}
                    </span>
                  </div>
                ))}
                {task.task_assignments.length === 0 && (
                  <p className="text-[11px] italic text-[var(--text-muted)]">No active assignments.</p>
                )}
             </div>
          </section>

          <section className="space-y-4">
            <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">
              Digital Assets
            </h3>
            <AttachmentList taskId={task.id} initialAttachments={attachments || []} />
          </section>

          <section className="space-y-4">
            <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">
              Mission Log
            </h3>
            <ChangeHistory history={auditLog || []} />
          </section>
        </aside>
      </div>
    </div>
  )
}
