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
const fs = require('fs');
const session = require("express-session");
const sharedSession = require("express-socket.io-session");
const server = http.createServer(app);
const webpush = require("web-push");
const { v2: cloudinary } = require("cloudinary");

require("dotenv").config({ path: __dirname + "/.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const FRONTEND_ORIGIN = [
  process.env.FRONTEND_ORIGIN || "http://localhost:4000",
  process.env.FRONTEND_PROD || "https://holy-verse.web.app",
  process.env.FRONTEND_ALT || "https://holyverse-s5s1.onrender.com"
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, scripts
      if (FRONTEND_ORIGIN.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.use(bodyParser.json());

const { supabase } = require("./db/supabase"); // central client
const { sendNotif } = require("./notifications");

// storage config
const upload = multer({ storage: multer.memoryStorage() });


require("./cron"); // start cron jobs


function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

app.set("trust proxy", 1); // tell Express it’s behind a proxy

//middleware to parse json and cors to speak to frontend
app.use(express.json());       // to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // if you ever send form data
const whitelist = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:4000',
  process.env.FRONTEND_PROD || "https://holy-verse.web.app",
  process.env.FRONTEND_ALT || "https://holyverse-s5s1.onrender.com",
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // for cookies/sessions
})); // to speak to frontend, donno how though

// Replace your session setup in server.js with this:

// --- SESSION STORE SETUP ---
const pgSession = require("connect-pg-simple")(session);

const isProd = process.env.NODE_ENV === "production";

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "Itsasecretssshhhhh",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
};

// Use Postgres session store ONLY in production
if (isProd) {
  sessionOptions.store = new pgSession({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // <--- ignore self-signed cert
      }
    },
    createTableIfMissing: true
  });
}

const sessionMiddleware = session(sessionOptions);
app.use(sessionMiddleware);




// Share the SAME session instance with Socket.IO
io.use(sharedSession(sessionMiddleware, {
  autoSave: true
}));

const communityRoutes = require("./routes/commune");
app.use("/commune", communityRoutes);

const chatRoutes = require("./routes/chat");
// Import chat encryption helper from your converted route (it exports encrypt)
const { encrypt } = require("./routes/chat");
app.use("/chat", chatRoutes);


// Serve frontend in production
if(process.env.NODE_ENV === "development") {
  app.use(express.static(path.join(__dirname, "../frontend")));
}




// Web-push config
if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
  webpush.setVapidDetails(
    "mailto:your@email.com",
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
  );
} else {
  console.warn("VAPID keys not set; push notifications will fail.");
}

