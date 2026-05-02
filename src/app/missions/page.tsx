import { createClient } from '@/lib/supabase/server';
import { MissionCard } from '@/components/mission-card';

export default async function MissionsPage() {
  const supabase = await createClient();
  
  // No auth check - public route
  const { data } = await supabase
    .from('missions')
    .select(`
      *,
      owner:auth.users(id, email),
      campaign:campaigns(id, name),
      tasks(id, status)
    `)
    .order('created_at', { ascending: false });
    
  const missions = data as any[];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-2">Vihang Missions</h1>
        <p className="text-lg text-gray-500">Track our club's progress, active missions, and upcoming deliverables.</p>
      </div>
      
      {missions && missions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No missions found</h3>
          <p className="text-gray-500">Check back later for new club activities and projects.</p>
        </div>
      )}
    </div>
  );
}
