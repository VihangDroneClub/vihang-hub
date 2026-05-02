'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  const modes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how Vihang Hub looks on your device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = theme === mode.id
            
            return (
              <button
                key={mode.id}
                onClick={() => setTheme(mode.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                  isActive 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-muted hover:border-muted-foreground/50 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
