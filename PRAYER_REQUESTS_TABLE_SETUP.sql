-- Prayer Requests Table Setup for Supabase
-- Run this in your Supabase SQL Editor

-- If table already exists with UUID type, run this first to alter it:
-- ALTER TABLE prayer_requests ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
-- ALTER TABLE prayer_requests DROP CONSTRAINT IF EXISTS prayer_requests_user_id_fkey;

-- Create prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  username TEXT DEFAULT 'Anonymous',
  user_id TEXT,
  prayed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read prayer requests
CREATE POLICY "Anyone can read prayer requests"
  ON prayer_requests
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert prayer requests
CREATE POLICY "Anyone can submit prayer requests"
  ON prayer_requests
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update prayer count
CREATE POLICY "Anyone can update prayer count"
  ON prayer_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON prayer_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON prayer_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE prayer_requests_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE prayer_requests_id_seq TO authenticated;
