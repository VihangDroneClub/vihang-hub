import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectCard } from '@/components/missions/ProjectCard'
import { CreateProjectModal } from '@/components/missions/CreateProjectModal'

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!mission) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:lead_id ( full_name ),
      tasks ( id, status )
    `)
    .eq('mission_id', mission.id)

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  const projectsWithStats = projects?.map((p: { id: string, name: string, description: string | null, status: string, due_date: string | null, tasks: { status: string }[], profiles?: { full_name: string } }) => ({
    ...p,
    lead_name: p.profiles?.full_name || null,
    total_tasks: p.tasks.length,
    completed_tasks: p.tasks.filter((t: { status: string }) => t.status === 'done').length,
    task_stats: [] // Would derive from tasks
  })) || []

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 rounded-full" style={{ backgroundColor: mission.color_hex }} />
            <h2 className="text-3xl font-bold tracking-tight">{mission.name}</h2>
          </div>
          <p className="text-muted-foreground mt-1">{mission.description}</p>
        </div>
        <CreateProjectModal 
          missionId={mission.id} 
          missionSlug={mission.slug}
          profiles={allProfiles || []}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectsWithStats.length === 0 ? (
          <div className="col-span-full text-center py-20 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No projects found in this mission.</p>
          </div>
        ) : (
          projectsWithStats.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project as never} 
              missionSlug={mission.slug} 
            />
          ))
        )}
      </div>
    </div>
  )
}
