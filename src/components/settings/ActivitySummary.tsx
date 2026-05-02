import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, MessageSquare, History } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivitySummaryProps {
  taskStats: { status: string, count: number }[]
  commentCount: number
  lastActive: string | null
}

export function ActivitySummary({ taskStats, commentCount, lastActive }: ActivitySummaryProps) {
  const statusConfig: Record<string, { label: string, icon?: React.ElementType, variant?: "outline" | "secondary" | "default" }> = {
    todo: { label: 'To Do', icon: Circle, variant: 'outline' as const },
    in_progress: { label: 'In Progress', icon: Clock, variant: 'secondary' as const },
    review: { label: 'Review', icon: History, variant: 'secondary' as const },
    done: { label: 'Done', icon: CheckCircle2, variant: 'default' as const },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Activity Summary</CardTitle>
        <CardDescription>Overview of your contributions and assignments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tasks Assigned</h4>
          <div className="flex flex-wrap gap-2">
            {Object.keys(statusConfig).map((status) => {
              const stat = taskStats.find(s => s.status === status)
              const count = stat?.count || 0
              const config = statusConfig[status]
              const Icon = config.icon
              
              return (
                <Badge key={status} variant={config.variant} className="flex items-center gap-1.5 py-1 px-2.5">
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{count} {config.label}</span>
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Comments Posted</span>
            </div>
            <p className="text-2xl font-bold">{commentCount}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <History className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Last Active</span>
            </div>
            <p className="text-sm font-semibold truncate">
              {lastActive ? formatDistanceToNow(new Date(lastActive), { addSuffix: true }) : 'Never'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
