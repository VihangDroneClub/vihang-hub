'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { createTask } from '@/lib/actions/tasks'
import { toast } from 'sonner'

interface Member {
  id: string
  full_name: string
}

export function CreateTaskModal({
  projectId,
  missionSlug
}: {
  projectId: string,
  missionSlug: string
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [priority, setPriority] = useState<string>('medium')
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]) // For now, single select, so only one ID

  useEffect(() => {
    async function fetchMembers() {
      const supabase = createClient()
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name')
      
      if (error) {
        console.error('Error fetching members:', error)
        toast.error('Failed to load members for assignment.')
      } else {
        setAllMembers(profiles || [])
      }
    }
    fetchMembers()
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    if (priority) formData.set('priority', priority)
    formData.set('assignedMembers', JSON.stringify(selectedMembers)) // Pass selected members as JSON string
    
    try {
      await createTask(formData)
      toast.success('Task created successfully')
      setOpen(false)
      setPriority('medium')
      setSelectedMembers([]) // Clear selected members after creation
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
            New Task
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="missionSlug" value={missionSlug} />
          
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" placeholder="e.g. Design CAD model" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What needs to be done?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select onValueChange={(v) => setPriority(v || 'medium')} value={priority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="priority" value={priority} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedMembers">Assign Members</Label>
            <Select onValueChange={(v) => setSelectedMembers(v ? [v] : [])} value={selectedMembers[0] || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {allMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
