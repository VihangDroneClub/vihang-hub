import { createClient } from '@/lib/supabase/server';
import { MissionCard } from '@/components/mission-card';

export default async function MissionsPage() {
  const supabase = await createClient();
  
  // No auth check - public route
  const { data: missions } = await supabase
    .from('missions')
    .select(`
      *,
      owner:auth.users(id, name, email),
      campaign:campaigns(id, name),
      tasks(id, status)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Vihang Missions</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions?.map((mission) => (
          <MissionCard key={mission.id} mission={mission as any} />
        ))}
      </div>
    </div>
  );
}
