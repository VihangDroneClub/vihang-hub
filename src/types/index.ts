import { Tables } from './supabase'

export type MissionWithTasks = Tables<'missions'> & {
  tasks: Tables<'tasks'>[]
  owner: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email'> | null
  campaign: Pick<Tables<'campaigns'>, 'id' | 'title'> | null
}

export type TaskWithAssignee = Tables<'tasks'> & {
  assignee: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'> | null
}
