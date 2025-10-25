const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

// Simple encryption/decryption for messages
const ENCRYPTION_KEY = process.env.MESSAGE_KEY || "your-32-char-secret-key-here!!"; // Must be 32 chars
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const dbPath = path.join(process.cwd(), "randomverse.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Chat route DB error:", err.message);
  else console.log("✅ Chat route connected to DB at:", dbPath);
});

// Create tables
db.serialize(() => {
  // Messages table with encrypted text
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
  `, (err) => {
    if (err) console.error("Error creating messages table:", err);
    else console.log("✅ Messages table ready");
  });

  // Friendships table
  db.run(`
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      friendId INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(friendId) REFERENCES users(id),
      UNIQUE(userId, friendId)
    )
  `, (err) => {
    if (err) console.error("Error creating friendships table:", err);
    else console.log("✅ Friendships table ready");
  });
});

// Get friends list
router.get("/friends", (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const sql = `
  SELECT 
    u.id, 
    u.username, 
    u.profilePic, 
    f.status,
    m.text AS lastMessage,
    m.timestamp AS lastTimestamp
  FROM friendships f
  JOIN users u ON (f.friendId = u.id OR f.userId = u.id)
  LEFT JOIN (
    SELECT * 
    FROM messages 
    WHERE senderId = ? OR receiverId = ?
    ORDER BY timestamp DESC
  ) m ON ( (m.senderId = u.id AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = u.id) )
  WHERE (f.userId = ? OR f.friendId = ?) 
    AND u.id != ?
    AND f.status = 'accepted'
  GROUP BY u.id
`;
db.all(sql, [userId, userId, userId, userId, userId, userId, userId], (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json(rows);
});

});

// Send friend request
router.post("/friend-request", (req, res) => {
  try {
    const userId = req.session && req.session.userId;
    const friendId = Number(req.body.friendId || req.body.friendId === 0 ? req.body.friendId : req.body.friendId);

    if (!userId) {
      console.warn("Friend request blocked: not logged in");
      return res.status(401).json({ error: "Not logged in" });
    }
    if (!friendId) {
      console.warn("Friend request blocked: missing friendId, body:", req.body);
      return res.status(400).json({ error: "friendId required" });
    }
    if (userId === friendId) {
      return res.status(400).json({ error: "You cannot friend yourself" });
    }

    // Ensure friendships table exists with unique constraint (userId, friendId)
    // Prevent duplicate or reverse duplicates (optional)
    const checkSql = `SELECT id, status FROM friendships WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)`;
    db.get(checkSql, [userId, friendId, friendId, userId], (err, row) => {
      if (err) {
        console.error("DB error checking friendship:", err);
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        // If reverse exists and accepted -> already friends
        if (row.status === "accepted") return res.status(400).json({ error: "Already friends" });
        // If pending in either direction
        return res.status(400).json({ error: "Request already exists or pending" });
      }

      const sql = `INSERT INTO friendships (userId, friendId, status) VALUES (?, ?, 'pending')`;
      db.run(sql, [userId, friendId], function(err) {
        if (err) {
          console.error("Insert friendship failed:", err.message);
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Request already sent" });
          }
          return res.status(500).json({ error: err.message });
        }
        console.log(`Friend request created: ${userId} -> ${friendId} (id=${this.lastID})`);
        res.json({ msg: "Friend request sent! 🤝", id: this.lastID });
      });
    });
  } catch (ex) {
    console.error("Unexpected friend-request error:", ex);
    res.status(500).json({ error: "Server error" });
  }
});

// Accept friend request
router.post("/friend-accept/:friendshipId", (req, res) => {
  const userId = req.session.userId;
  const friendshipId = req.params.friendshipId;

  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const sql = `UPDATE friendships SET status = 'accepted' WHERE id = ? AND friendId = ?`;
  db.run(sql, [friendshipId, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ msg: "Friend request accepted! 🎉" });
  });
});

// Get pending friend requests
router.get("/friend-requests", (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const sql = `
    SELECT f.id, u.id as userId, u.username, u.profilePic
    FROM friendships f
    JOIN users u ON f.userId = u.id
    WHERE f.friendId = ? AND f.status = 'pending'
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get message thread between two users (with decryption)
router.get("/thread/:otherUserId", (req, res) => {
  const currentUser = req.session.userId;
  const otherUser = Number(req.params.otherUserId);

  if (!currentUser || !otherUser) {
    return res.status(400).json({ error: "Invalid IDs" });
  }

  // First check if they're friends
  const friendCheck = `
    SELECT * FROM friendships 
    WHERE ((userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?))
      AND status = 'accepted'
  `;

  db.get(friendCheck, [currentUser, otherUser, otherUser, currentUser], (err, friendship) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!friendship) return res.status(403).json({ error: "Not friends with this user" });

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

      // Decrypt messages before sending
      const decryptedRows = rows.map(row => ({
        ...row,
        text: decrypt(row.text)
      }));

      res.json(decryptedRows);
    });
  });
});

module.exports = router;
module.exports.encrypt = encrypt; // Export for use in server.js