'use client';

import { useState, useEffect } from 'react';
import { AddTaskDialog } from './add-task-dialog';
import { UploadEvidenceDialog } from './upload-evidence-dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: { id: string, name?: string, email?: string } | null;
  evidence_photos: string[];
  completed_at: string | null;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'gray' },
  { id: 'in_progress', title: 'In Progress', color: 'blue' },
  { id: 'needs_review', title: 'Needs Review', color: 'yellow' },
  { id: 'completed', title: 'Completed', color: 'green' },
];

export function TaskList({ tasks: initialTasks, missionId, missionOwnerId, currentUser }: { 
  tasks: Task[];
  missionId: string;
  missionOwnerId: string | null;
  currentUser: { id: string, role: string } | null;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    setTasks(initialTasks);
  }, [initialTasks]);

  const canAddTask = !!currentUser;

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Check fine-grained permissions for drag and drop
    const isAssignee = currentUser?.id === task.assignee?.id;
    const isUnassigned = task.assignee === null;
    const isMissionOwner = currentUser?.id === missionOwnerId;
    const isAdmin = currentUser?.role === 'admin';
    
    // For UI dragging, allow if any of these match. If backend fails, it will revert.
    const canDrag = currentUser && (isAdmin || isMissionOwner || isUnassigned || true); // Allow drag, backend will reject if not allowed
    
    if (!currentUser) {
      alert("You must be logged in to update tasks.");
      return;
    }

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    const updatedTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    // Update in DB
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId);

    if (error) {
      alert('Failed to update task status. You may not have permission.');
      setTasks(initialTasks); // revert on failure
    } else {
      router.refresh();
    }
  };

  // Prevent SSR mismatch with dnd
  if (!isMounted) {
    return <div className="h-64 flex items-center justify-center text-gray-400">Loading board...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Tasks Board</h2>
        {canAddTask && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {COLUMNS.map(col => (
            <TaskColumn 
              key={col.id} 
              column={col} 
              tasks={tasks.filter(t => t.status === col.id)} 
              currentUser={currentUser}
              missionOwnerId={missionOwnerId}
            />
          ))}
        </div>
      </DragDropContext>
      
      {showAddDialog && (
        <AddTaskDialog 
          missionId={missionId}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}

function TaskColumn({ column, tasks, currentUser, missionOwnerId }: { 
  column: { id: string, title: string, color: string }; 
  tasks: Task[]; 
  currentUser: { id: string, role: string } | null;
  missionOwnerId: string | null;
}) {
  const colorClasses: Record<string, string> = {
    gray: 'border-gray-200 bg-gray-50/60',
    blue: 'border-blue-200 bg-blue-50/60',
    yellow: 'border-yellow-200 bg-yellow-50/60',
    green: 'border-green-200 bg-green-50/60',
  };

  const headerColors: Record<string, string> = {
    gray: 'text-gray-700 bg-gray-200/50',
    blue: 'text-blue-700 bg-blue-200/50',
    yellow: 'text-yellow-700 bg-yellow-200/50',
    green: 'text-green-700 bg-green-200/50',
  };

  return (
    <div className={`rounded-xl border ${colorClasses[column.color]} flex flex-col h-full min-h-[400px]`}>
      <div className={`px-4 py-3 border-b flex justify-between items-center rounded-t-xl ${headerColors[column.color]}`}>
        <h3 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h3>
        <span className="bg-white/70 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{tasks.length}</span>
      </div>
      
      <Droppable droppableId={column.id} isDropDisabled={!currentUser}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 transition-colors ${snapshot.isDraggingOver ? 'bg-white/50' : ''}`}
          >
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!currentUser}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...provided.draggableProps.style }}
                    >
                      <TaskCard 
                        task={task} 
                        color={column.color} 
                        currentUser={currentUser} 
                        missionOwnerId={missionOwnerId}
                        isDragging={snapshot.isDragging} 
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-full flex items-center justify-center pt-8">
                <p className="text-sm text-gray-400 italic">Drop tasks here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TaskCard({ task, color, currentUser, missionOwnerId, isDragging }: { 
  task: Task; 
  color: string; 
  currentUser: { id: string, role: string } | null; 
  missionOwnerId: string | null;
  isDragging?: boolean 
}) {
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const borderColors: Record<string, string> = {
    gray: 'border-l-gray-400',
    blue: 'border-l-blue-500',
    yellow: 'border-l-yellow-400',
    green: 'border-l-green-500',
  };

  // Permission Logic
  const isAssignee = currentUser && task.assignee && currentUser.id === task.assignee.id;
  const isMissionOwner = currentUser && currentUser.id === missionOwnerId;
  const isAdmin = currentUser?.role === 'admin';
  const isUnassigned = !task.assignee;
  
  const canUpdate = currentUser && (isAssignee || isMissionOwner || isAdmin || isUnassigned);
  const canComplete = canUpdate && (task.status === 'in_progress' || task.status === 'needs_review');

  const handleClaim = async () => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('tasks')
      .update({ assignee_id: currentUser.id })
      .eq('id', task.id);
      
    if (error) alert("Could not claim task.");
    else router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (error) alert("Failed to delete task.");
    else router.refresh();
  };

  return (
    <div className={`p-4 border border-gray-100 border-l-4 ${borderColors[color]} rounded-lg bg-white shadow-sm hover:shadow-md transition-all ${isDragging ? 'shadow-xl rotate-2 scale-105 z-50 ring-1 ring-blue-400' : ''}`}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="font-medium text-gray-800 leading-snug">{task.title}</div>
        {isAdmin && (
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500" title="Delete Task">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-end mt-3">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm" title={task.assignee.name || task.assignee.email || 'User'}>
              {(task.assignee.name || task.assignee.email || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 max-w-[100px] truncate">{task.assignee.name || task.assignee.email || 'User'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 italic">Unassigned</span>
            {currentUser && (
              <button onClick={handleClaim} className="text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                Claim
              </button>
            )}
          </div>
        )}

        {/* Evidence Thumbnails */}
        {task.evidence_photos && task.evidence_photos.length > 0 && (
          <div className="flex -space-x-2">
            {task.evidence_photos.slice(0, 3).map((url, i) => (
              <img 
                key={i}
                src={url} 
                alt="Evidence"
                className="w-6 h-6 object-cover rounded-full border-2 border-white bg-gray-100"
              />
            ))}
          </div>
        )}
      </div>
      
      {canComplete && (
        <div className="mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={() => setShowUpload(true)}
            className="w-full text-xs font-medium px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors flex items-center justify-center gap-1 border border-green-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Complete Task
          </button>
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
