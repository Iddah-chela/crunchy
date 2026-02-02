# Architecture Overview

## Q&A Data Flow

### Frontend → Backend → Supabase

**Why this way:**
- Supabase is the source of truth
- Frontend caches data for offline use
- Backend handles data validation and sync

### Step-by-Step Migration

1. **Copy questionMap to Backend**
   ```bash
   # Copy frontend/js/questionMap.js to backend/models/questionMap.js
   cp frontend/js/questionMap.js backend/models/questionMap.js
   ```

2. **Run Migration**
   ```bash
   node backend/migrateQna.js
   ```
   This uses the EXISTING migrateQna.js, which:
   - Reads questionMap from `backend/models/questionMap.js`
   - Extracts questions, explanations, and verses
   - Inserts into Supabase `questions`, `explanations`, `verses` tables

3. **Frontend Loads from Supabase**
   - `qna-cache.js` automatically fetches from `/api/qna/sync`
   - Saves to IndexedDB
   - Loads from cache on subsequent opens

### What Stays Where

| Component | Location | Purpose |
|-----------|----------|---------|
| **questionMap.js** | Frontend | Still used, but now optional (cached data replaces it) |
| **questionMap.js** | Backend | Temporary, used only for migration |
| **Questions + Verses** | Supabase | Source of truth |
| **IndexedDB Cache** | Browser | Offline access, instant load |

## Admin Dashboard Workflow

### Adding Questions (User-Suggested)

```
User submits via "Ask a Question" modal
  ↓
Stored in Supabase user_questions table (status = 'pending')
  ↓
Admin dashboard shows pending questions
  ↓
Admin reviews → assigns verses → approves
  ↓
Moves to main questions table (or updates user_questions status)
  ↓
Next sync distributes to all users
```

### Adding Questions (Entirely New)

```
Admin opens Supabase dashboard
  ↓
Manually inserts into questions table
  ↓
Adds verses to verses table
  ↓
Sets status = 'published' and updated_at = now()
  ↓
Users sync automatically (within ~1 minute)
```

### Adding Answers (Verses)

```
Admin opens Supabase or admin.html
  ↓
Selects a question
  ↓
Adds verses with:
  - Reference (John 3:16)
  - Text (Bible verse content)
  - Theme (love, hope, etc.)
  - Tags (array of keywords)
  ↓
Supabase updated_at trigger fires
  ↓
Users sync and see new answer
```

## Community Groups System

### User Creates Group

```
User clicks "Create Group"
  ↓
Enters:
  - Group name
  - Description
  - Icon/emoji
  - Rules (separated by |)
  ↓
POST /api/groups
  ↓
Creates groups table entry
  ↓
Creates group_rules entries
  ↓
Auto-adds creator as admin in group_members
```

### User Joins Group

```
User sees groups list
  ↓
Clicks "Join"
  ↓
POST /api/groups/:id/join
  ↓
Adds to group_members table
  ↓
User now sees group in "My Groups"
```

### Group Rules

```
Group rules stored in group_rules table
  ↓
Linked to group_id
  ↓
Displayed when viewing group
  ↓
Purely informational (no enforcement yet)
  ↓
Moderators can later enforce via reports system
```

## Database Schema Summary

### Q&A Tables
- `questions` (question_id, text, category, status, updated_at)
- `explanations` (question_id, text)
- `verses` (explanation_id, reference, text, theme, tags)

### Groups Tables
- `groups` (name, description, icon, creator_id, status)
- `group_rules` (group_id, rule_number, rule_text)
- `group_members` (group_id, user_id, role)

### Other Tables
- `user_questions` (pending user submissions)
- `testimonies` (pending testimonies)
- `prayer_requests` (public prayer requests)
- `reports` (reported content)

## Data Security

### Public/Private
- ✅ Questions (published): Public read
- ✅ Verses: Public read
- ✅ Groups: Public read
- ✅ Rules: Public read
- 🔒 User questions (pending): Admin only
- 🔒 Reports: Admin only
- ✅ Testimonies (approved): Public read
- 🔒 Testimonies (pending): Admin only

### RLS Policies
All tables have row-level security enabled. Update as needed for auth.

## Workflow Summary

```
Users see Q&A from IndexedDB cache (instant, offline)
      ↓
Admin manages questions in Supabase
      ↓
Users sync in background (delta-based)
      ↓
New/updated questions appear automatically
      ↓
Zero deployment needed
```

**No redeploy ever needed** for Q&A updates again!
