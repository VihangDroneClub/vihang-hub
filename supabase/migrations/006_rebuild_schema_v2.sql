-- Drop existing tables to start fresh
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'member',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- 2. campaigns
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 3. missions
CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  owner_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- 4. tasks
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  assignee_id uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  evidence_photos text[] DEFAULT '{}',
  evidence_videos text[] DEFAULT '{}',
  evidence_files text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Triggers
CREATE OR REPLACE FUNCTION enforce_evidence_on_complete()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND array_length(NEW.evidence_photos, 1) IS NULL THEN
    RAISE EXCEPTION 'Cannot complete a task without uploading evidence.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_evidence_before_complete ON tasks;
CREATE TRIGGER check_evidence_before_complete
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION enforce_evidence_on_complete();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON tasks;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Auth Trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Select profiles for authenticated users" ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Update own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- campaigns
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Admin insert campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admin update campaigns" ON campaigns FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admin delete campaigns" ON campaigns FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- missions
CREATE POLICY "Public read missions" ON missions FOR SELECT USING (true);
CREATE POLICY "Admin insert missions" ON missions FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admin or Owner update missions" ON missions FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') OR auth.uid() = owner_id
);
CREATE POLICY "Admin delete missions" ON missions FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- tasks
CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Admin insert tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Task updates" ON tasks FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  OR auth.uid() = assignee_id
  OR (assignee_id IS NULL AND auth.uid() IS NOT NULL)
  OR auth.uid() IN (SELECT owner_id FROM missions WHERE id = mission_id)
);

CREATE POLICY "Admin delete tasks" ON tasks FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
