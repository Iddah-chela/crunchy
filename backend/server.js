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
  process.env.FRONTEND_ALT || "https://holyverse-s5s1.onrender.com",
  'capacitor://localhost',
  'http://localhost',
  'ionic://localhost',
  'file://',
  'android-webview'
];
// Allow Capacitor/native origins used by the WebView

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin === "null") return callback(null, true); // Postman, scripts
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
  'capacitor://localhost',
  'http://localhost',
  'ionic://localhost',
  'file://',
  'android-webview',
  null,
  '*'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin || origin === "null" || origin === null) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1 || whitelist.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
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
    secure: false, // Always false for local/native testing
    sameSite: "none", // Always none for local/native testing
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

const pushRoutes = require("./routes/push");
app.use('/push', pushRoutes);



// Serve Bible JSONs from root-level bible folder at /bible/*.json
app.use('/bible', express.static(path.join(__dirname, '../bible')));

// Serve frontend in development
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
  console.log("/me headers:", req.headers);
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

// ===== YOUTUBE SEARCH ENDPOINT =====
app.get("/api/youtube/search", async (req, res) => {
  try {
    const query = req.query.q || "christian worship";
    const maxResults = Math.min(parseInt(req.query.max) || 15, 50);
    
    // Bias toward Christian music if not already specified
    const hasChristianKeyword = /\b(christ|worship|gospel|praise|hymn|church|faith|jesus|god|prayer)\b/i.test(query);
    const finalQuery = hasChristianKeyword ? query : `${query} worship christian`;
    
    const YT_KEY = process.env.YOUTUBE_API_KEY;
    if (!YT_KEY) {
      return res.status(500).json({ error: "YouTube API key not configured" });
    }
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(finalQuery)}&key=${YT_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }
    
    // Format results for frontend
    const formattedResults = (data.items || []).map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      description: item.snippet.description
    }));
    
    res.json({ results: formattedResults });
  } catch (err) {
    console.error("YouTube search error:", err);
    res.status(500).json({ error: "Search failed", details: err.message });
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

// ============================================
// PRAYER REQUESTS API
// ============================================

// Submit a prayer request
app.post("/api/prayer-requests", async (req, res) => {
  try {
    const { text, username, userId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Prayer request text required" });
    }
    
    const insertData = {
      text,
      username: username || "Anonymous",
      prayed_count: 0,
      created_at: new Date().toISOString()
    };
    
    // Only include user_id if it's a valid UUID (for now, until DB is updated)
    // To support numeric IDs, run the SQL commands in PRAYER_REQUESTS_TABLE_SETUP.sql
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && uuidRegex.test(String(userId))) {
      insertData.user_id = userId;
    }
    // Store numeric user ID in username field as fallback
    else if (userId) {
      insertData.username = username || `User ${userId}`;
    }
    
    const { data, error } = await supabase
      .from("prayer_requests")
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, request: data });
  } catch (error) {
    console.error("Error creating prayer request:", error);
    res.status(500).json({ error: "Failed to submit prayer request" });
  }
});

// Get all prayer requests
app.get("/api/prayer-requests", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching prayer requests:", error);
    res.status(500).json({ error: "Failed to load prayer requests" });
  }
});

// Pray for a request (increment count)
app.post("/api/prayer-requests/:id/pray", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Request ID required" });
    }
    
    // First get current count
    const { data: current, error: fetchError } = await supabase
      .from("prayer_requests")
      .select("prayed_count")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Then update with incremented value
    const { data, error } = await supabase
      .from("prayer_requests")
      .update({ prayed_count: (current.prayed_count || 0) + 1 })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error marking prayer request as prayed:", error);
    res.status(500).json({ error: "Failed to mark as prayed" });
  }
});

// Delete a prayer request
app.delete("/api/prayer-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Request ID required" });
    }
    
    const { error } = await supabase
      .from("prayer_requests")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting prayer request:", error);
    res.status(500).json({ error: "Failed to delete prayer request" });
  }
});

// ============================================
// TESTIMONIES API
// ============================================

