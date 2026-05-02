import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  const profile = data as any;

  // Fetch tasks assigned to the user
  const { data: myTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      missions (
        id,
        title,
        campaigns (id, title)
      )
    `)
    .eq('assignee_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch unassigned tasks that the user might want to claim
  const { data: availableTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      missions (
        id,
        title
      )
    `)
    .is('assignee_id', null)
    .eq('status', 'todo')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch missions owned by the user (if any)
  const { data: myMissions } = await supabase
    .from('missions')
    .select(`
      *,
      campaigns (id, title),
      tasks (id, status)
    `)
    .eq('owner_id', user.id)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-2">
          Welcome back, {profile?.full_name || 'Member'}
        </h1>
        <p className="text-lg text-gray-500">Here is your current workload and active responsibilities.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: My Tasks */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Assigned Tasks</h2>
            {myTasks && myTasks.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <ul className="divide-y divide-gray-100">
                  {myTasks.map((task: any) => (
                    <li key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/missions/${task.missions?.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                          {task.title}
                        </Link>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${
                          task.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-200' :
                          task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-blue-200' :
                          'bg-gray-50 text-gray-700 ring-gray-200'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Mission: <span className="font-medium text-gray-700">{task.missions?.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">You don't have any assigned tasks.</p>
              </div>
            )}
          </section>

          {myMissions && myMissions.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Missions I Lead</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {myMissions.map((mission: any) => {
                  const total = mission.tasks.length;
                  const completed = mission.tasks.filter((t: any) => t.status === 'completed').length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <Link key={mission.id} href={`/missions/${mission.id}`} className="block">
                      <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="text-xs font-semibold text-blue-600 mb-1">{mission.campaigns?.title}</div>
                        <h3 className="font-bold text-gray-900 mb-3">{mission.title}</h3>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">{completed}/{total} tasks</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Available Tasks */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Tasks</h2>
            {availableTasks && availableTasks.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
                {availableTasks.map((task: any) => (
                  <div key={task.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">In: {task.missions?.title}</p>
                    <Link 
                      href={`/missions/${task.missions?.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded inline-block"
                    >
                      View & Claim
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No unassigned tasks currently available.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
