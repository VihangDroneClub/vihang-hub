'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Rocket, 
  CheckSquare, 
  Users, 
  ScrollText, 
  Settings,
  Calendar,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Mission {
  id: string
  name: string
  slug: string
  color_hex: string
}

interface Profile {
  full_name: string
  role: string
  avatar_url?: string
}

const mainNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Missions', icon: Rocket, href: '/missions' },
  { label: 'My Tasks', icon: CheckSquare, href: '/tasks' },
  { label: 'Activities', icon: Calendar, href: '/activities' },
  { label: 'Members', icon: Users, href: '/members', adminOnly: true },
  { label: 'Audit Log', icon: ScrollText, href: '/audit', adminOnly: true },
]

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [missions, setMissions] = useState<Mission[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch missions
      const { data: missionsData } = await supabase
        .from('missions')
        .select('id, name, slug, color_hex')
        .order('name')
      if (missionsData) setMissions(missionsData)

      // Fetch profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('user_id', user.id)
          .single()
        if (profileData) setProfile(profileData)
      }
    }
    fetchData()
  }, []) // Removed supabase from dependencies to prevent infinite loop

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]'
      case 'lead': return 'border-[var(--mission-tesseract)] text-[var(--mission-tesseract)]'
      default: return 'border-[var(--text-muted)] text-[var(--text-muted)]'
    }
  }

  return (
    <aside 
      className="hidden md:flex flex-col w-[240px] fixed left-0 top-0 h-screen z-50 border-r border-[var(--border-glass)] bg-[var(--bg-glass)]"
      style={{ backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}
    >
      {/* Top Section - Logo */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" className="absolute inset-0">
            <polygon 
              points="16,2 29,9 29,23 16,30 3,23 3,9" 
              fill="none" 
              stroke="var(--accent-cyan)" 
              strokeWidth="1.5"
            />
          </svg>
          <span className="mono text-[10px] font-bold text-[var(--accent-cyan)] pt-0.5">VH</span>
        </div>
        <span className="font-heading text-[13px] font-semibold tracking-[0.15em] text-[var(--text-secondary)] uppercase">
          Vihang Hub
        </span>
      </div>

      <div className="h-px bg-[var(--border-glass)] mx-4 mb-4" />

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-[2px] overflow-y-auto custom-scrollbar">
        {mainNavItems.map((item) => {
          if (item.adminOnly && userRole !== 'admin') return null

          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-[10px] px-4 py-[10px] rounded-[var(--radius-sm)] text-sm transition-all duration-150 group",
                isActive 
                  ? "bg-[var(--accent-cyan-dim)] border-l-2 border-[var(--accent-cyan)] pl-[14px] text-[var(--accent-cyan)]" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Missions Section */}
        <div className="pt-6">
          <h3 className="mono text-[10px] text-[var(--text-muted)] tracking-[0.12em] uppercase px-4 mb-2">
            Missions
          </h3>
          <div className="space-y-1">
            {missions.map((mission) => {
              const href = `/missions/${mission.slug}`
              const isActive = pathname === href
              return (
                <Link
                  key={mission.id}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[13px] transition-colors group",
                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ 
                      backgroundColor: mission.color_hex,
                      boxShadow: isActive ? `0 0 8px ${mission.color_hex}` : 'none'
                    }} 
                  />
                  <span className={cn(isActive && "font-medium")} style={{ color: isActive ? mission.color_hex : undefined }}>
                    {mission.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto p-4 border-t border-[var(--border-glass)] bg-[var(--bg-glass-hover)]">
        {profile && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-7 h-7 border border-[var(--border-glass)]">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-[10px]">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                {profile.full_name}
              </span>
              <span className={cn(
                "mono text-[8px] uppercase px-1 border rounded-[2px] w-fit mt-0.5",
                getRoleBadgeColor(profile.role)
              )}>
                {profile.role}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Link 
            href="/settings"
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors text-[13px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

