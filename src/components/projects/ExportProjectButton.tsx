'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { exportToCsv } from '@/lib/utils/exportCsv'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ExportProjectButton({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [isExporting, setIsExporting] = useState(false)
  const supabase = createClient()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          title,
          description,
          priority,
          status,
          due_date,
          created_at,
          updated_at,
          task_assignments (
            profiles ( full_name )
          )
        `)
        .eq('project_id', projectId)

      if (error) throw error

      if (data) {
        const formatted = data.map(task => ({
          'Task Title': task.title,
          Description: task.description || '',
          Priority: task.priority,
          Status: task.status,
          'Due Date': task.due_date || '',
          'Assigned Members': (task.task_assignments as unknown as { profiles: { full_name: string } }[]).map(a => a.profiles.full_name).join('; '),
          'Created At': task.created_at,
          'Updated At': task.updated_at
        }))
        
        const date = new Date().toISOString().split('T')[0]
        const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        exportToCsv(`${safeName}_tasks_${date}.csv`, formatted)
        toast.success('Project report exported')
      }
    } catch (e) {
      const error = e as Error;
      toast.error('Export failed: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
      Export Report
    </Button>
  )
}