// Submit testimony
app.post("/api/testimonies", async (req, res) => {
  try {
    const { text, tags, username, userId } = req.body;
    
    if (!text || !tags || tags.length === 0) {
      return res.status(400).json({ error: "Text and tags required" });
    }
    
    const insertData = {
      text,
      tags,
      username: username || "Anonymous",
      status: "pending",
      created_at: new Date().toISOString()
    };
    
    // Only include user_id if valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && uuidRegex.test(userId)) {
      insertData.user_id = userId;
    }
    
    const { data, error } = await supabase
      .from("testimonies")
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, testimony: data });
  } catch (error) {
    console.error("Error creating testimony:", error);
    res.status(500).json({ error: "Failed to submit testimony" });
  }
});

// Get approved testimonies
app.get("/api/testimonies", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("testimonies")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching testimonies:", error);
    res.status(500).json({ error: "Failed to load testimonies" });
  }
});

// Admin auth middleware
function requireAdmin(req, res, next) {
  const userId = req.session?.userId;
  const ADMIN_IDS = [1, 10]; // Update with your actual admin user IDs
  
  if (!userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  
  if (!ADMIN_IDS.includes(userId)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// Get pending testimonies (admin only)
app.get("/api/admin/testimonies", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("testimonies")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false});
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching pending testimonies:", error);
    res.status(500).json({ error: "Failed to load testimonies" });
  }
});

// Review testimony
app.post("/api/admin/testimonies/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    const { data, error } = await supabase
      .from("testimonies")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, testimony: data });
  } catch (error) {
    console.error("Error reviewing testimony:", error);
    res.status(500).json({ error: "Failed to review testimony" });
  }
});

// ============================================
// GROUPS API
// ============================================

// Save user group selections
app.post("/api/user-groups", async (req, res) => {
  try {
    const { userId, groups } = req.body;
    
    if (!userId || !groups) {
      return res.status(400).json({ error: "User ID and groups required" });
    }
    
    const { data, error } = await supabase
      .from("user_groups")
      .upsert({
        user_id: userId,
        groups,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, userGroups: data });
  } catch (error) {
    console.error("Error saving user groups:", error);
    res.status(500).json({ error: "Failed to save groups" });
  }
});

// Get user groups
app.get("/api/user-groups/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from("user_groups")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    
    res.json(data || { groups: [] });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Failed to load groups" });
  }
});

// ============================================
// USER-SUBMITTED Q&A
// ============================================

// Submit a user question
app.post("/api/user-questions", async (req, res) => {
  try {
    const { question, category, context, userId, username } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }
    
    // Only include user_id if it's a valid UUID
    const insertData = {
      question,
      category: category || "other",
      context,
      username: username || "Anonymous",
      status: "pending",
      created_at: new Date().toISOString()
    };
    
    // Check if userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && uuidRegex.test(userId)) {
      insertData.user_id = userId;
    }
    
    const { data, error } = await supabase
      .from("user_questions")
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, question: data });
  } catch (error) {
    console.error("Error submitting user question:", error);
    res.status(500).json({ error: "Failed to submit question" });
  }
});

// Get pending questions (admin only)
app.get("/api/admin/user-questions", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_questions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching pending questions:", error);
    res.status(500).json({ error: "Failed to load questions" });
  }
});

