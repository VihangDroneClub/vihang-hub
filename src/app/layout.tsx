import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/shared/Providers'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import { TopNav } from '@/components/shared/TopNav'
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: 'Vihang Hub',
  description: 'Club Tracking System for Vihang Drone Club',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    profile = data as any
  }

  return (
    <html lang="en" className={`dark`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <TooltipProvider>
            <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#030712] selection:bg-cyan-500/30">
              {/* Background Texture & Noise */}
              <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
              />
              <div 
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 100%, rgba(34,211,238,0.06) 0%, transparent 50%)
                  `
                }}
              />

              {/* Main Content Layout */}
              <div className="relative z-10 flex min-h-[100dvh]">
                {user && <Sidebar userRole={profile?.role || 'member'} />}
                
                <div className={cn(
                  "flex flex-col flex-1 min-w-0 transition-all duration-300",
                  user ? "md:ml-[240px]" : ""
                )}>
                  {user && <TopNav />}
                  <main className={cn(
                    "flex-1",
                    user ? "pb-[60px] md:pb-0" : ""
                  )}>
                    {children}
                  </main>
                </div>

                {user && <MobileNav />}
              </div>
            </div>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  )
}
