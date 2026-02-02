# Admin & Database Setup Guide

## 🔑 Admin Access Configuration

### Backend (server.js line 846)
```javascript
const ADMIN_IDS = [1, 10]; // User IDs that are admins
```

### Frontend (admin-auth.js lines 13-14)
```javascript
const ADMIN_IDS = [1, 10]; // User IDs that are admins
const ADMIN_USERNAMES = ["admin", "supherhero", "iddah"]; // Usernames that are admins
```

**To add more admins:**
1. Edit `backend/server.js` line 846 - add user ID to array
2. Edit `frontend/js/admin-auth.js` line 13 - add user ID to array
3. Optionally add username to line 14 for easier access

---

## 🗄️ Database Schema Fixes Required

Your database is missing several columns that the backend expects. Run the SQL script below in **Supabase SQL Editor**:

### Fix Script: QUESTIONS_TABLE_FIX.sql

```sql
-- Fix questions table schema
-- Add missing columns that the backend expects

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
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- Fix verses table - add question_id if it doesn't exist
ALTER TABLE verses 
ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES questions(id) ON DELETE CASCADE;

-- Add created_at to verses if missing
ALTER TABLE verses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add theme column to verses if missing
ALTER TABLE verses 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'general';

-- Add index for verses lookup
CREATE INDEX IF NOT EXISTS idx_verses_question_id ON verses(question_id);

-- Fix reports table - add status if it doesn't exist
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add index for reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
```

---

## 🚨 Current Issues & Solutions

### Issue 1: Reports not showing in admin
**Problem:** Reports exist in Supabase but don't appear in admin dashboard

**Causes:**
- Reports table missing `status` column
- Backend filters by `status = 'pending'`

**Solution:** Run the SQL script above to add the status column

---

### Issue 2: Question approval fails (500 error)
**Problem:** Error when clicking "Approve" on user questions

**Error Messages:**
- `column questions.created_at does not exist`
- `Could not find the 'category' column of 'questions'`

**Cause:** Questions table missing columns

**Solution:** Run the SQL script above to add:
- `created_at` column
- `category` column
- `status` column

---

### Issue 3: Q&A sync error
**Problem:** Backend tries to order by created_at which doesn't exist

**Error:** `column questions.created_at does not exist`

**Solution:** Run the SQL script above

---

## ✅ How to Apply Fixes

1. **Open Supabase Dashboard**
   - Go to your project
   - Click "SQL Editor" in left sidebar

2. **Run the SQL Script**
   - Copy contents of `QUESTIONS_TABLE_FIX.sql`
   - Paste into SQL editor
   - Click "Run"

3. **Verify Changes**
   Run this query to check columns were added:
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name IN ('questions', 'verses', 'reports')
   ORDER BY table_name, ordinal_position;
   ```

4. **Restart Backend Server**
   ```powershell
   cd backend
   node server.js
   ```

5. **Test Admin Dashboard**
   - Refresh admin page
   - Try approving a question
   - Check if reports appear

---

## 📊 Expected Table Structures After Fix

### questions table
- `id` (UUID, primary key)
- `question_id` (TEXT)
- `question_text` (TEXT)
- `category` (TEXT) ← ADDED
- `status` (TEXT) ← ADDED
- `created_at` (TIMESTAMPTZ) ← ADDED

### verses table
- `id` (UUID, primary key)
- `question_id` (UUID, foreign key) ← ADDED
- `reference` (TEXT)
- `text` (TEXT)
- `theme` (TEXT) ← ADDED
- `created_at` (TIMESTAMPTZ) ← ADDED

### reports table
- `id` (UUID, primary key)
- `content_type` (TEXT)
- `content_id` (TEXT/UUID)
- `reason` (TEXT)
- `status` (TEXT) ← ADDED
- `created_at` (TIMESTAMPTZ)

---

## 🔍 Why Rejecting Works But Approving Doesn't

**Rejecting:**
- Simple UPDATE to `user_questions` table
- Changes `status` to 'rejected'
- No other tables involved

**Approving:**
- Complex workflow:
  1. Reads from `user_questions`
  2. **Inserts into `questions`** (needs category, created_at columns)
  3. **Inserts into `verses`** (needs question_id, created_at, theme columns)
  4. Updates `user_questions`
- Fails at step 2 or 3 if columns missing

---

## 💡 Quick Test After Fixes

1. Submit a test question as regular user
2. Go to admin dashboard
3. Approve the question with some verse references
4. Check home page - question should appear in Q&A
5. Submit a test report
6. Check admin Reports tab - report should appear

