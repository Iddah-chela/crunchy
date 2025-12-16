// This file is DEPRECATED - use migrateQna.js instead
// 
// The existing migrateQna.js already handles migration from questionMap
// to Supabase. This file is kept only for reference.
//
// Workflow:
// 1. Put frontend/js/questionMap.js into backend/models/questionMap.js
// 2. Run: node backend/migrateQna.js
// 3. Frontend loads from Supabase via IndexedDB cache (qna-cache.js)

console.log("DEPRECATED - use migrateQna.js instead");
process.exit(0);

