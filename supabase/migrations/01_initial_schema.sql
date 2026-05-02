-- Create Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'lead', 'member');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'on_hold');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'member' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Missions Table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color_hex TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status project_status DEFAULT 'planning' NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority task_priority DEFAULT 'medium' NOT NULL,
    status task_status DEFAULT 'todo' NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Assignments Table
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(task_id, member_id)
);

-- Activities Table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Members Table
CREATE TABLE activity_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(activity_id, member_id)
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments Table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper Function for Role Checking
CREATE OR REPLACE FUNCTION get_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies

-- Profiles: Everyone can read, Admin can update, User can update own (except role)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (get_role() = 'admin');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (user_id = auth.uid());

-- Missions: Everyone can read, Admin can mutate
CREATE POLICY "Missions are viewable by everyone" ON missions FOR SELECT USING (true);
CREATE POLICY "Admins can mutate missions" ON missions FOR ALL USING (get_role() = 'admin') WITH CHECK (get_role() = 'admin');

-- Projects: Everyone can read, Admin/Leads can mutate
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Admins can mutate projects" ON projects FOR ALL USING (get_role() = 'admin') WITH CHECK (get_role() = 'admin');
CREATE POLICY "Leads can mutate their projects" ON projects FOR UPDATE USING (lead_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) WITH CHECK (lead_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Tasks: Everyone can read, Admin/Leads can mutate, Members can update status if assigned
CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
CREATE POLICY "Admins can mutate tasks" ON tasks FOR ALL USING (get_role() = 'admin') WITH CHECK (get_role() = 'admin');
CREATE POLICY "Leads can mutate tasks in their projects" ON tasks FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
) WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Members can update status of assigned tasks" ON tasks FOR UPDATE USING (
    id IN (SELECT task_id FROM task_assignments WHERE member_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
) WITH CHECK (
    id IN (SELECT task_id FROM task_assignments WHERE member_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Task Assignments: Read all, Admin/Leads mutate
CREATE POLICY "Assignments viewable by everyone" ON task_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can mutate assignments" ON task_assignments FOR ALL USING (get_role() = 'admin');
CREATE POLICY "Leads can mutate assignments in their projects" ON task_assignments FOR ALL USING (
    task_id IN (SELECT id FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
);

-- Activities: Read all, Admin/Leads mutate
CREATE POLICY "Activities viewable by everyone" ON activities FOR SELECT USING (true);
CREATE POLICY "Admins/Leads can mutate activities" ON activities FOR ALL USING (get_role() IN ('admin', 'lead'));

-- Activity Members: Read all, Admin/Leads mutate
CREATE POLICY "Activity members viewable by everyone" ON activity_members FOR SELECT USING (true);
CREATE POLICY "Admins/Leads can mutate activity members" ON activity_members FOR ALL USING (get_role() IN ('admin', 'lead'));

-- Comments: Read all, Users can mutate own, Admin can delete
CREATE POLICY "Comments viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can delete comments" ON comments FOR DELETE USING (get_role() = 'admin');

-- Attachments: Read all, Users can mutate if assigned to task
CREATE POLICY "Attachments viewable by everyone" ON attachments FOR SELECT USING (true);
CREATE POLICY "Assigned users can upload attachments" ON attachments FOR INSERT WITH CHECK (
    task_id IN (SELECT task_id FROM task_assignments WHERE member_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR get_role() IN ('admin', 'lead')
);

-- Audit Log: Only Admins can read
CREATE POLICY "Only admins can view audit log" ON audit_log FOR SELECT USING (get_role() = 'admin');

-- Audit Log Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    actor_id UUID;
BEGIN
    SELECT id INTO actor_id FROM profiles WHERE user_id = auth.uid();
    
    INSERT INTO audit_log (actor_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
        actor_id,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
CREATE TRIGGER audit_tasks_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_projects_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_assignments_trigger
AFTER INSERT OR UPDATE OR DELETE ON task_assignments
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Profile Creation Trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
