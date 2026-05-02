-- Seed Missions
INSERT INTO missions (name, slug, description, color_hex) VALUES
('Mission Tesseract', 'mission-tesseract', 'Focuses on drone automation and swarming.', '#6366f1'),
('Mission Avinya', 'mission-avinya', 'Focuses on sustainable drone technology.', '#10b981'),
('Other Activities', 'other-activities', 'General club activities and workshops.', '#f59e0b');

-- Note: To create an admin user:
-- 1. Sign up via the app.
-- 2. Find your user_id in auth.users.
-- 3. Run: UPDATE profiles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
