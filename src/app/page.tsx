import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('campaigns')
    .select(`
      *,
      profiles (full_name)
    `)
    .order('created_at', { ascending: false })

  const campaigns = data as any[];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-2">Vihang Campaigns</h1>
        <p className="text-lg text-gray-500">Explore the major initiatives and goals of Vihang Drone Club.</p>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="block h-full group">
              <div className="h-full flex flex-col border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {campaign.title}
                  </h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${
                    campaign.status === 'active' ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-50 text-gray-700 ring-gray-200'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {campaign.description || 'No description provided.'}
                </p>
                <div className="text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  Started: {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No campaigns found</h3>
          <p className="text-gray-500">Check back later for new club initiatives.</p>
        </div>
      )}
    </div>
  )
}
