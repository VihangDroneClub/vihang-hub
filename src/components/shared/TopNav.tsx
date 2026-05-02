'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function TopNav() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-end px-6">
        <button 
          onClick={handleSignOut}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </header>
  )
}
