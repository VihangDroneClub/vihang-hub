'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateTask } from '@/lib/actions/tasks'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function EditTaskModal({ 
  task, 
  allMembers,
  missionSlug,
  projectId,
  open,
  onOpenChange
}: { task: { id: string, title: string, description: string | null, priority: string, due_date: string | null, task_assignments: { profiles: { id: string } }[] }, allMembers: { id: string, full_name: string, avatar_url: string | null }[], missionSlug: string, projectId: string, open: boolean, onOpenChange: (o: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    task.task_assignments.map((a: { profiles: { id: string } }) => a.profiles.id)
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await updateTask({
        id: task.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        priority: formData.get('priority') as "low" | "medium" | "high",
        dueDate: formData.get('dueDate') as string || null,
        assignedMembers: selectedMembers,
        missionSlug,
        projectId
      })
      toast.success('Task updated successfully')
      onOpenChange(false)
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to update task')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update the details and assignments for this task.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={task.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={task.description || undefined} rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={task.priority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={task.due_date ? task.due_date.split('T')[0] : ''} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Assigned Members</Label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border rounded-md">
              {allMembers.map((member: { id: string, full_name: string, avatar_url: string | null }) => {
                const isSelected = selectedMembers.includes(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-xs ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-accent border-input'
                    }`}
                  >
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={member.avatar_url || ''} />
                      <AvatarFallback>{member.full_name[0]}</AvatarFallback>
                    </Avatar>
                    {member.full_name}
                  </button>
                )
              })}
              {allMembers.length === 0 && <p className="text-xs text-muted-foreground p-2">No members found.</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
