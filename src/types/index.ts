export type UserRole = 'admin' | 'lead' | 'member';
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Mission {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color_hex: string;
  created_at: string;
}

export interface Project {
  id: string;
  mission_id: string;
  name: string;
  description?: string;
  lead_id?: string;
  status: ProjectStatus;
  due_date?: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  member_id: string;
  assigned_at: string;
  assigned_by?: string;
}

export interface Activity {
  id: string;
  mission_id: string;
  title: string;
  description?: string;
  event_date?: string;
  created_by?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id?: string;
  content: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  uploaded_by?: string;
  file_name: string;
  storage_path: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id?: string;
  type: 'task_assigned' | 'comment_posted' | 'status_changed';
  entity_type: 'task' | 'project';
  entity_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
}
