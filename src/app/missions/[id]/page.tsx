import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TaskList } from '@/components/task-list';

// Helper component for status badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    blocked: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'viewer';
  if (user) {
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
    if (roleData) userRole = roleData.role;
  }
  
  const currentUser = user ? { id: user.id, role: userRole } : null;
  
  const { data: mission } = await supabase
    .from('missions')
    .select(`
      *,
      owner:auth.users(id, name, email),
      campaign:campaigns(id, name, description),
      tasks(
        id, title, description, status, 
        assignee:auth.users(id, name),
        evidence_photos, completed_at
      )
    `)
    .eq('id', id)
    .single();

  if (!mission) notFound();

  const isOwner = currentUser?.id === mission.owner_id;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4 flex justify-between items-center">
        <div>
          <a href="/campaigns" className="text-blue-600">Campaigns</a>
          {' / '}
          <a href={`/campaigns/${mission.campaign_id}`} className="text-blue-600">
            {mission.campaign?.name || 'Campaign'}
          </a>
          {' / '}
          <span className="text-gray-600">{mission.name}</span>
        </div>
        {(isAdmin || isOwner) && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You can manage this mission</span>
        )}
      </nav>

      {/* Mission header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{mission.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Owner: {mission.owner?.name || 'Unassigned'}</span>
          <span className="flex items-center gap-1">Status: <StatusBadge status={mission.status} /></span>
          {mission.deadline && (
            <span>Deadline: {new Date(mission.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Description */}
      {mission.description && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{mission.description}</p>
        </div>
      )}

      {/* Task list */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <TaskList 
          tasks={mission.tasks as any} 
          missionId={mission.id} 
          missionOwnerId={mission.owner_id}
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
}
