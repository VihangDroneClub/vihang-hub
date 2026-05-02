'use client'

import { useState } from 'react'
import { 
  MoreHorizontal, 
  UserCog, 
  UserMinus, 
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateMemberRole, removeMember } from '@/lib/actions/members'
import { toast } from 'sonner'

interface MemberActionsProps {
  memberId: string
  memberName: string
  currentRole: string
}

export function MemberActions({ memberId, memberName, currentRole }: MemberActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newRole, setNewRole] = useState(currentRole)

  const handleUpdateRole = async () => {
    setIsLoading(true)
    try {
      await updateMemberRole(memberId, newRole)
      toast.success('Member role updated')
      setIsUpdateOpen(false)
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    setIsLoading(true)
    try {
      await removeMember(memberId)
      toast.success('Member removed')
      setIsRemoveOpen(false)
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to remove member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsUpdateOpen(true)}>
            <UserCog className="w-4 h-4 mr-2" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive" 
            onClick={() => setIsRemoveOpen(true)}
            variant="destructive"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Update Role Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Member Role</DialogTitle>
            <DialogDescription>
              Change the role for <strong>{memberName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(v) => setNewRole(v || 'member')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Remove Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{memberName}</strong> from Vihang Hub? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
