'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Loader2, AlertTriangle, Trash2 } from 'lucide-react'
import { EditTaskModal } from './EditTaskModal'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { deleteTask } from '@/lib/actions/tasks'
import { toast } from 'sonner'
import { useTaskWatch } from '@/lib/hooks/useTaskWatch'

export function TaskHeaderActions({ 
  task, 
  allMembers, 
  isAdmin, 
  isLead,
  missionSlug,
  projectId
}: { task: { id: string, title: string, status: string, description: string | null, priority: string, due_date: string | null, task_assignments: { profiles: { id: string } }[] }, allMembers: { id: string, full_name: string, avatar_url: string | null }[], isAdmin: boolean, isLead: boolean, missionSlug: string, projectId: string }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useTaskWatch(task.id, `/missions/${missionSlug}/projects/${projectId}`)

  const canEdit = isAdmin || isLead
  const canDelete = isAdmin

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.id, missionSlug, projectId)
      toast.success('Task deleted')
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to delete task')
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          Edit Task
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {canDelete && (
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteOpen(true)}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTaskModal 
        task={task} 
        allMembers={allMembers}
        missionSlug={missionSlug}
        projectId={projectId}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Task
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the task and all its comments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
