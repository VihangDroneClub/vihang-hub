import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TaskCard } from '@/components/projects/TaskCardStatic'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch tasks assigned to the current user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    // Handle case where user has no profile
    return <div className="p-6">No profile found for current user.</div>
  }

  const { data: assignedTasks, error } = await supabase
    .from('task_assignments')
    .select(`
      tasks (
        id,
        title,
        status,
        priority,
        due_date,
        projects (
          name,
          missions ( slug )
        )
      )
    `)
    .eq('member_id', profile.id)

  if (error) {
    console.error('Error fetching assigned tasks:', error)
    return <div className="p-6">Error loading tasks.</div>
  }

  const tasks = assignedTasks?.map(assignment => assignment.tasks).flat() || []

  return (
    <div className="p-6 md:p-10 space-y-6">
      <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        My Tasks
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length === 0 ? (
          <p className="text-[var(--text-muted)]">No tasks assigned to you.</p>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task as any} />
          ))
        )}
      </div>
    </div>
  )
}
