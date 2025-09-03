// routes/community.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();
const db = new sqlite3.Database("./community.db");

// Make sure tables exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS community_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      body TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS community_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER,
      user_id INTEGER,
      body TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(question_id) REFERENCES community_questions(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});


// ================= QUESTIONS ==================

// Get all questions
router.get("/questions", (req, res) => {
  db.all(
    "SELECT q.id, q.title, q.body, q.created_at, u.username FROM community_questions q JOIN users u ON q.user_id = u.id ORDER BY q.created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create new question
router.post("/questions", (req, res) => {
  const { user_id, title, body } = req.body;
  if (!user_id || !title || !body) {
    return res.status(400).json({ error: "Fill all fields bana 😅" });
  }
  db.run(
    "INSERT INTO community_questions (user_id, title, body) VALUES (?, ?, ?)",
    [user_id, title, body],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, title, body });
    }
  );
});

// ================= RESPONSES ==================

// Get all responses for a question
router.get("/questions/:id/responses", (req, res) => {
  db.all(
    "SELECT r.id, r.body, r.created_at, u.username FROM community_responses r JOIN users u ON r.user_id = u.id WHERE r.question_id = ? ORDER BY r.created_at ASC",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add response to a question
router.post("/questions/:id/responses", (req, res) => {
  const { user_id, body } = req.body;
  if (!user_id || !body) {
    return res.status(400).json({ error: "Fill response bana 😅" });
  }
  db.run(
    "INSERT INTO community_responses (question_id, user_id, body) VALUES (?, ?, ?)",
    [req.params.id, user_id, body],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, question_id: req.params.id, user_id, body });
    }
  );
});

module.exports = router;
