-- Create Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,   -- 'task_assigned' | 'comment_posted' | 'status_changed'
    entity_type TEXT NOT NULL,   -- 'task' | 'project'
    entity_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
