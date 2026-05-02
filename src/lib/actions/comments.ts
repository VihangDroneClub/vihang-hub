'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function postComment(taskId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const { error } = await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      author_id: profile.id,
      content
    })

  if (error) throw new Error(error.message)
  
  // Trigger Notifications
  const { data: task } = await supabase.from('tasks').select('title').eq('id', taskId).single()
  const { data: assignments } = await supabase.from('task_assignments').select('member_id').eq('task_id', taskId)
  
  if (assignments) {
    for (const assignment of assignments) {
      if (assignment.member_id !== profile.id) {
        await createNotification({
          recipientId: assignment.member_id,
          type: 'comment_posted',
          entityType: 'task',
          entityId: taskId,
          message: `${profile.full_name} commented on: ${task?.title}`
        })
      }
    }
  }

  revalidatePath(`/tasks/${taskId}`)
}

export async function deleteComment(commentId: string, taskId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/tasks/${taskId}`)
}
