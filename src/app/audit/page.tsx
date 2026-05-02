import { createClient } from '@/lib/supabase/server'
import { AuditFilterBar } from '@/components/audit/AuditFilterBar'
import { AuditLogList } from '@/components/audit/AuditLogList'
import { ExportAuditButton } from '@/components/audit/ExportAuditButton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AuditPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const supabase = await createClient()
  const params = await searchParams

  const missionId = params.mission
  const actor = params.actor
  const type = params.type
  const from = params.from
  const to = params.to
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Security: Role Check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myProfile } = await supabase.from('profiles').select('role').eq('user_id', user?.id).single()

  if (myProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const isAdmin = true 

  // 1. Fetch filter options
  const [{ data: profiles }, { data: missions }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').order('full_name'),
    supabase.from('missions').select('id, name').order('name')
  ])

  // 2. Resolve Mission Entities if mission filter active
  let entityIds: string[] | null = null
  if (missionId) {
    const [{ data: projects }, { data: activities }] = await Promise.all([
      supabase.from('projects').select('id').eq('mission_id', missionId),
      supabase.from('activities').select('id').eq('mission_id', missionId)
    ])
    
    const pIds = projects?.map(p => p.id) || []
    const aIds = activities?.map(a => a.id) || []
    
    // Also fetch tasks for these projects
    const { data: tasks } = await supabase.from('tasks').select('id').in('project_id', pIds)
    const tIds = tasks?.map(t => t.id) || []
    
    entityIds = [...pIds, ...aIds, ...tIds]
  }

  // 3. Build Audit Query
  let query = supabase.from('audit_log').select(`
    *,
    profiles ( id, full_name, avatar_url, role )
  `, { count: 'exact' })

  if (actor) query = query.eq('actor_id', actor)
  if (type) query = query.eq('entity_type', type)
  if (missionId) {
    if (entityIds && entityIds.length > 0) {
      query = query.in('entity_id', entityIds)
    } else {
      query = query.eq('entity_id', '00000000-0000-0000-0000-000000000000')
    }
  }
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to + 'T23:59:59')

  const { data: logs, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Audit Log</h1>
          <p className="mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">
            System Records / Tactical Traceability
          </p>
        </div>
        {isAdmin && (
          <ExportAuditButton filters={params} entityIds={entityIds} />
        )}
      </div>

      <AuditFilterBar profiles={profiles || []} missions={missions || []} />

      <div className="flex items-center justify-between text-xs mono text-[var(--text-secondary)] uppercase tracking-tight">
        <p>Telemetry: {logs?.length || 0} / {count || 0} Entries</p>
        <div className="flex items-center gap-4">
          <Link href={page > 1 ? updatePageParam(params, page - 1) : '#'}>
            <Button variant="ghost" size="sm" disabled={page <= 1} className="h-8 hover:bg-[var(--border-subtle)]">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
          </Link>
          <span className="font-bold text-[var(--accent-cyan)] px-2">Page {page} of {totalPages || 1}</span>
          <Link href={page < totalPages ? updatePageParam(params, page + 1) : '#'}>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} className="h-8 hover:bg-[var(--border-subtle)]">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <AuditLogList logs={logs || []} />
    </div>
  )
}

function updatePageParam(params: Record<string, string | undefined>, page: number) {
  const newParams = new URLSearchParams(params as Record<string, string>)
  newParams.set('page', page.toString())
  return `?${newParams.toString()}`
}
