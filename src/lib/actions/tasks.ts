'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TaskPriority, TaskStatus } from '@/types'
import { createNotification } from './notifications'

export async function updateTask(formData: {
  id: string
  title: string
  description: string
  priority: TaskPriority
  dueDate: string | null
  assignedMembers: string[]
  missionSlug: string
  projectId: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  // 1. Update task basic info
  const { error: taskError } = await supabase
    .from('tasks')
    .update({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      due_date: formData.dueDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', formData.id)

  if (taskError) throw new Error(taskError.message)

  // 2. Sync Assignments
  const { data: currentAssignments } = await supabase
    .from('task_assignments')
    .select('member_id')
    .eq('task_id', formData.id)

  const currentMemberIds = currentAssignments?.map(a => a.member_id) || []
  const toRemove = currentMemberIds.filter(id => !formData.assignedMembers.includes(id))
  const toAdd = formData.assignedMembers.filter(id => !currentMemberIds.includes(id))

  if (toRemove.length > 0) {
    await supabase.from('task_assignments').delete().eq('task_id', formData.id).in('member_id', toRemove)
  }

  if (toAdd.length > 0) {
    const newAssignments = toAdd.map(memberId => ({
      task_id: formData.id,
      member_id: memberId,
      assigned_by: profile.id
    }))
    
    await supabase.from('task_assignments').insert(newAssignments)

    // Trigger Notifications for NEW members
    for (const memberId of toAdd) {
      await createNotification({
        recipientId: memberId,
        type: 'task_assigned',
        entityType: 'task',
        entityId: formData.id,
        message: `${profile.full_name} assigned you to task: ${formData.title}`
      })
    }
  }

  revalidatePath(`/tasks/${formData.id}`)
  revalidatePath(`/missions/${formData.missionSlug}/projects/${formData.projectId}`)
}

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus, missionSlug: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  const { data: task, error } = await supabase
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select('title')
    .single()

  if (error) throw new Error(error.message)

  // Notify assigned members
  const { data: assignments } = await supabase.from('task_assignments').select('member_id').eq('task_id', taskId)
  if (assignments) {
    for (const am of assignments) {
      if (am.member_id !== profile?.id) {
        await createNotification({
          recipientId: am.member_id,
          type: 'status_changed',
          entityType: 'task',
          entityId: taskId,
          message: `${profile?.full_name} moved ${task.title} to ${newStatus}`
        })
      }
    }
  }

  revalidatePath(`/missions/${missionSlug}/projects/${projectId}`)
}

export async function deleteTask(taskId: string, missionSlug: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath(`/missions/${missionSlug}/projects/${projectId}`)
  redirect(`/missions/${missionSlug}/projects/${projectId}`)
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  
  const projectId = formData.get('projectId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as TaskPriority
  const dueDate = formData.get('dueDate') as string
  const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null
  const missionSlug = formData.get('missionSlug') as string
  const assignedMembers = JSON.parse(formData.get('assignedMembers') as string) as string[]

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title,
      description,
      priority,
      due_date: formattedDueDate,
      status: 'todo'
    }).select('id').single()

  if (error) {
    throw new Error(error.message)
  }

  if (assignedMembers.length > 0) {
    const newAssignments = assignedMembers.map(memberId => ({
      task_id: newTask.id,
      member_id: memberId,
      assigned_by: profile.id
    }))
    await supabase.from('task_assignments').insert(newAssignments)

    // Trigger Notifications for NEW members
    for (const memberId of assignedMembers) {
      await createNotification({
        recipientId: memberId,
        type: 'task_assigned',
        entityType: 'task',
        entityId: newTask.id,
        message: `${profile.full_name} assigned you to task: ${title}`
      })
    }
  }

  console.log('Revalidating paths:', `/missions/${missionSlug}/projects/${projectId}`, '/tasks', '/dashboard')
  revalidatePath(`/missions/${missionSlug}/projects/${projectId}`)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
}
