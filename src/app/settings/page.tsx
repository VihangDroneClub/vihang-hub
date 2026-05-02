import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { SecuritySettings } from '@/components/settings/SecuritySettings'
import { AppearanceSettings } from '@/components/settings/AppearanceSettings'
import { ActivitySummary } from '@/components/settings/ActivitySummary'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 2. Fetch Activity Stats
  // Task Stats
  const { data: assignments } = await supabase
    .from('task_assignments')
    .select('task_id')
    .eq('member_id', profile?.id)

  const taskIds = assignments?.map(a => a.task_id) || []
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .in('id', taskIds)

  const taskStats = ['todo', 'in_progress', 'review', 'done'].map(status => ({
    status,
    count: tasks?.filter(t => t.status === status).length || 0
  }))

  // Comment Count
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile?.id)

  // Last Active
  const { data: lastAudit } = await supabase
    .from('audit_log')
    .select('created_at')
    .eq('actor_id', profile?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="capitalize px-3 py-1">
            {profile?.role} Account
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <ProfileSettings profile={profile} userEmail={user.email!} />
          <SecuritySettings />
        </div>
        
        <div className="space-y-8">
          <ActivitySummary 
            taskStats={taskStats} 
            commentCount={commentCount || 0} 
            lastActive={lastAudit?.created_at || null} 
          />
          <AppearanceSettings />
        </div>
      </div>
    </div>
  )
}
