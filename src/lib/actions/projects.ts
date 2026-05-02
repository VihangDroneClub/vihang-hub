'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ProjectStatus } from '@/types'

export async function updateProject(formData: {
  id: string
  name: string
  description: string
  status: ProjectStatus
  dueDate: string | null
  leadId: string | null
  missionSlug: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .update({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      due_date: formData.dueDate,
      lead_id: formData.leadId
    })
    .eq('id', formData.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/missions/${formData.missionSlug}/projects/${formData.id}`)
  revalidatePath(`/missions/${formData.missionSlug}`)
}

export async function deleteProject(projectId: string, missionSlug: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) throw new Error(error.message)

  revalidatePath(`/missions/${missionSlug}`)
  redirect(`/missions/${missionSlug}`)
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const missionId = formData.get('missionId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const leadId = formData.get('leadId') as string
  const dueDate = formData.get('dueDate') as string
  const missionSlug = formData.get('missionSlug') as string

  if (!missionId || !name) {
    throw new Error('Mission ID and Name are required')
  }

  const { error } = await supabase
    .from('projects')
    .insert({
      mission_id: missionId,
      name,
      description,
      lead_id: leadId || null,
      due_date: dueDate || null,
      status: 'planning'
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/missions/${missionSlug}`)
}
