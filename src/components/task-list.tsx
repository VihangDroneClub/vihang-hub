'use client';

import { useState } from 'react';
import { AddTaskDialog } from './add-task-dialog';
import { UploadEvidenceDialog } from './upload-evidence-dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: { name: string } | null;
  evidence_photos: string[];
  completed_at: string | null;
}

export function TaskList({ tasks, missionId, canEdit }: { 
  tasks: Task[];
  missionId: string;
  canEdit: boolean;
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    needs_review: tasks.filter(t => t.status === 'needs_review'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {canEdit && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Add Task
          </button>
        )}
      </div>

      <TaskColumn title="To Do" tasks={groupedTasks.todo} color="gray" canEdit={canEdit} />
      <TaskColumn title="In Progress" tasks={groupedTasks.in_progress} color="blue" canEdit={canEdit} />
      <TaskColumn title="Needs Review" tasks={groupedTasks.needs_review} color="yellow" canEdit={canEdit} />
      <TaskColumn title="Completed" tasks={groupedTasks.completed} color="green" canEdit={canEdit} />
      
      {showAddDialog && (
        <AddTaskDialog 
          missionId={missionId}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}

function TaskColumn({ title, tasks, color, canEdit }: { 
  title: string; 
  tasks: Task[]; 
  color: string;
  canEdit: boolean;
}) {
  const colorClasses: Record<string, string> = {
    gray: 'border-gray-300 bg-gray-50',
    blue: 'border-blue-300 bg-blue-50',
    yellow: 'border-yellow-300 bg-yellow-50',
    green: 'border-green-300 bg-green-50',
  };

  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        {title}
        <span className="text-sm text-gray-500">({tasks.length})</span>
      </h3>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} color={colorClasses[color]} canEdit={canEdit} />
        ))}
        {tasks.length === 0 && <p className="text-sm text-gray-400 italic">No tasks</p>}
      </div>
    </div>
  );
}

function TaskCard({ task, color, canEdit }: { task: Task; color: string; canEdit: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [showUpload, setShowUpload] = useState(false);

  const updateStatus = async (newStatus: string) => {
    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);
    
    router.refresh();
  };

  return (
    <div className={`p-3 border-l-4 rounded ${color} bg-white`}>
      <div className="font-medium">{task.title}</div>
      {task.assignee && <div className="text-sm text-gray-600">{task.assignee.name}</div>}
      
      {canEdit && (
        <div className="flex gap-2 items-center mt-2">
          <select 
            value={task.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="needs_review">Needs Review</option>
            <option value="completed">Completed</option>
          </select>
          
          {(task.status === 'in_progress' || task.status === 'needs_review') && (
            <button
              onClick={() => setShowUpload(true)}
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✓ Complete
            </button>
          )}
        </div>
      )}
      
      {showUpload && (
        <UploadEvidenceDialog 
          taskId={task.id}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
