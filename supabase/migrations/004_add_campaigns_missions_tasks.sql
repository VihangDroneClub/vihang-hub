-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  goal TEXT,
  success_criteria TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'cancelled')) DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions table (updated with campaign link)
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed')) DEFAULT 'not_started',
  deadline DATE,
  deliverables TEXT,
  blocked_by UUID[] DEFAULT '{}', -- Array of mission IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table (new)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'needs_review', 'completed')) DEFAULT 'todo',
  evidence_photos TEXT[] DEFAULT '{}',
  evidence_videos TEXT[] DEFAULT '{}',
  evidence_files TEXT[] DEFAULT '{}',
  test_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- User roles table
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Public READ access (viewer mode)
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read missions" ON missions FOR SELECT USING (true);
CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);

-- Member WRITE access
CREATE POLICY "Members can insert tasks" ON tasks FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can update their tasks" ON tasks FOR UPDATE 
  USING (assignee_id = auth.uid() OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- Admin FULL access
CREATE POLICY "Admins can do anything on campaigns" ON campaigns FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Admins can do anything on missions" ON missions FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Create Indexes
CREATE INDEX idx_missions_campaign ON missions(campaign_id);
CREATE INDEX idx_tasks_mission ON tasks(mission_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_missions_owner ON missions(owner_id);
