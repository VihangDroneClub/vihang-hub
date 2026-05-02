import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { GlassCard } from '@/components/shared/GlassCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProjectStatsChart } from '@/components/shared/ProjectStatsChart'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { CreateTaskModal } from '@/components/projects/CreateTaskModal'
import { ProjectHeaderActions } from '@/components/projects/ProjectHeaderActions'
import { ExportProjectButton } from '@/components/projects/ExportProjectButton'

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      missions ( name, slug ),
      profiles:lead_id ( id, full_name, avatar_url )
    `)
    .eq('id', id)
  
  console.log('Project Data:', projectData, 'Project Error:', projectError)
  if (!projectData || projectData.length === 0) notFound()
  const project = projectData[0] // Assuming it should be a single project


  // Fetch all potential leads (leads and admins)
  const { data: allLeads } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['lead', 'admin'])
    .order('full_name')

  // Get current user info
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', currentUser?.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'
  const currentUserId = userProfile?.id
  const isLead = project.lead_id === currentUserId

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments (
        profiles ( full_name, avatar_url )
      ),
      comments ( id ),
      attachments ( id )
    `)
    .eq('project_id', id)

  const formattedTasks = tasks?.map((t: { id: string, title: string, status: string, priority: "low" | "medium" | "high", due_date: string | null, task_assignments: { profiles: { full_name: string, avatar_url: string | null } }[], comments: unknown[], attachments: unknown[] }) => ({
    ...t,
    assignees: t.task_assignments.map((a: { profiles: { full_name: string, avatar_url: string | null } }) => a.profiles),
    comment_count: t.comments.length,
    attachment_count: t.attachments.length
  })) || []

  // Stats for Pie Chart
  const stats = [
    { name: 'To Do', value: formattedTasks.filter(t => t.status === 'todo').length, color: '#94a3b8' },
    { name: 'In Progress', value: formattedTasks.filter(t => t.status === 'in_progress').length, color: '#6366f1' },
    { name: 'Review', value: formattedTasks.filter(t => t.status === 'review').length, color: '#f59e0b' },
    { name: 'Done', value: formattedTasks.filter(t => t.status === 'done').length, color: '#10b981' },
  ].filter(s => s.value > 0)

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 md:px-10 py-6 border-b border-[var(--border-glass)] bg-[var(--bg-glass)] flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}>
        <div>
          <div className="flex items-center gap-2 mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
            <span>Missions</span>
            <span className="text-[var(--accent-cyan)]">/</span>
            <span>{project.missions.name}</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {project.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
           {(isAdmin || isLead) && (
              <ExportProjectButton projectId={project.id} projectName={project.name} />
           )}
           <ProjectHeaderActions 
              project={project}
              allLeads={allLeads || []}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              missionSlug={slug}
           />
           <div className="h-6 w-px bg-[var(--border-glass)] mx-2" />
           <Button variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]">
              <Users className="w-4 h-4 mr-2" />
              Members
           </Button>
           <CreateTaskModal 
              projectId={project.id} 
              missionSlug={project.missions.slug} 
           />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board Container */}
        <div className="flex-1 overflow-x-auto p-6 md:p-10 custom-scrollbar">
          <KanbanBoard initialTasks={formattedTasks} missionSlug={slug} projectId={id} />
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-[var(--border-glass)] bg-[var(--bg-glass)] p-8 overflow-y-auto hidden xl:block" style={{ backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}>
          <div className="space-y-10">
            <section>
              <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)] mb-6">
                Unit Efficiency
              </h3>
              <GlassCard padding="sm" className="bg-[rgba(255,255,255,0.02)]">
                <ProjectStatsChart stats={stats} />
              </GlassCard>
            </section>

            <section>
              <h3 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-cyan)] mb-6">
                Commanding Lead
              </h3>
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-[var(--accent-cyan-dim)] group-hover:border-[var(--accent-cyan)] transition-colors">
                    <AvatarImage src={project.profiles?.avatar_url || ''} />
                    <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                      {project.profiles?.full_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-void)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                    {project.profiles?.full_name}
                  </p>
                  <p className="mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                    Operational Lead
                  </p>
                </div>
              </div>
            </section>

            <section className="pt-10 border-t border-[var(--border-glass)]">
              <div className="p-4 rounded-[var(--radius-md)] bg-blue-500/5 border border-blue-500/10">
                <p className="mono text-[9px] text-blue-400 uppercase tracking-widest mb-1 font-bold">
                  System Advisory
                </p>
                <p className="text-[11px] text-blue-300/70 leading-relaxed">
                  Resource allocation for this project is currently optimized. Syncing all active units...
                </p>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  )
}