// Replace your Socket.IO connection handler with this:
io.on("connection", (socket) => {
  const userId = socket.handshake.session?.userId;
  const username = socket.handshake.session?.username;



  if (!userId) {
    console.log("❌ No userId in session, disconnecting socket");
    return socket.disconnect();
  }

  // Join a private room
  socket.on("joinRoom", ({ userA, userB }) => {
    const room = [userA, userB].sort().join("_");
    socket.join(room);

  });

  // Send a message with encryption
  socket.on("sendMessage", async (msg) => {
    const { receiverId, text } = msg;
    const room = [userId, receiverId].sort().join("_");

    
    try {
      // Encrypt the message before saving
      const encryptedText = encrypt(text);

      // Save to DB
      const { data: insertData, error: insertErr } = await supabase
        .from("messages")
        .insert([{ senderId: userId, receiverId, text: encryptedText }])
        .select()
        .single();

      if (insertErr) {
        console.error("Error inserting message:", insertErr);
        socket.emit("messageError", { error: "Failed to save message" });
        return;
      }

      // fetch sender info (username + profilePic)
      const { data: senderInfo, error: senderErr } = await supabase
        .from("users")
        .select("username, profilePic")
        .eq("id", userId)
        .single();

      if (senderErr) {
        console.error("Error fetching sender info:", senderErr);
        socket.emit("messageError", { error: "Failed to fetch sender info" });
        return;
      }

      // Broadcast decrypted text (frontend expects plaintext)
      const savedMsg = {
        id: insertData.id,
        senderId: userId,
        receiverId,
        text, // original plaintext
        senderUsername: senderInfo.username,
        senderProfilePic: senderInfo.profilePic,
        timestamp: insertData.timestamp || new Date().toISOString()
      };

      io.to(room).emit("newMessage", savedMsg);

      // only send push to **receiver**, not sender
  // Inside io.on("connection") -> socket.on("sendMessage")
const payload = {
  title: `New message from ${senderInfo.username} 💌`,
  body: text.length > 50 ? text.slice(0, 50) + "…" : text,
  url: "/private.html"
};

await sendNotif(receiverId, payload);
    } catch (error) {
      console.error("❌ Encryption error:", error);
      socket.emit("messageError", { error: "Message encryption failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected. UserID:", userId);
  });
});



// store subscriptions per user in DB
app.post("/subscribe", async (req, res) => {
  const userId = req.session.userId;
  const sub = req.body;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  try {
    const payload = JSON.stringify(sub);
    const { error } = await supabase
      .from("push_subs")
      .upsert([{ user_id: userId, sub: payload }], { onConflict: ["user_id"] });

    if (error) {
      console.error("subscribe upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.sendStatus(201);
  } catch (err) {
    console.error("subscribe error:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});



// test notif route
app.get("/test-notif", (req, res) => {
  sendNotif(1, { title: "Friend Request 💌", body: "John sent you a friend request!" });
  res.send("Notification sent.");
});

// Serve static files from "public" with correct MIME for manifest
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






//port that server will run on
const PORT = process.env.PORT || 4000;



// ================= USERS ==================

// Serve the signup page nicely at /signup (GET)
app.get("/signup", (req, res) => {
  // hapa tunatuma file moja kwa moja and apparently do nothing else
  res.sendFile(__dirname + "/frontend/signup.html");
});

// Create account (POST)
app.post("/signup", async (req, res) => {
 try {
    const { username, birthday, password } = req.body;
    if (!username || !birthday || !password) return res.status(400).json({ error: "Fill all fields" });

    //hash password before putting in db like...
  const hashed = await bcrypt.hash(password,10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ username, birthday, password: hashed }])
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes("duplicate")) {
        return res.status(400).json({ error: "Username taken" });
      }
      return res.status(500).json({ error: error.message });
    }

    // Create session
    req.session.userId = data.id;
    req.session.username = data.username;

    const age = data.birthday ? calculateAge(data.birthday) : 10;

    res.json({ msg: "Account created", user: { id: data.id, username: data.username, age: age } });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Testing route kuona users wote (usiiache production 😅)
// Testing route kuona users wote (hide passwords)
app.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("id, username, birthday");
    if (error) return res.status(500).json({ error: error.message });
    const age = data.birthday ? calculateAge(data.birthday) : 10;
    res.json({ ...data, age });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get one user profile (for viewing by others)
app.get("/users/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, birthday, profilePic, bio, tree_level")
      .eq("id", Number(req.params.id))
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "User not found" });
    const age = data.birthday ? calculateAge(data.birthday) : 10;

    res.json({ ...data, age });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/heartbeat", async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ error: "Not logged in" });

    const userId = req.session.userId;

    // fetch user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, last_active, received_welcome_back")
      .eq("id", userId)
      .single();

    if (error) return res.status(500).json({ error: "DB error" });

    const last = user.last_active ? new Date(user.last_active) : null;
    const hoursSince = last ? (Date.now() - last) / 36e5 : Infinity;

    // if they've been gone > 48h and we haven't welcomed them back yet, do it now
    let sentWelcomeBack = false;
    if (hoursSince > 48 && !user.received_welcome_back) {
      await sendNotif(userId, {
        title: "Welcome back 🎉",
        body: "You’ve been away for a bit. Good to see you again!"
      });

      await supabase
        .from("users")
        .update({ received_welcome_back: true })
        .eq("id", userId);

      sentWelcomeBack = true;
    }

    // always update last_active to now
    await supabase
      .from("users")
      .update({ last_active: new Date().toISOString() })
      .eq("id", userId);

    return res.json({ ok: true, sentWelcomeBack, hoursSince });
  } catch (err) {
    console.error("heartbeat error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// Login (POST)
// Login (POST)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Provide credentials" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, birthday, password, last_active, received_welcome_back")
      .eq("username", username)
      .single();

    if (error || !user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Success: set session
    req.session.userId = user.id;
    req.session.username = user.username;

   
    const age = user.birthday ? calculateAge(new Date(user.birthday)) : 10;
    res.json({ msg: "Logged in", user: { id: user.id, username: user.username, age: age } });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/me", async (req, res) => {
  const uid = req.session && req.session.userId;
  if (!uid) return res.status(401).json({ error: "Not logged in" });

  await supabase
  .from("users")
  .update({
    last_active: new Date().toISOString(),
    received_welcome_back: false,
    received_miss_you: false
  })
  .eq("id", uid);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, birthday, profilePic")
      .eq("id", uid)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    const age = data.birthday ? calculateAge(data.birthday) : 10;
    res.json({ ...data, age });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // default cookie name
    res.json({ msg: "Logged out👋" });
  });
});

// express
app.post("/track-visitor", async (req, res) => {
  const { anonId } = req.body;

  try {
    // check if exists
    const { data: existing, error: checkError } = await supabase
      .from("visitors")
      .select("anon_id")
      .eq("anon_id", anonId)
      .single();

    if (existing) {
      return res.status(200).json({ message: "Already counted" });
    }

    // if new, insert
    const { error: insertError } = await supabase
      .from("visitors")
      .insert([{ anon_id: anonId }]);

    if (insertError) throw insertError;

    res.status(201).json({ message: "New visitor added" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


//start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


// Update user route
app.put("/users/:id", upload.single("profilePic"), async (req, res) => {

  try {
    const { username, password, bio, treeLevel } = req.body;
    const userId = req.params.id;

    if (!username) {
      return res.status(400).json({ error: "Username required." });
    }

    // Start with basic updates
    const params = { username };

    // Add bio if provided
    if (bio) {
      params.bio = bio;
    }

    // Add password if provided
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      params.password = hashed;
    }

    // Add profilePic if uploaded
    if (req.file) {
  const base64 = req.file.buffer.toString("base64");
  const dataURI = `data:${req.file.mimetype};base64,${base64}`;

  const uploadResult = await cloudinary.uploader.upload(dataURI, {
    folder: "profiles",
    public_id: `user-${userId}-${Date.now()}`
  });

  params.profilePic = uploadResult.secure_url;
 
}
    if (treeLevel !== undefined) {
      params.tree_level = parseInt(treeLevel, 10); // <-- save treeLevel
    }


    // Finally, update the user record
    const { data, error } = await supabase
        .from("users")
        .update(params)
        .eq("id", userId)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ msg: "Profile updated", profilePicUrl: data.profilePic || null });
  } catch (err) {
    console.error("update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});




