'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Rocket, 
  CheckSquare, 
  Calendar,
  User
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Missions', icon: Rocket, href: '/missions' },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { label: 'Activities', icon: Calendar, href: '/activities' },
  { label: 'Profile', icon: User, href: '/settings' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-[60px] items-center justify-around border-t border-[var(--border-glass)] bg-[var(--bg-glass)] px-4 pb-[env(safe-area-inset-bottom)]" style={{ backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)' }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                <Link
                  href={item.href}
                  className="relative flex h-full items-center justify-center px-4"
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 h-[12px] w-[2px] -translate-x-1/2 rounded-full bg-[var(--accent-cyan)]" />
                  )}
                  <item.icon 
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      isActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-muted)]"
                    )} 
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-glass)]">
                <p className="text-xs font-medium">{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
