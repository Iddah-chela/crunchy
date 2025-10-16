const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const router = express.Router();

// db file for messages
const dbPath = path.join(__dirname, "../randomverse.db");
const db = new sqlite3.Database(dbPath);

// create messages table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages 
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      text TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    )
  `);
});

// Get message thread between two users
router.get("/thread/:otherUserId", (req, res) => {
  const currentUser = req.session.userId;
  const otherUser = Number(req.params.otherUserId);

  if (!currentUser || !otherUser) {
    return res.status(400).json({ error: "Invalid IDs" });
  }

  const sql = `
    SELECT m.id, m.senderId, m.receiverId, m.text, m.timestamp,
           u.username AS senderUsername, u.profilePic AS senderProfilePic
    FROM messages m
    JOIN users u ON m.senderId = u.id
    WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
    ORDER BY m.timestamp ASC
  `;
  
  db.all(sql, [currentUser, otherUser, otherUser, currentUser], (err, rows) => {
    if (err) {
      console.error("Error fetching thread:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;