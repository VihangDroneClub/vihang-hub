'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Loader2, AlertTriangle, Trash2, Settings } from 'lucide-react'
import { EditProjectModal } from './EditProjectModal'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { deleteProject } from '@/lib/actions/projects'
import { toast } from 'sonner'

export function ProjectHeaderActions({ 
  project, 
  allLeads, 
  isAdmin, 
  currentUserId,
  missionSlug
}: { project: { id: string, name: string, description: string | null, status: string, due_date: string | null, lead_id: string | null }, allLeads: { id: string, full_name: string }[], isAdmin: boolean, currentUserId: string, missionSlug: string }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isProjectLead = project.lead_id === currentUserId
  const canEdit = isAdmin || isProjectLead
  const canDelete = isAdmin

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(project.id, missionSlug)
      toast.success('Project deleted')
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to delete project')
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Edit Project
        </Button>
      )}
      
      {canDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteOpen(true)}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <EditProjectModal 
        project={project} 
        allLeads={allLeads}
        missionSlug={missionSlug}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the project and all its tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
