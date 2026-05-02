'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMemberRole(profileId: string, role: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/members')
}

export async function removeMember(profileId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/members')
}
