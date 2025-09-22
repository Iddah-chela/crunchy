//import express
const express = require('express');
const cors = require('cors');

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./randomverse.db", (err) => {
  if (err) console.error("🔥 Error opening SQLite:", err.message);
  else console.log("✅ SQLite connected safi!");
});

// Create tables if haziko
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      age INTEGER,
      password TEXT
    )
  `);

});
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });


const app = express();

const session = require("express-session");

app.use(session({
  secret: "Itsasecretssshhhhh",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } //only true if using https
}))
const communityRoutes = require("./routes/commune");
app.use("/commune", communityRoutes);

const chatRoutes = require("./routes/chat");
const { error } = require('console');
app.use("/chat", chatRoutes);

//serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Temporary "users DB" (baadaye itakuwa SQLite)
let users = [];


//middleware to parse json and cors to speak to frontend
app.use(express.json());
app.use(cors());

// get one question with explanations + verses
// app.get("/questions/:qkey", (req, res) => {
//   const qkey = req.params.qkey;

//   db.get(`SELECT * FROM questions WHERE qkey = ?`, [qkey], (err, question) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!question) return res.status(404).json({ error: "Not found" });

//     db.all(`SELECT * FROM explanations WHERE question_id = ?`, [question.id], (err, explanations) => {
//       if (err) return res.status(500).json({ error: err.message });

//       const promises = explanations.map(exp => new Promise((resolve, reject) => {
//         db.all(`SELECT * FROM verses WHERE explanation_id = ?`, [exp.id], (err, verses) => {
//           if (err) reject(err);
//           resolve({ ...exp, verses });
//         });
//       }));

//       Promise.all(promises).then(fullExplanations => {
//         res.json({ ...question, explanations: fullExplanations });
//       });
//     });
//   });
// });


app.get('/test', (req,res) => {
  res.send("Express is running!");
});



// GET all verses for a given question
app.get("/questions/:qkey", (req, res) => {
  const qkey = req.params.qkey;

  const sql = `
    SELECT v.ref, v.text, v.theme, v.tags, e.text AS category
    FROM questions q
    JOIN explanations e ON e.question_id = q.id
    JOIN verses v ON v.explanation_id = e.id
    WHERE q.qkey = ?;
  `;

  db.all(sql, [qkey], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows); // send to frontend
  });
});

// Get all questions
app.get("/questions", (req, res) => {
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


//port that server will run on
const PORT = 4000;

//an example route
app.get('/', (req, res) => {
    res.send('Wozzaaa, this is backend. Do you see me??')
});

// ================= USERS ==================

// Serve the signup page nicely at /signup (GET)
app.get("/signup", (req, res) => {
  // hapa tunatuma file moja kwa moja
  res.sendFile(__dirname + "/frontend/signup.html");
});

// Create account (POST)
app.post("/signup", (req, res) => {
  const { username, age, password } = req.body;

  // validation ya mtaa
  if (!username || !age || !password) {
    return res.status(400).json({ error: "Ebu jaza boxes zote 😒" });
  }

  // username unique kiasi
  // NOTE: password iko plain-text leo. Kesho: bcrypt.
 const sql = "INSERT INTO users (username, age, password) VALUES (?, ?, ?)";
  db.run(sql, [username, age, password], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ error: "Username imechukuliwa 😤" });
      }
      return res.status(500).json({ error: err.message });
    } 
    // usirudishe password kwa response IRL; ni demo
    res.json({ msg: "Account imeundwa safi 🎉", user: { id: this.lastID, username, age } });
  });
});

// Testing route kuona users wote (usiiache production 😅)
// Testing route kuona users wote (hide passwords)
app.get("/users", (req, res) => {
  db.all("SELECT id, username, age FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get one user profile (for viewing by others)
app.get("/users/:id", (req, res) => {
  const sql = "SELECT id, username, age FROM users WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User haonekani 😅" });
    res.json(row);
  });
});

// Update own profile
app.put("/users/:id", (req, res) => {
  const { username, age, password } = req.body;

  const sql = `
    UPDATE users
    SET username = COALESCE(?, username),
        age = COALESCE(?, age),
        password = COALESCE(?, password)
    WHERE id = ?
  `;
  db.run(sql, [username, age, password, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: "User haonekani 😅" });
    }

    res.json({ msg: "Profile imeboreshwa ✅" });
  });
});


// Login (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Weka credentials zote bana 😤" });
  }

  // check if user exists
  const sql = "SELECT id, username, age FROM users WHERE username = ? AND password = ?";
  db.get(sql, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      return res.status(401).json({ error: "Username au password si sahihi 👀" });
    }
    //success
    res.json({ msg: "Login safi, karibu tena 🎉", user: row });
  });
  req.session.userId = user.id; //remember logged in user
  res.json({ success: true })
});

app.get("/me", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ errror: "Not logged  in" });
  }

  db.get("SELECT id, username, age FROM users WHERE id = ?", [req.session.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  })
})


//start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});