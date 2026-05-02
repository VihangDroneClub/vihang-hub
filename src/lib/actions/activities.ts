'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createActivity(formData: {
  title: string
  description: string
  missionId: string
  eventDate: string
  memberIds: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  // 1. Insert activity
  const { data: activity, error: activityError } = await supabase
    .from('activities')
    .insert({
      title: formData.title,
      description: formData.description,
      mission_id: formData.missionId,
      event_date: formData.eventDate,
      created_by: profile.id
    })
    .select()
    .single()

  if (activityError) throw new Error(activityError.message)

  // 2. Insert members
  if (formData.memberIds.length > 0) {
    const memberInserts = formData.memberIds.map(memberId => ({
      activity_id: activity.id,
      member_id: memberId
    }))
    
    const { error: membersError } = await supabase
      .from('activity_members')
      .insert(memberInserts)

    if (membersError) throw new Error(membersError.message)
  }

  revalidatePath('/activities')
  revalidatePath('/dashboard')
}
