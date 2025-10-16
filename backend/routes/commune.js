// routes/community.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require('path');

const router = express.Router();
const db = new sqlite3.Database(path.resolve(__dirname, "../../randomverse.db"), (err) => {
  if (err) {
    console.error("Database opening error:", err.message);
  } else {
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
// db.run(
//   "INSERT INTO community_questions (user_id, title, body) VALUES (?, ?, ?)",
//   [1, "Test title", "Test body"],
//   function (err) {
//     if (err) console.error("Insert failed:", err.message);
//     else console.log("Inserted with ID:", this.lastID);
//   }
// );


// ================= QUESTIONS ==================

// Get all questions
router.get("/questions", (req, res) => {
  const minAge = req.query.minAge || 0;
  const maxAge = req.query.maxAge || 120;
  const uid = req.session && req.session.userId ? req.session.userId:-1;

  const sql = `
    SELECT q.id, q.title, q.body, q.created_at, u.username, 
    CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS favorited 
    FROM community_questions q 
    JOIN users u ON q.user_id = u.id 
    LEFT JOIN favorites f ON f.question_id = q.id AND f.user_id = ? 
    ORDER BY q.created_at DESC
    `;
  db.all(sql, [uid],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const filtered = rows.filter(row => {
        const birthDate = new Date(row.birthday);
        const diff = Date.now() - birthDate.getTime();
        const age = new Date(diff).getUTCFullYear() - 1970;
        return age >= minAge && age <=maxAge;
      });
      res.json(filtered);
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
      if (err) {
  console.error("Insert question failed:", err.message);
  return res.status(500).json({ error: err.message });
}

      res.json({ id: this.lastID, user_id, title, body });
    }
  );
});

//edit posts as poster
router.put("/questions/:id", (req, res) => {
  const {body} = req.body;
  db.get("SELECT * FROM community_questions WHERE id = ?", [req.params.id], (err, post) => {
    if (!post) return res.status(404).json({ error: "Not found "});
    if (post.user_id !== req.session.userId) return res.status(403).json({ error: "Not yours" });
    
    db.run("UPDATE community_questions SET body = ? WHERE id = ?", [body, req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    })
  })
})

//delete post
router.delete("/questions/:id", (req, res) => {
  db.get("SELECT * FROM community_questions WHERE id = ?", [req.params.id], (err, post) => {
    if (!post) return res.status(404).json ({ error: "Not found" });
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
  if (!user_id || !body) {
    return res.status(400).json({ error: "Fill response bana 😅" });
  }
  db.run(
    "INSERT INTO community_responses (question_id, user_id, body) VALUES (?, ?, ?)",
    [req.params.id, user_id, body],
    function (err) {
      if (err) {
        console.error("Insert question failed:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID, question_id: req.params.id, user_id, body });

    }
  );
});

router.post("/questions/:id/favorite", (req, res) => {
  const userId = req.session && req.session.userId;
  const questionId = req.params.id;
  if(!userId) return res.status(401).json({ error: "Login required"});

  db.get(
    "SELECT id FROM favorites WHERE user_id = ? AND question_id = ?",
    [userId, questionId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        //if already favorited, remove
        db.run("DELETE FROM favorites WHERE id = ?", [row.id], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ favorited: false});
        });
     } else {
        // its not favorited, add it
        db.run(
          "INSERT INTO favorites (user_id, question_id) VALUES (?, ?)",
          [userId, questionId],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ favorited: true, id: this.lastID})
          }
        )
      }
    }
  )
});

router.get("/favorites", (req, res)=> {
  const userId = req.session && req.session.userId;
  if (!userId) return res.json({error: "Login required"});
  db.all("SELECT question_id FROM favorites WHERE user_id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.question_id));
  });
});

module.exports = router;
