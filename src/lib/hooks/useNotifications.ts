'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'

export function useNotifications(profileId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!profileId) return

    // 1. Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', profileId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) setNotifications(data as Notification[])
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', profileId)
        .eq('is_read', false)
      
      if (count !== null) setUnreadCount(count)
    }

    fetchNotifications()

    // 2. Subscribe to realtime
    const channel = supabase
      .channel(`user-notifications-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${profileId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 9)])
            setUnreadCount(prev => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Notification
            setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n))
            if (updated.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, supabase])

  return { notifications, unreadCount }
}
