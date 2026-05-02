'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotification(data: {
  recipientId: string
  type: 'task_assigned' | 'comment_posted' | 'status_changed'
  entityType: 'task' | 'project'
  entityId: string
  message: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const { data: actor } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!actor || actor.id === data.recipientId) return

  await supabase
    .from('notifications')
    .insert({
      recipient_id: data.recipientId,
      actor_id: actor.id,
      type: data.type,
      entity_type: data.entityType,
      entity_id: data.entityId,
      message: data.message
    })
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  
  revalidatePath('/')
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', profile?.id)
    .eq('is_read', false)
  
  revalidatePath('/')
}
