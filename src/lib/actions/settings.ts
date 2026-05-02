'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: { 
  fullName: string 
  avatarUrl?: string 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // 1. Get current profile to check for old avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single()

  // 2. If a new avatar is being set, delete the old one from storage
  if (formData.avatarUrl && profile?.avatar_url && formData.avatarUrl !== profile.avatar_url) {
    try {
      // Extract path from URL: .../storage/v1/object/public/avatars/USER_ID/FILENAME
      const urlParts = profile.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const oldPath = `${user.id}/${fileName}`
      
      await supabase.storage
        .from('avatars')
        .remove([oldPath])
    } catch (e) {
      console.error('Failed to cleanup old avatar:', e)
      // Non-blocking, still proceed with profile update
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.fullName,
      avatar_url: formData.avatarUrl
    })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/settings')
  revalidatePath('/members')
  revalidatePath('/dashboard')
}