// Approve/reject question
app.post("/api/admin/user-questions/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, versePool, explanation, theme } = req.body; // action: 'approve' or 'reject'
    
    if (action === "approve") {
      // OPTION A: Migrate approved question to main questions table
      
      // 1. Get the user question
      const { data: userQuestion, error: fetchError } = await supabase
        .from("user_questions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // 2. Generate unique question_id
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("question_id")
        .like("question_id", "user_q%")
        .order("question_id", { ascending: false })
        .limit(1);
      
      let nextNum = 1;
      if (existingQuestions && existingQuestions.length > 0) {
        const lastId = existingQuestions[0].question_id;
        const match = lastId.match(/user_q(\d+)/);
        if (match) {
          nextNum = parseInt(match[1]) + 1;
        }
      }
      
      const questionId = `user_q${nextNum}`;
      
      // 3. Insert into main questions table
      const { data: newQuestion, error: qError } = await supabase
        .from("questions")
        .insert({
          question_id: questionId,
          question_text: userQuestion.question,
          category: userQuestion.category || "general",
          status: "published",
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (qError) throw qError;
      
      // 4. Create an explanation for this question, then add verses to it
      if (versePool && versePool.trim()) {
        // First, create an explanation (grouping for the verses)
        const { data: explanationData, error: expError } = await supabase
          .from("explanations")
          .insert({
            question_id: newQuestion.id,
            text: explanation || "Answer" // Use provided explanation
          })
          .select()
          .single();
        
        if (expError) throw expError;
        
        // Now parse verse pool and insert verses linked to the explanation
        const verseLines = versePool.split("\n").map(v => v.trim()).filter(v => v);
        
        for (const verseLine of verseLines) {
          // Parse format: "Reference|Text" or just "Reference"
          const parts = verseLine.split("|");
          const verseRef = parts[0].trim();
          const verseText = parts[1] ? parts[1].trim() : `See ${verseRef}`; // Use provided text or fallback
          
          // Insert verse with actual text from admin
          await supabase.from("verses").insert({
            explanation_id: explanationData.id, // Link to explanation, not question directly
            ref: verseRef,
            text: verseText, // Use admin-provided text
            theme: theme || userQuestion.category || "general",
            tags: []
          });
        }
      }
      
      // 5. Mark user question as approved + migrated
      const { error: updateError } = await supabase
        .from("user_questions")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          migrated: true,
          verse_pool: versePool
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      console.log(`✓ Migrated user question ${id} to questions table as ${questionId}`);
      res.json({ success: true, questionId, migratedTo: questionId });
      
    } else {
      // Reject question
      const { error } = await supabase
        .from("user_questions")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) throw error;
      
      res.json({ success: true });
    }
  } catch (error) {
    console.error("Error reviewing question:", error);
    res.status(500).json({ error: "Failed to review question" });
  }
});

// ============================================
// REPORT SYSTEM
// ============================================

// Submit a report
app.post("/api/reports", async (req, res) => {
  try {
    const { contentId, contentType, reason, reporterId } = req.body;
    
    if (!contentId || !contentType || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Convert IDs to strings to avoid UUID issues
    const insertData = {
      content_id: String(contentId),
      content_type: contentType, // 'post', 'comment', 'user'
      reason,
      status: "pending", // Changed from "open" to match admin dashboard filter
      created_at: new Date().toISOString()
    };
    
    // Only add reporter_id if it's a valid UUID format
    if (reporterId && reporterId !== "guest") {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(String(reporterId))) {
        insertData.reporter_id = reporterId;
      }
    }
    
    const { data, error } = await supabase
      .from("reports")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    
    console.log(`✓ Report submitted for ${contentType} ${contentId}`);
    res.json({ success: true, report: data });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: "Failed to submit report", details: error.message });
  }
});

// Get pending reports (admin only)
app.get("/api/admin/reports", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

// Review report
app.post("/api/admin/reports/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'restore', 'delete', 'warn', 'ban'
    
    // Get the report details first
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // If action is 'delete', actually delete the reported content
    if (action === "delete" && report) {
      const contentType = report.content_type;
      const contentId = report.content_id;
      
      // Delete the actual content based on type
      if (contentType === "post") {
        // Community posts are stored in community_questions table
        const { error: deleteError } = await supabase
          .from("community_questions")
          .update({ hidden: true })
          .eq("id", contentId);
        
        if (deleteError) {
          console.error(`Error hiding community post ${contentId}:`, deleteError);
        }
      } else if (contentType === "comment" || contentType === "response") {
        // Community responses/comments are in community_responses table
        const { error: deleteError } = await supabase
          .from("community_responses")
          .delete()
          .eq("id", contentId);
        
        if (deleteError) {
          console.error(`Error deleting community response ${contentId}:`, deleteError);
        }
      } else if (contentType === "testimony") {
        await supabase.from("testimonies").delete().eq("id", contentId);
      } else if (contentType === "group_message") {
        await supabase.from("group_messages").delete().eq("id", contentId);
      }
      
      console.log(`✓ Deleted ${contentType} ${contentId} based on report ${id}`);
    }
    
    // Mark report as reviewed
    const { data, error } = await supabase
      .from("reports")
      .update({
        status: "reviewed",
        action_taken: action,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, report: data, contentDeleted: action === "delete" });
  } catch (error) {
    console.error("Error reviewing report:", error);
    res.status(500).json({ error: "Failed to review report" });
  }
});

