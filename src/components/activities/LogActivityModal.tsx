'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createActivity } from '@/lib/actions/activities'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LogActivityModal({ 
  missions, 
  allMembers 
}: { 
  missions: { id: string, name: string }[], 
  allMembers: { id: string, full_name: string, avatar_url: string | null }[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await createActivity({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        missionId: formData.get('missionId') as string,
        eventDate: formData.get('eventDate') as string,
        memberIds: selectedMembers
      })
      toast.success('Activity logged successfully')
      setOpen(false)
      setSelectedMembers([])
      router.refresh()
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to log activity')
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>Record a new workshop, flight, or club event.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title</Label>
            <Input id="title" name="title" placeholder="e.g. Flight Test #4" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What happened?" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="missionId">Mission</Label>
              <Select name="missionId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select mission" />
                </SelectTrigger>
                <SelectContent>
                  {missions.map((mission: { id: string, name: string }) => (
                    <SelectItem key={mission.id} value={mission.id}>
                      {mission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" name="eventDate" type="date" defaultValue={today} required />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Members Involved</Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border rounded-md">
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
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Log Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
