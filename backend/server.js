//import express
const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",//change to frontend origin
    methods:["GET", "POST"],
    credentials: true // enable cookies and critical for sessions sharing
  }
});

app.use(bodyParser.json());


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
      password TEXT,
      profilePic TEXT
    )
  `);
  // Push subscriptions table
  db.run(`
    CREATE TABLE IF NOT EXISTS push_subs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      sub TEXT NOT NULL
    )
  `);


});

require("dotenv").config({ path: __dirname + "/.env" });

//middleware to parse json and cors to speak to frontend
app.use(express.json());       // to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // if you ever send form data
app.use(cors()); // to speak to frontend, donno how though

// Replace your session setup in server.js with this:

const session = require("express-session");
const sharedSession = require("express-socket.io-session");

// Create session middleware ONCE
const sessionMiddleware = session({
  secret: "Itsasecretssshhhhh",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // only true if using https
});

// Use it in Express
app.use(sessionMiddleware);

app.use((req, res, next) => {
  console.log("Session: ", req.session);
  next();
});

// Share the SAME session instance with Socket.IO
io.use(sharedSession(sessionMiddleware, {
  autoSave: true
}));

const communityRoutes = require("./routes/commune");
app.use("/commune", communityRoutes);

const chatRoutes = require("./routes/chat");
const { encrypt } = require("./routes/chat");
app.use("/chat", chatRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend")));
}

//serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Replace your Socket.IO connection handler with this:
io.on("connection", (socket) => {
  const userId = socket.handshake.session?.userId;
  const username = socket.handshake.session?.username;

  console.log("🔌 Socket connected. UserID:", userId, "Username:", username);

  if (!userId) {
    console.log("❌ No userId in session, disconnecting socket");
    return socket.disconnect();
  }

  // Join a private room
  socket.on("joinRoom", ({ userA, userB }) => {
    const room = [userA, userB].sort().join("_");
    socket.join(room);
    console.log(`👥 User ${userId} joined room: ${room}`);
  });

  // Send a message with encryption
  socket.on("sendMessage", (msg) => {
    const { receiverId, text } = msg;
    const room = [userId, receiverId].sort().join("_");

    console.log("📨 Saving message:", { from: userId, to: receiverId });

    try {
      // Encrypt the message before saving
      const encryptedText = encrypt(text);

      // Save to DB
      db.run(
        "INSERT INTO messages (senderId, receiverId, text) VALUES (?, ?, ?)",
        [userId, receiverId, encryptedText],
        function (err) {
          if (err) {
            console.error("❌ Error saving message:", err);
            // Send error back to sender
            socket.emit("messageError", { error: "Failed to save message" });
            return;
          }

          console.log("✅ Message saved with ID:", this.lastID);

          // Fetch sender info
          db.get("SELECT username, profilePic FROM users WHERE id = ?", [userId], (err, senderInfo) => {
            if (err) {
              console.error("❌ Error fetching sender info:", err);
              socket.emit("messageError", { error: "Failed to fetch sender info" });
              return;
            }

            // Send back the DECRYPTED message to clients
            const savedMsg = {
              id: this.lastID,
              senderId: userId,
              receiverId,
              text: text, // Send original text, not encrypted
              senderUsername: senderInfo.username,
              senderProfilePic: senderInfo.profilePic,
              timestamp: new Date()
            };

            console.log("📤 Broadcasting to room:", room);
            io.to(room).emit("newMessage", savedMsg);
          });
        }
      );
    } catch (error) {
      console.error("❌ Encryption error:", error);
      socket.emit("messageError", { error: "Message encryption failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected. UserID:", userId);
  });
});


const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:your@email.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

// store subscriptions per user in DB
app.post("/subscribe", (req, res) => {
  const userId = req.session.userId;
  const sub = req.body;
  db.run("INSERT OR REPLACE INTO push_subs (user_id, sub) VALUES (?, ?)", [userId, JSON.stringify(sub)]);
  res.sendStatus(201);
});

// later when you want to send a notification
function sendNotif(userId, payload) {
  db.get("SELECT sub FROM push_subs WHERE user_id = ?", [userId], (err, row) => {
    if (row) {
      const sub = JSON.parse(row.sub);
      webpush.sendNotification(sub, JSON.stringify(payload)).catch(console.error);
    }
  });
}

app.get("/test-notif", (req, res) => {
  sendNotif(1, { title: "Friend Request 💌", body: "John sent you a friend request!" });
  res.send("Notification sent.");
});

app.use(express.static("public", {
  setHeaders: (res, path) => {
    if (path.endsWith("manifest.json")) {
      res.setHeader("Content-Type", "application/manifest+json");
    }
  }
}));




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

app.get("/verses-by-theme/:theme", (req, res) => {
  const theme = req.params.theme.toLowerCase();

  const sql = `
    SELECT v.ref, v.text, v.theme, v.tags, e.text AS category
    FROM verses v
    JOIN explanations e ON e.id = v.explanation_id
    WHERE LOWER(v.theme) = ?;
  `;

  db.all(sql, [theme], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});



//port that server will run on
const PORT = process.env.PORT || 4000;

// Route root to home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

// ================= USERS ==================

// Serve the signup page nicely at /signup (GET)
app.get("/signup", (req, res) => {
  // hapa tunatuma file moja kwa moja
  res.sendFile(__dirname + "/frontend/signup.html");
});

// Create account (POST)
app.post("/signup", async (req, res) => {
  const { username, age, password } = req.body;

  //hash password before putting in db like...
  const hashedPassword = await bcrypt.hash(password,10);
  // validation ya mtaa
  if (!username || !age || !password) {
    return res.status(400).json({ error: "Ebu jaza boxes zote 😒" });
  }

  // ✅ automatically log them in
    req.session.userId = this.lastID;
    req.session.username = username;

  // username unique kiasi
  // NOTE: password iko plain-text leo. Kesho: bcrypt.
 const sql = "INSERT INTO users (username, age, password) VALUES (?, ?, ?)";
  db.run(sql, [username, age, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ error: "Username is taken!" });
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
  const sql = "SELECT id, username, age, profilePic FROM users WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User haonekani 😅" });
    res.json(row);
  });
});



// Login (POST)
// Login (POST)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Weka credentials zote bana 😤" });
  }

  // Wrap db.get in a Promise so we can await bcrypt properly
  const getUser = () => new Promise((resolve, reject) => {
    const sql = "SELECT id, username, age, password FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject("Username au password si fiti 👀");
      resolve(row);
    });
  });

  try {
    const user = await getUser();
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ error: "Password sio fiti 😬" });

    // Success: set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      msg: "Login safi, karibu tena 🎉",
      user: { id: user.id, username: user.username, age: user.age }
    });
  } catch (err) {
    res.status(401).json({ error: err.toString() });
  }
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

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout haikufaulu 😬" });
    }
    res.clearCookie("connect.sid"); // default cookie name
    res.json({ msg: "Logged out, tuonane tena 👋" });
  });
});



//start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.params.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Update user route
app.put("/users/:id", upload.single("profilePic"), async (req, res) => {
  const { username, age, password } = req.body; // all strings!
  const userId = req.params.id;

  if (!username || !age) {
    return res.status(400).json({ error: "Username and age required 😅" });
  }

  const params = [username, Number(age)];
  let sql = "UPDATE users SET username=?, age=?";

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    sql += ", password=?";
    params.push(hashed);
  }

  if (req.file) {
    const profilePicUrl = `/uploads/${req.file.filename}`;
    sql += ", profilePic=?";
    params.push(profilePicUrl);
  }

  sql += " WHERE id=?";
  params.push(userId);

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Return profilePic URL if updated
    const picUrl = req.file ? `/uploads/${req.file.filename}` : null;
    res.json({ msg: "Profile updated 🎉", profilePicUrl: picUrl });
  });
});



// Serve uploaded files
app.use("/uploads", express.static("uploads"));
