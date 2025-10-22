// routes/community.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require('path');
const multer = require("multer");


// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `community-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();
const db = new sqlite3.Database(path.join(process.cwd(), "randomverse.db"), (err) => {
  if (err) {
    console.error("Database opening error:", err.message);
  } else {
    console.log("✅ Community route connected to DB");
    db.run("PRAGMA foreign_keys = ON");
  }
});

// Make sure tables exist
db.serialize(() => {
  

  db.run(`
    CREATE TABLE IF NOT EXISTS community_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      body TEXT,
      image TEXT,
      mature_content INTEGER DEFAULT 0,
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
      image TEXT,
      FOREIGN KEY(question_id) REFERENCES community_questions(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(question_id) REFERENCES community_questions(id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(user_id, question_id)
    )`);
});

// Mature content keywords (can be expanded)
const MATURE_KEYWORDS = [
  'sex', 'drunk', 'alcohol', 'drugs', 'violence', 'kill', 'death', 
  'rape', 'abuse', 'suicide', 'porn', 'naked', 'weed', 'cocaine'
];

function containsMatureContent(text) {
  const lowerText = text.toLowerCase();
  return MATURE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// ================= QUESTIONS ==================

// Get all questions with automatic age-appropriate filtering
router.get("/questions", (req, res) => {
  const uid = req.session && req.session.userId ? req.session.userId : -1;

  // First get the current user's age
  db.get("SELECT age FROM users WHERE id = ?", [uid], (err, currentUserData) => {
    if (err) {
      console.error("Error fetching user age:", err);
      return res.status(500).json({ error: err.message });
    }

    const userAge = currentUserData ? currentUserData.age : 18; // Default to 18 if not logged in
    
    // Only show mature content if user is 18+
    const matureFilter = userAge >= 18 ? "" : "AND q.mature_content = 0";

    const sql = `
      SELECT q.id, q.title, q.body, q.created_at, u.username,
      CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS favorited,
      (SELECT COUNT(*) FROM favorites f2 WHERE f2.question_id = q.id) AS favorites_count
      FROM community_questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN favorites f ON f.question_id = q.id AND f.user_id = ?
      WHERE 1=1 ${matureFilter}
      ORDER BY q.created_at DESC
    `;
    
    db.all(sql, [uid], (err, rows) => {
      if (err) {
        console.error("Error fetching questions:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

// Create new question with automatic mature content detection
router.post("/questions",upload.single("image"), (req, res) => {
  const { user_id, title, body } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  console.log("Received question post:", { user_id, title, body });
  
  if (!user_id || !title || !body) {
    return res.status(400).json({ error: "Fill all fields bana 😅" });
  }

  // Automatically detect mature content
  const hasMatureContent = containsMatureContent(title + " " + body) ? 1 : 0;
  
  db.run(
    "INSERT INTO community_questions (user_id, title, body, mature_content, image) VALUES (?, ?, ?, ?, ?)",
    [user_id, title, body, hasMatureContent, imagePath],
    function (err) {
      if (err) {
        console.error("Insert question failed:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, user_id, title, body, mature_content: hasMatureContent });
    }
  );
});

// Edit posts as poster
router.put("/questions/:id", (req, res) => {
  const { body } = req.body;
  db.get("SELECT * FROM community_questions WHERE id = ?", [req.params.id], (err, post) => {
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.user_id !== req.session.userId) return res.status(403).json({ error: "Not yours" });
    
    db.run("UPDATE community_questions SET body = ? WHERE id = ?", [body, req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Delete post
router.delete("/questions/:id", (req, res) => {
  db.get("SELECT * FROM community_questions WHERE id = ?", [req.params.id], (err, post) => {
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.user_id !== req.session.userId) return res.status(404).json({ error: "Not yours" });

    db.run("DELETE FROM community_questions WHERE id = ?", [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
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
  
  console.log("Received response post:", { question_id: req.params.id, user_id, body });
  
  if (!user_id || !body) {
    return res.status(400).json({ error: "Fill response bana 😅" });
  }
  
  db.run(
    "INSERT INTO community_responses (question_id, user_id, body) VALUES (?, ?, ?)",
    [req.params.id, user_id, body],
    function (err) {
      if (err) {
        console.error("Insert response failed:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, question_id: req.params.id, user_id, body });
    }
  );
});

// Toggle favorite
router.post("/questions/:id/favorite", (req, res) => {
  const userId = req.session && req.session.userId;
  const questionId = req.params.id;
  
  if (!userId) return res.status(401).json({ error: "Login required" });

  db.get(
    "SELECT id FROM favorites WHERE user_id = ? AND question_id = ?",
    [userId, questionId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        // If already favorited, remove
        db.run("DELETE FROM favorites WHERE id = ?", [row.id], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ favorited: false });
        });
      } else {
        // Not favorited, add it
        db.run(
          "INSERT INTO favorites (user_id, question_id) VALUES (?, ?)",
          [userId, questionId],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ favorited: true, id: this.lastID });
          }
        );
      }
    }
  );
});

// Get user's favorites
router.get("/favorites", (req, res) => {
  const userId = req.session && req.session.userId;
  if (!userId) return res.json({ error: "Login required" });
  
  db.all("SELECT question_id FROM favorites WHERE user_id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.question_id));
  });
});

//get all favorites

module.exports = router;