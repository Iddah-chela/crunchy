const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const router = express.Router();

//db file for messages
const dbPath = path.join(__dirname, "../../community.db");
const db = new sqlite3.Database(dbPath);

//create messages table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages 
        (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          sender TEXT NOT NULL,
          receiver TEXT NOT NULL,
          text TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `);
});

//Send a new message
router.post("/send", (req, res) => {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
        return res.status(400).json({ error: "sender, receiver and text are required" });
    }

    db.run(
        "INSERT INTO messages (sender, receiver, text) VALUES (?, ?, ?)",
        [sender, receiver, text],
        function (err) {
            if (err) return res.status(500).json({ error: err.message});

            res.json({success: true, id: this.lastID });
        }
    );
});

//get conversation between two users
router.get("/conversation/:userA/:userB", (req, res) => {
    const { userA, userB } = req.params;

    db.all(
        `SELECT * FROM messages WHERE (sender = ? AND receiver = ?)
        OR (sender = ? AND receiver = ?)
        ORDER BY timestamp ASC`,
        [userA, userB, userB, userA],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message});
            res.json(rows);
        }
    );
});

module.exports = router