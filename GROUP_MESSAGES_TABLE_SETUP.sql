-- Create group_messages table for group conversations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS group_messages (
  id BIGSERIAL PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read group messages (you can restrict this to group members only)
CREATE POLICY "Anyone can read group messages" ON group_messages
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert group messages
CREATE POLICY "Users can insert group messages" ON group_messages
  FOR INSERT WITH CHECK (true);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON group_messages
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
