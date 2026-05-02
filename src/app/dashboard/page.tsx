import { createClient } from '@/lib/supabase/server'
import { MissionCards } from '@/components/dashboard/MissionCards'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { MyTasks } from '@/components/dashboard/MyTasks'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { startOfMonth, subMonths, format, isWithinInterval, endOfMonth } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch Missions with Stats
  const { data: missions } = await supabase
    .from('missions')
    .select(`
      *,
      projects (
        id,
        status,
        tasks (
          id,
          status
        )
      )
    `)

  const missionsWithStats = missions?.map(m => {
    const allTasks = m.projects.flatMap((p: { tasks: { status: string }[] }) => p.tasks)
    return {
      ...m,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter((t: { status: string }) => t.status === 'done').length,
      activeProjects: m.projects.filter((p: { status: string }) => p.status === 'active').length
    }
  }) || []

  // 2. Fetch My Tasks
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  const { data: myTasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      due_date,
      projects ( name )
    `)
    .in('id', (
      await supabase
        .from('task_assignments')
        .select('task_id')
        .eq('member_id', profile?.id)
    ).data?.map(a => a.task_id) || [])
    .limit(5)

  const formattedMyTasks = myTasks?.map((t: { id: string, title: string, status: string, due_date: string | null, projects: { name: string }[] }) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    due_date: t.due_date,
    project_name: (t.projects as unknown as { name: string })?.name || 'Unassigned Unit'
  })) || []

  // 3. Fetch Activity Feed
  const { data: auditLogs } = await supabase
    .from('audit_log')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // This is a simplified version, ideally we'd join with entity names
  const activities = auditLogs?.map((log: { id: string, profiles?: { full_name: string, avatar_url: string | null }, action: string, entity_type: string, new_value?: { title?: string, name?: string }, created_at: string }) => ({
    id: log.id,
    actor_name: log.profiles?.full_name || 'System',
    actor_avatar: log.profiles?.avatar_url || null,
    action: log.action,
    entity_type: log.entity_type,
    entity_name: log.new_value?.title || log.new_value?.name || 'Unknown',
    created_at: log.created_at
  })) || []

  // 4. Monthly Chart Data (Real Data)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i)
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, 'MMM yyyy')
    }
  })

  const { data: completedTasks } = await supabase
    .from('tasks')
    .select(`
      updated_at,
      projects (
        missions ( name )
      )
    `)
    .eq('status', 'done')
    .gte('updated_at', last6Months[0].start.toISOString())

  const chartData = last6Months.map(month => {
    const monthData: Record<string, string | number> & { month: string } = { month: month.label }
    missions?.forEach(m => {
      monthData[m.name] = 0
    })

    completedTasks?.forEach((task: { updated_at: string, projects: { missions: { name: string }[] }[] }) => {
      const taskDate = new Date(task.updated_at)
      if (isWithinInterval(taskDate, { start: month.start, end: month.end })) {
        const missionName = (task.projects as unknown as { missions: { name: string } })?.missions?.name
        monthData[missionName] = ((monthData[missionName] as number) || 0) + 1
      }
    })

    return monthData
  })

  // 5. Upcoming Deadlines
  const { data: deadlineTasks } = await supabase
    .from('tasks')
    .select('id, title, due_date')
    .neq('status', 'done')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })
    .limit(3)

  const deadlines = [
    ...(deadlineTasks?.filter(t => t.due_date).map((t: { id: string; title: string; due_date: string | null }) => ({ id: t.id, title: t.title, due_date: t.due_date as string, type: 'task' as const })) || [])
  ]

  return (
    <div className="p-6 md:p-10 space-y-10 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Operations Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="mono text-[10px] md:text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            System Status: Nominal / All units active
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="font-heading text-xs font-bold tracking-[0.2em] text-[var(--accent-cyan)] uppercase whitespace-nowrap">
            Mission Readiness
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-[var(--accent-cyan-dim)] to-transparent" />
        </div>
        <MissionCards missions={missionsWithStats} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="font-heading text-xs font-bold tracking-[0.2em] text-[var(--accent-cyan)] uppercase whitespace-nowrap">
            Performance Analytics
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-[var(--accent-cyan-dim)] to-transparent" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <MonthlyChart 
            data={chartData} 
            missionNames={missions?.map(m => m.name) || []} 
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="font-heading text-xs font-bold tracking-[0.2em] text-[var(--accent-cyan)] uppercase whitespace-nowrap">
            Tactical Overview
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-[var(--accent-cyan-dim)] to-transparent" />
        </div>
        <div className="grid gap-6 lg:grid-cols-7">
          <ActivityFeed activities={activities} />
          <div className="lg:col-span-4 grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            <MyTasks tasks={formattedMyTasks} />
            <UpcomingDeadlines deadlines={deadlines} />
          </div>
        </div>
      </section>
    </div>
  )
}