// ============================================
// Q&A OFFLINE-FIRST SYNC API
// ============================================

// Get all published Q&A for initial cache or full sync
app.get("/api/qna/sync", async (req, res) => {
  try {
    const { last_sync } = req.query;
    console.log("📥 Q&A sync request, last_sync:", last_sync);
    
    // Get all questions
    let questionsQuery = supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });
    
    // If last_sync provided, only get updated questions
    if (last_sync) {
      questionsQuery = questionsQuery.gt("created_at", last_sync);
    }
    
    const { data: questions, error: qError } = await questionsQuery;
    
    if (qError) {
      console.error("Query error:", qError);
      throw qError;
    }
    
    console.log(`Found ${questions?.length || 0} questions in database`);
    if (last_sync && questions?.length === 0) {
      // Try without the date filter to see if there are any questions at all
      const { data: allQuestions } = await supabase
        .from("questions")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      console.log("Total questions in DB (ignoring date filter):", allQuestions?.length);
      if (allQuestions && allQuestions.length > 0) {
        console.log("Sample timestamps:", allQuestions.map(q => ({ id: q.id, created_at: q.created_at })));
      }
    }
    
    // Get verses separately for each question (through explanations)
    const questionsWithVerses = await Promise.all(
      (questions || []).map(async (question) => {
        // First get explanations for this question
        const { data: explanations } = await supabase
          .from("explanations")
          .select("id")
          .eq("question_id", question.id);
        
        if (!explanations || explanations.length === 0) {
          return {
            ...question,
            verses: []
          };
        }
        
        // Get all verses for these explanations
        const explanationIds = explanations.map(exp => exp.id);
        const { data: verses } = await supabase
          .from("verses")
          .select("*")
          .in("explanation_id", explanationIds);
        
        return {
          ...question,
          verses: verses || []
        };
      })
    );
    
    res.json({
      questions: questionsWithVerses,
      sync_time: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error syncing Q&A:", error);
    res.status(200).json({ questions: [], sync_time: new Date().toISOString(), error: error.message });
  }
});

// Get archived question IDs (for deletion from cache)
app.get("/api/qna/archived", async (req, res) => {
  try {
    // For now, return empty array since we don't have archived/status functionality yet
    // Once we add a status column to questions table, this will work properly
    res.json({ archived_ids: [] });
  } catch (error) {
    console.error("Error fetching archived questions:", error);
    res.status(200).json({ archived_ids: [] });
  }
});

// ============================================
// COMMUNITY GROUPS API
// ============================================

// Get all groups
app.get("/api/groups", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(200).json([]);
  }
});

// Get group details with rules and members
app.get("/api/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();
    
    if (groupError) throw groupError;
    
    // Get rules
    const { data: rules, error: rulesError } = await supabase
      .from("group_rules")
      .select("*")
      .eq("group_id", id)
      .order("rule_number");
    
    if (rulesError) throw rulesError;
    
    // Get members count
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("*", { count: "exact" })
      .eq("group_id", id);
    
    if (membersError) throw membersError;
    
    res.json({
      ...group,
      rules: rules || [],
      member_count: members?.length || 0
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(404).json({ error: "Group not found" });
  }
});

