-- Fix questions table schema
-- Add missing columns that the backend expects

-- Add question_id column (TEXT identifier like "user_q1") if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS question_id TEXT UNIQUE;

-- Add question_text column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS question_text TEXT;

-- Add created_at column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add category column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add status column if it doesn't exist (for published/archived filtering)
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_question_id ON questions(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- Fix verses table - add question_id if it doesn't exist
-- Note: questions.id is BIGINT, so question_id must also be BIGINT
ALTER TABLE verses 
ADD COLUMN IF NOT EXISTS question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE;

-- Add created_at to verses if missing
ALTER TABLE verses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add theme column to verses if missing
ALTER TABLE verses 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'general';

-- Add index for verses lookup
CREATE INDEX IF NOT EXISTS idx_verses_question_id ON verses(question_id);

-- Fix user_questions table - add missing columns
ALTER TABLE user_questions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE user_questions 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE user_questions 
ADD COLUMN IF NOT EXISTS migrated BOOLEAN DEFAULT false;

ALTER TABLE user_questions 
ADD COLUMN IF NOT EXISTS verse_pool TEXT;

-- Add indexes for user_questions
CREATE INDEX IF NOT EXISTS idx_user_questions_status ON user_questions(status);
CREATE INDEX IF NOT EXISTS idx_user_questions_migrated ON user_questions(migrated);

-- Fix reports table - add status if it doesn't exist
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing reports to have 'pending' status if they have NULL or 'open'
UPDATE reports 
SET status = 'pending' 
WHERE status IS NULL OR status = 'open';

-- Add index for reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Verify the structures
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name IN ('questions', 'verses', 'reports')
-- ORDER BY table_name, ordinal_position;
