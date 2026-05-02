'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createProject } from '@/lib/actions/projects'
import { toast } from 'sonner'

export function CreateProjectModal({ 
  missionId, 
  missionSlug, 
  profiles 
}: { 
  missionId: string, 
  missionSlug: string, 
  profiles: { id: string, full_name: string }[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [leadId, setLeadId] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    if (leadId) formData.set('leadId', leadId)
    
    try {
      await createProject(formData)
      toast.success('Project created successfully')
      setOpen(false)
      setLeadId('')
    } catch (e) {
      const error = e as Error;
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="missionId" value={missionId} />
          <input type="hidden" name="missionSlug" value={missionSlug} />
          
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" name="name" placeholder="e.g. Swarm Logic Alpha" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Briefly describe the project goals..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadId">Project Lead</Label>
            <Select onValueChange={(v) => setLeadId(v || '')} value={leadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="leadId" value={leadId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