// Create group
app.post("/api/groups", async (req, res) => {
  try {
    const { name, description, icon, creator_id, creator_name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Group name required" });
    }
    
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name,
        description: description || "",
        icon: icon || "👥",
        creator_id,
        creator_name: creator_name || "Anonymous",
        status: "active"
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Auto-add creator as admin
    if (creator_id) {
      await supabase
        .from("group_members")
        .insert({
          group_id: data.id,
          user_id: creator_id,
          username: creator_name || "Anonymous",
          role: "admin"
        });
    }
    
    res.json(data);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(400).json({ error: "Failed to create group" });
  }
});

// Add rules to group
app.post("/api/groups/:id/rules", async (req, res) => {
  try {
    const { id } = req.params;
    const { rules } = req.body; // Array of rule texts
    
    if (!rules || !Array.isArray(rules)) {
      return res.status(400).json({ error: "Rules array required" });
    }
    
    const rulesToInsert = rules.map((text, index) => ({
      group_id: id,
      rule_number: index + 1,
      rule_text: text
    }));
    
    const { data, error } = await supabase
      .from("group_rules")
      .insert(rulesToInsert)
      .select();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("Error adding rules:", error);
    res.status(400).json({ error: "Failed to add rules" });
  }
});

// Get group posts
app.get("/api/groups/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", id)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error fetching group posts:", error);
      return res.status(500).json({ error: "Failed to load group posts", details: error });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching group posts:", error);
    res.status(500).json({ error: "Failed to load group posts" });
  }
});

// Post to group
app.post("/api/groups/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, body } = req.body;
    
    if (!body) {
      return res.status(400).json({ error: "Post content required" });
    }
    
    const { data, error } = await supabase
      .from("group_messages")
      .insert({
        user_id,
        username: req.body.username || "Anonymous",
        group_id: id,
        message: body
      })
      .select("*")
      .single();
    
    if (error) {
      console.error("Error creating group post:", error);
      return res.status(500).json({ error: "Failed to create post", details: error });
    }
    
    res.json(data);
  } catch (error) {
    console.error("Error creating group post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Join group
app.post("/api/groups/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, username } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Group ID required" });
    }
    
    // Validate UUID format for user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Check if already member using appropriate identifier
    let existing = null;
    if (user_id && uuidRegex.test(String(user_id))) {
      const { data } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", id)
        .eq("user_id", user_id)
        .single();
      existing = data;
    } else if (username) {
      const { data } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", id)
        .eq("username", username)
        .single();
      existing = data;
    }
    
    if (existing) {
      return res.status(400).json({ error: "Already member of this group" });
    }
    
    // Prepare insert payload; only include user_id if valid UUID
    const insertPayload = {
      group_id: id,
      username: username || "Guest"
    };
    if (user_id && uuidRegex.test(String(user_id))) {
      insertPayload.user_id = user_id;
    }

    const { data, error } = await supabase
      .from("group_members")
      .insert(insertPayload)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, member: data });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(400).json({ error: "Failed to join group" });
  }
});

// Leave group
app.delete("/api/groups/:id/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, username } = req.body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let error = null;
    if (user_id && uuidRegex.test(String(user_id))) {
      ({ error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", id)
        .eq("user_id", user_id));
    } else if (username) {
      ({ error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", id)
        .eq("username", username));
    } else {
      return res.status(400).json({ error: "User identifier required" });
    }
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(400).json({ error: "Failed to leave group" });
  }
});

// Get user's groups
app.get("/api/user/:userId/groups", async (req, res) => {
  try {
    const { userId } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let data, error;
    if (uuidRegex.test(String(userId))) {
      ({ data, error } = await supabase
        .from("group_members")
        .select("groups(*)")
        .eq("user_id", userId));
    } else {
      // Fallback: resolve username from users table then fetch by username
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();
      if (userErr) throw userErr;
      const uname = userRow?.username;
      ({ data, error } = await supabase
        .from("group_members")
        .select("groups(*)")
        .eq("username", uname));
    }
    
    if (error) throw error;
    
    const groups = data.map(m => m.groups).filter(Boolean);
    res.json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(200).json([]);
  }
});

