'use client'

import { Droppable } from '@hello-pangea/dnd'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: { id: string, title: string, priority: "low" | "medium" | "high", due_date: string | null, assignees: { full_name: string, avatar_url: string | null }[], comment_count: number, attachment_count: number }[]
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'var(--status-todo)'
      case 'in_progress': return 'var(--status-in-progress)'
      case 'review': return 'var(--status-review)'
      case 'done': return 'var(--status-done)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className="flex flex-col w-[300px] flex-shrink-0 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-1.5 h-4 rounded-full" 
            style={{ backgroundColor: getStatusColor(id) }} 
          />
          <h3 className="font-heading text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase">
            {title}
          </h3>
        </div>
        <span className="mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-glass)]">
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 flex flex-col gap-3 min-h-[500px] rounded-[var(--radius-lg)] transition-all duration-200 p-2",
              snapshot.isDraggingOver ? "bg-[rgba(34,211,238,0.03)] border border-dashed border-[var(--accent-cyan-dim)]" : "bg-transparent"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

