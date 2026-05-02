'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Project } from '@/types'
import { Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface ProjectWithStats extends Project {
  lead_name: string | null
  task_stats: {
    status: string
    count: number
  }[]
  total_tasks: number
  completed_tasks: number
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

export function ProjectCard({ project, missionSlug }: { project: ProjectWithStats, missionSlug: string }) {
  const completionRate = project.total_tasks > 0 
    ? Math.round((project.completed_tasks / project.total_tasks) * 100) 
    : 0

  return (
    <Link href={`/missions/${missionSlug}/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
          <Badge variant={
            project.status === 'active' ? 'default' : 
            project.status === 'completed' ? 'secondary' : 'outline'
          }>
            {project.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-4">
            <div className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>Lead: {project.lead_name || 'Unassigned'}</span>
                </div>
                {project.due_date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Due: {format(new Date(project.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-24 h-24 relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: project.completed_tasks },
                        { name: 'Remaining', value: project.total_tasks - project.completed_tasks || 0.1 }
                      ]}
                      innerRadius={30}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <span className="absolute text-[10px] font-bold">{completionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
