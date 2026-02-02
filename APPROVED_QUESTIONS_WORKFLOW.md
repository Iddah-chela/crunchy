# How Approved Questions Work in HolyVerse

## Current Workflow

### 1. User Submits Question
- Users submit questions via the main Q&A modal
- Questions go to `user_questions` table with status='pending'
- Stored in backend via `/api/user-questions` endpoint

### 2. Admin Reviews Question
- Admin opens `admin.html` 
- Sees all pending user questions
- Can approve or reject with `/api/admin/user-questions/:id/review` endpoint
- When approved:
  - Status changes to 'approved'
  - `verse_pool` field can be set (which verses answer this question)

### 3. Approved Questions in Home Page
**Current Issue**: Approved user questions stay in `user_questions` table. They don't automatically appear in the main Q&A feed.

**Two Options to Fix This:**

#### Option A: Auto-migrate to main questions table (Recommended)
When admin approves a question, backend should:
1. Create new entry in `questions` table with:
   - `question_id`: generate (e.g., "user_q1", "user_q2")
   - `question_text`: from user_questions.question
   - `category`: from user_questions.category
   - `status`: 'published'
2. Link verses from `verse_pool` to `verses` table
3. Mark original user_questions entry as migrated

#### Option B: Fetch from both tables
Frontend home.html should fetch from:
- `/api/qna/sync` (main curated Q&A)
- `/api/user-questions?status=approved` (user-submitted approved Q&A)
- Merge both arrays and display

## Recommended Implementation (Option A)

Add to `backend/server.js` in the review endpoint:

\`\`\`javascript
app.post("/api/admin/user-questions/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, versePool } = req.body;
    
    if (action === "approve") {
      // 1. Get the user question
      const { data: userQuestion } = await supabase
        .from("user_questions")
        .select("*")
        .eq("id", id)
        .single();
      
      // 2. Generate unique question_id
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("question_id")
        .like("question_id", "user_q%")
        .order("question_id", { ascending: false })
        .limit(1);
      
      let nextNum = 1;
      if (existingQuestions && existingQuestions.length > 0) {
        const lastId = existingQuestions[0].question_id;
        nextNum = parseInt(lastId.replace("user_q", "")) + 1;
      }
      
      const questionId = \`user_q\${nextNum}\`;
      
      // 3. Insert into main questions table
      const { data: newQuestion, error: qError } = await supabase
        .from("questions")
        .insert({
          question_id: questionId,
          question_text: userQuestion.question,
          category: userQuestion.category || "general",
          status: "published"
        })
        .select()
        .single();
      
      if (qError) throw qError;
      
      // 4. Parse verse pool and insert verses
      if (versePool) {
        const verses = versePool.split("\\n").map(v => v.trim()).filter(v => v);
        for (const verseRef of verses) {
          // You'll need to look up actual verse text from Bible data
          await supabase.from("verses").insert({
            question_id: newQuestion.id,
            reference: verseRef,
            text: "Verse text here", // TODO: fetch from Bible JSON
            theme: userQuestion.category
          });
        }
      }
      
      // 5. Mark user question as approved + migrated
      await supabase
        .from("user_questions")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          migrated: true
        })
        .eq("id", id);
      
      res.json({ success: true, questionId });
    } else {
      // Reject
      await supabase
        .from("user_questions")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      
      res.json({ success: true });
    }
  } catch (error) {
    console.error("Error reviewing question:", error);
    res.status(500).json({ error: "Failed to review question" });
  }
});
\`\`\`

## Quick Fix (Option B - Temporary)

Add to `frontend/js/home.js`:

\`\`\`javascript
// Fetch both curated and approved user questions
Promise.all([
  fetch(\`\${API_BASE}/api/qna/sync\`).then(r => r.json()).catch(() => ({ questions: [] })),
  fetch(\`\${API_BASE}/api/user-questions?status=approved\`).then(r => r.json()).catch(() => [])
]).then(([qnaData, approvedUserQs]) => {
  const allQuestions = [
    ...qnaData.questions,
    ...approvedUserQs.map(q => ({
      question_id: \`user_\${q.id}\`,
      question_text: q.question,
      category: q.category,
      user_submitted: true,
      author: q.username
    }))
  ];
  
  // Display allQuestions in Q&A section
});
\`\`\`

## Database Schema Addition

Add `migrated` column to user_questions:

\`\`\`sql
alter table user_questions add column if not exists migrated boolean default false;
\`\`\`

This prevents duplicate entries if admin re-reviews same question.
