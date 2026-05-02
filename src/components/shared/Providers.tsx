'use client'

import * as React from 'react'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Manually force dark mode on the html element
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
