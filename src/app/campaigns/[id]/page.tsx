import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MissionCard } from '@/components/mission-card'
import Link from 'next/link'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('campaigns')
    .select(`
      *,
      profiles (full_name)
    `)
    .eq('id', id)
    .single()

  const campaign = data as any;

  if (!campaign) notFound()

  const { data: missionsData } = await supabase
    .from('missions')
    .select(`
      *,
      owner:profiles!owner_id(id, full_name),
      campaign:campaigns!campaign_id(id, title),
      tasks(id, status)
    `)
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    
  const missions = missionsData as any[];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <nav className="text-sm mb-6 flex gap-2 text-gray-500">
        <Link href="/" className="hover:text-gray-900 transition-colors">Campaigns</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{campaign.title}</span>
      </nav>

      <div className="mb-10 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {campaign.title}
          </h1>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ring-1 ring-inset ${
            campaign.status === 'active' ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-50 text-gray-700 ring-gray-200'
          }`}>
            {campaign.status}
          </span>
        </div>
        <p className="text-lg text-gray-600 mb-6">{campaign.description}</p>
        <div className="flex gap-6 text-sm text-gray-500">
          <div>Created by: <span className="font-medium text-gray-700">{(campaign.profiles as any)?.full_name || 'System'}</span></div>
          <div>Started: <span className="font-medium text-gray-700">{new Date(campaign.created_at).toLocaleDateString()}</span></div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Missions</h2>
          <p className="text-gray-500">Projects executing under this campaign.</p>
        </div>
      </div>

      {missions && missions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No missions found</h3>
          <p className="text-gray-500">This campaign doesn't have any active missions yet.</p>
        </div>
      )}
    </div>
  )
}
