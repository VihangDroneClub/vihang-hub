-- Drop existing update/delete policies for missions and tasks
DROP POLICY IF EXISTS "Admins can do anything on missions" ON missions;
DROP POLICY IF EXISTS "Members can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON tasks; -- Just in case it existed

-- 1. Missions UPDATE Policy
-- Admins can update ANY mission.
-- Mission Owners can update THEIR missions.
CREATE POLICY "Admins and Owners can update missions" ON missions FOR UPDATE
  USING (
    owner_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- 2. Tasks UPDATE Policy
-- Admins can update ANY task.
-- Mission Owners can update ANY task within their mission.
-- Task Assignees can update THEIR tasks.
-- ANY logged-in member can update an UNASSIGNED task (to claim it).
CREATE POLICY "Complex task update policy" ON tasks FOR UPDATE
  USING (
    assignee_id = auth.uid() OR 
    assignee_id IS NULL OR 
    auth.uid() IN (SELECT owner_id FROM missions WHERE id = mission_id) OR
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- 3. Tasks DELETE Policy
-- ONLY Admins can delete tasks.
CREATE POLICY "Admins can delete tasks" ON tasks FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- 4. Missions DELETE Policy (Re-establishing admin-only delete if previous "do anything" was dropped)
CREATE POLICY "Admins can delete missions" ON missions FOR DELETE
  USING (auth.uid() IN (SELECT user_roles.user_id FROM user_roles WHERE role = 'admin'));
  
-- Note: The INSERT policies ("Members can insert tasks", "Admins can do anything on missions" for INSERT) 
-- and READ policies ("Public read...") remain untouched and active.
