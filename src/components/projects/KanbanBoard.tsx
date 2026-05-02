'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { toast } from 'sonner'
import { useRealtimeTasks } from '@/lib/hooks/useRealtimeTasks'
import { updateTaskStatus } from '@/lib/actions/tasks'
import { TaskStatus } from '@/types'

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
]

export function KanbanBoard({ 
  initialTasks, 
  missionSlug,
  projectId
}: { 
  initialTasks: { id: string, status: string, title: string, priority: "low" | "medium" | "high", due_date: string | null, assignees: { full_name: string, avatar_url: string | null }[], comment_count: number, attachment_count: number }[], 
  missionSlug: string,
  projectId: string 
}) {
  const [tasks, setTasks] = useState(initialTasks)
  
  useRealtimeTasks(projectId)

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Optimistic Update
    const updatedTasks = Array.from(tasks)
    const taskIndex = updatedTasks.findIndex(t => t.id === draggableId)
    if (taskIndex === -1) return

    const [movedTask] = updatedTasks.splice(taskIndex, 1)
    movedTask.status = destination.droppableId as string
    updatedTasks.splice(destination.index, 0, movedTask)
    
    setTasks(updatedTasks)

    // Update DB via Server Action
    try {
      await updateTaskStatus(
        draggableId, 
        destination.droppableId as TaskStatus, 
        missionSlug, 
        projectId
      )
    } catch {
      toast.error('Failed to update task status')
      setTasks(initialTasks) // Rollback
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasks.filter(t => t.status === column.id)}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
