import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check admin role
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const profile = data as any;

  if (profile?.role !== 'admin') {
    redirect('/dashboard'); // Not admin, redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin nav */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-6">
            <a href="/admin" className="font-semibold">Dashboard</a>
            <a href="/admin/campaigns" className="text-gray-600">Campaigns</a>
            <a href="/admin/missions" className="text-gray-600">Missions</a>
            <a href="/admin/members" className="text-gray-600">Members</a>
          </div>
        </div>
      </nav>
      
      <main className="p-6">{children}</main>
    </div>
  );
}
