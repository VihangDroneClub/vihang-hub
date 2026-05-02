'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { exportToCsv } from '@/lib/utils/exportCsv'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ExportAuditButton({ filters, entityIds }: { filters: { actor?: string, type?: string, from?: string, to?: string }, entityIds: string[] | null }) {
  const [isExporting, setIsExporting] = useState(false)
  const supabase = createClient()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let query = supabase.from('audit_log').select(`
        created_at,
        profiles ( full_name ),
        action,
        entity_type,
        entity_id,
        old_value,
        new_value
      `)

      if (filters.actor) query = query.eq('actor_id', filters.actor)
      if (filters.type) query = query.eq('entity_type', filters.type)
      
      if (entityIds) {
        if (entityIds.length > 0) {
          query = query.in('entity_id', entityIds)
        } else {
          query = query.eq('entity_id', '00000000-0000-0000-0000-000000000000')
        }
      }

      if (filters.from) query = query.gte('created_at', filters.from)
      if (filters.to) query = query.lte('created_at', filters.to + 'T23:59:59')

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const formatted = data.map(log => ({
          Timestamp: log.created_at,
          Actor: (log.profiles as { full_name?: string } | null)?.full_name || 'System',
          Action: log.action,
          'Entity Type': log.entity_type,
          'Entity ID': log.entity_id,
          'Old Value': log.old_value,
          'New Value': log.new_value
        }))
        
        const date = new Date().toISOString().split('T')[0]
        exportToCsv(`vihang_audit_${date}.csv`, formatted)
        toast.success('Audit log exported')
      }
    } catch (e) {
      const error = e as Error;
      toast.error('Export failed: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
      Export CSV
    </Button>
  )
}
