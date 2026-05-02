import { createClient } from '@/lib/supabase/server';

function StatCard({ title, value, color = 'gray' }: { 
  title: string; 
  value: number; 
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div className={`p-6 rounded-lg ${colorClasses[color] || colorClasses.gray}`}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-sm font-medium">{title}</div>
    </div>
  );
}

function QuickActionCard({ title, href, icon }: { title: string, href: string, icon: string }) {
  return (
    <a href={href} className="p-6 border rounded-lg bg-white hover:shadow-md transition-shadow flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-gray-800">{title}</span>
    </a>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats
  const [
    { count: totalMissions },
    { count: activeMissions },
    { count: blockedMissions },
    { count: totalMembers },
  ] = await Promise.all([
    supabase.from('missions').select('*', { count: 'exact', head: true }),
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
    supabase.from('user_roles').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Missions" value={totalMissions || 0} />
        <StatCard title="Active" value={activeMissions || 0} color="blue" />
        <StatCard title="Blocked" value={blockedMissions || 0} color="red" />
        <StatCard title="Team Members" value={totalMembers || 0} color="green" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard 
          title="Create Campaign"
          href="/admin/campaigns/new"
          icon="📁"
        />
        <QuickActionCard 
          title="Create Mission"
          href="/admin/missions/new"
          icon="🎯"
        />
        <QuickActionCard 
          title="Add Member"
          href="/admin/members/new"
          icon="👤"
        />
      </div>
    </div>
  );
}
