'use client'

import { useState } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function NotificationBell({ profileId }: { profileId: string }) {
  const { notifications, unreadCount } = useNotifications(profileId)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleNotificationClick = async (n: { id: string, is_read: boolean, entity_type: string, entity_id: string }) => {
    if (!n.is_read) {
      await markAsRead(n.id)
    }
    setIsOpen(false)
    if (n.entity_type === 'task') {
      router.push(`/tasks/${n.entity_id}`)
    } else if (n.entity_type === 'project') {
      // Logic for project link if needed
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5 flex items-center justify-center text-[10px]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h3 className="font-bold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs px-2"
              onClick={() => markAllAsRead()}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1",
                    !n.is_read && "bg-primary/5"
                  )}
                >
                  <p className={cn("text-xs leading-relaxed", !n.is_read ? "font-semibold" : "text-muted-foreground")}>
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                    {!n.is_read && (
                      <div className="w-1.5 h-1.25 bg-primary rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No notifications yet.
            </div>
          )}
        </div>
        <div className="p-2 border-t bg-muted/10">
          <Button variant="ghost" className="w-full text-xs h-8">
            View All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
