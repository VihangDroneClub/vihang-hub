import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck } from 'lucide-react'
import { AddMemberModal } from '@/components/shared/AddMemberModal'
import { MemberActions } from '@/components/members/MemberActions'
import { redirect } from 'next/navigation'

export default async function MembersPage() {
  const supabase = await createClient()

  // Security: Role Check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user?.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">Manage club members and their roles.</p>
        </div>
        <AddMemberModal />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="relative overflow-hidden group">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-20 h-20 border-4 border-background shadow-lg group-hover:scale-105 transition-transform">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="text-xl">{profile.full_name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <h3 className="font-bold">{profile.full_name}</h3>
                  <Badge variant={
                    profile.role === 'admin' ? 'default' : 
                    profile.role === 'lead' ? 'secondary' : 'outline'
                  }>
                    {profile.role}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <ShieldCheck className="w-3 h-3" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="absolute top-2 right-2">
                <MemberActions 
                  memberId={profile.id} 
                  memberName={profile.full_name} 
                  currentRole={profile.role} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
