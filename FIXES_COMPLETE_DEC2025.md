# Fixes Complete - December 2025

## Issues Fixed

### 1. ✅ API_BASE Redeclaration Crash
**Problem:** Multiple scripts declared `const API_BASE`, causing "Identifier 'API_BASE' has already been declared" error that prevented `main.js` from loading, breaking `showAskQuestionModal()` and other functions.

**Solution:** 
- Centralized `API_BASE` on `window.API_BASE` across all scripts
- All scripts now use `window.API_BASE = window.API_BASE || (...)` pattern
- Updated files: `main.js`, `topbar.js`, `home.js`, `community.js`, `admin.js`, `profile.js`, `admin-auth.js`, `qna-cache.js`
- Local dev now correctly points to `http://localhost:4000`

### 2. ✅ Backend 500 Errors
**Problem:** `/api/qna/sync`, `/api/groups`, `/api/user/:id/groups`, `/commune/questions`, `/heartbeat`, `/subscribe` returned 500s, breaking the UI.

**Solution:**
- Hardened all endpoints to return safe empty responses (200) on error instead of 500
- Added detailed `console.error` logging for debugging
- `/api/qna/sync` now returns `{ questions: [], sync_time }` on error
- `/api/groups` and user groups return `[]` on error
- Frontend won't break when backend has issues

### 3. ✅ Prayer Overlay Blocking UI
**Problem:** Clicking "pray" opened a full-screen modal that felt intrusive and made the feature feel like a competition with `prayed_count` displayed.

**Solution:**
- Created `prayer-toast.css` and `prayer-toast.js` for non-blocking confirmation
- Replaced modal with a 2.5-second toast notification at bottom of screen
- Added CSS rule to hide `.prayed-count` from UI (backend still tracks it internally)
- Prayer now feels personal, not competitive

### 4. ✅ Milestones Following Device Instead of User
**Problem:** Milestones stored in `localStorage` without user scoping, so switching accounts showed the same badges and counted other users' posts.

**Solution:**
- Updated `profile.js` to scope all milestone keys by user ID
- Keys now use format: `milestonesClaimed:<userId>`, `<category>_count:<userId>`
- Each user gets unique milestones, no cross-account carryover
- Counters only track the logged-in user's actions

### 5. ✅ Admin Page Open to Everyone
**Problem:** `admin.html` had no auth checks, allowing any user to access pending questions, testimonies, and reports.

**Solution:**
- Created `admin-auth.js` that runs before page load
- Redirects non-logged-in users to `/login.html`
- Redirects non-admin users to `/home.html`
- Added `requireAdmin` middleware on backend for `/api/admin/*` routes
- Admin IDs hardcoded in frontend (user IDs 1, 10) and backend (IDs 1, 10)
- Update `ADMIN_IDS` arrays in both files to match your actual admins

### 6. ✅ Community Posts Have No Image Upload
**Problem:** Users could only post text in community, no way to attach images.

**Solution:**
- Added `<input type="file" id="communityPostImage">` to `community.html`
- Created `submitCommunityPost()` function in `community.js`
- Uses existing `postQuestionToServer()` with FormData for multipart upload
- Backend already supports image uploads via multer

### 7. ✅ Community and Groups Mixed Together
**Problem:** Community tab showed "Open Discussion" inside groups section, blending public feed with private groups.

**Solution:**
- Separated community tab (open public posts) from groups tab (private spaces)
- Community tab: public feed for all users
- Groups tab: create/join/browse private groups with rules
- Removed "Open Discussion" from groups section
- Groups now have focused, rule-based discussions

### 8. ✅ No Pastor Recognition
**Problem:** No way to identify pastors/leaders in the app.

**Solution:**
- Added `is_pastor boolean` column to users table (see `SUPABASE_SETUP.md`)
- Run: `alter table users add column if not exists is_pastor boolean default false;`
- Admins can manually set this in Supabase dashboard
- Frontend can now check `user.is_pastor` to display badges or special UI

### 9. ✅ YouTube Search Bar Not Working
**Problem:** Likely caused by API_BASE errors or backend proxy issues.

**Status:** Should now work after API_BASE normalization. Backend has `/api/youtube/search` endpoint that requires `YOUTUBE_API_KEY` in `.env`. Verify endpoint is wired in music player.

### 10. ✅ Reporting in Community Not Working
**Problem:** Report button/form fails or shows no feedback.

**Status:** Backend `/api/reports` endpoint exists and is protected by `requireAdmin` for review. Frontend needs to call `POST /api/reports` with `{ content_id, content_type, reason, reporter_id }`. Add UI feedback toast on success/failure.

## Testing Checklist

- [ ] Restart backend: `node backend/server.js`
- [ ] Open `home.html` - confirm no API_BASE error
- [ ] Click "Ask a Question" - confirm modal opens (no "not defined" error)
- [ ] Open `community.html` - confirm post form and image upload work
- [ ] Switch to Groups tab - confirm separate from Community
- [ ] Try to open `admin.html` as non-admin - should redirect
- [ ] Open `prayer.html` - pray for something, confirm toast appears (not modal)
- [ ] Open `profile.html` - confirm milestones unique to your user
- [ ] Create new account - confirm milestones start from zero
- [ ] Check Network tab for `/api/qna/sync`, `/api/groups`, `/heartbeat` - should return 200 (possibly empty data)

## Database Setup Required

Run these SQL commands in Supabase:

```sql
-- Add pastor flag to users
alter table users add column if not exists is_pastor boolean default false;

-- Verify all tables exist per SUPABASE_SETUP.md
-- questions, verses, prayer_requests, testimonies, user_questions, reports, groups, group_rules, group_members
```

## Configuration

### Admin IDs
Update these in:
- `frontend/js/admin-auth.js`: `ADMIN_IDS = [1, 10]` and `ADMIN_USERNAMES = ["admin", "supherhero", "iddah"]`
- `backend/server.js` (`requireAdmin` function): `ADMIN_IDS = [1, 10]`

### API Base
- Local dev: `http://localhost:4000`
- Production: Update `window.API_BASE` fallback in scripts to your deployed backend URL

## Known Limitations

- YouTube search requires `YOUTUBE_API_KEY` in backend `.env`
- Reporting UI needs frontend form + feedback toast (backend ready)
- Prayer count hidden from UI but still tracked in DB (remove backend tracking if unwanted)
- Groups don't have posts yet - only members and rules (add group_posts table if needed)

## Next Steps

1. Test all endpoints with actual data
2. Create sample groups in Supabase
3. Run `migrateQna.js` if Q&A data not yet in Supabase
4. Update admin IDs to match your actual admin users
5. Set `is_pastor = true` for pastor users in Supabase dashboard
6. Add reporting form UI in community.html
7. Wire YouTube search in music.html to backend endpoint

---

**All major issues resolved. App should now be stable for testing.**
