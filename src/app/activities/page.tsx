import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import { LogActivityModal } from '@/components/activities/LogActivityModal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type ActivityMemberData = { profiles: { id: string; full_name: string; avatar_url: string | null } };
type ActivityData = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  missions: { id: string; name: string; color_hex: string } | null;
  creator: { id: string; full_name: string; avatar_url: string | null } | null;
  activity_members: ActivityMemberData[];
};

export default async function ActivitiesPage() {
  const supabase = await createClient()

  // 1. Fetch activities with missions, members, and creator
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      missions ( id, name, color_hex ),
      creator:created_by ( id, full_name, avatar_url ),
      activity_members (
        profiles ( id, full_name, avatar_url )
      )
    `)
    .order('event_date', { ascending: false })

  // 2. Fetch data for the modal
  const { data: missions } = await supabase
    .from('missions')
    .select('id, name')
    .order('name')

  const { data: allMembers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .order('full_name')

  // 3. Check user role for permissions
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', currentUser?.id)
    .single()

  const canLogActivity = userProfile?.role === 'admin' || userProfile?.role === 'lead'

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activities</h2>
          <p className="text-muted-foreground">General club activities, workshops, and events.</p>
        </div>
        {canLogActivity && (
          <LogActivityModal 
            missions={missions || []} 
            allMembers={allMembers || []} 
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {activities?.map((activity: ActivityData) => (
          <Card key={activity.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: activity.missions?.color_hex }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px]">
                  {activity.missions?.name}
                </Badge>
                <CardTitle className="text-xl font-bold">{activity.title}</CardTitle>
              </div>
              <div className="text-right">
                 <div className="text-sm font-bold">{activity.event_date ? format(new Date(activity.event_date), 'MMM d') : 'No date'}</div>
                 <div className="text-[10px] text-muted-foreground uppercase">{activity.event_date ? format(new Date(activity.event_date), 'yyyy') : ''}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {activity.description || 'No description provided.'}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 py-2">
                <div className="flex -space-x-2">
                  {activity.activity_members?.slice(0, 5).map((am: ActivityMemberData) => (
                    <Avatar key={am.profiles.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={am.profiles.avatar_url || ''} />
                      <AvatarFallback className="text-[10px]">{am.profiles.full_name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {activity.activity_members?.length > 5 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    +{activity.activity_members.length - 5} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{activity.event_date ? format(new Date(activity.event_date), 'EEEE, p') : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    <span>{activity.activity_members?.length || 0} participants</span>
                  </div>
                </div>
                {activity.creator && (
                  <div className="flex items-center gap-1.5">
                    <span>Logged by</span>
                    <span className="font-semibold">{activity.creator.full_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!activities || activities.length === 0) && (
          <div className="col-span-full text-center py-20 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No activities logged yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
