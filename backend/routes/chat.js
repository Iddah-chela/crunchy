const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const { sendNotif } = require("../notifications"); // import sendNotif
const { supabase } = require("../db/supabase"); // central client


// Encryption / Decryption
const ENCRYPTION_KEY = process.env.MESSAGE_KEY || "your-32-char-secret-key-here!!";
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/* ------------------------------------------------------------------------------------------------
   GET FRIENDS LIST
------------------------------------------------------------------------------------------------ */
router.get("/friends", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  // Get all friendships involving this user
  const { data: friendships, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      userId,
      friendId
    `
    )
    .or(`userId.eq.${userId},friendId.eq.${userId}`)
    .eq("status", "accepted");

  if (error) return res.status(500).json({ error: error.message });

  if (!friendships.length) return res.json([]);

  const friendIds = friendships.map((f) =>
    f.userId === userId ? f.friendId : f.userId
  );

  // Fetch user profiles for all friends
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("id, username, profilePic")
    .in("id", friendIds);

  if (usersErr) return res.status(500).json({ error: usersErr.message });

  // For each friend, fetch last message between the two
  const final = [];

  for (const friend of users) {
    const { data: msg } = await supabase
      .from("messages")
      .select("id, senderId, receiverId, text, timestamp")
      .or(
        `and(senderId.eq.${userId},receiverId.eq.${friend.id}),and(senderId.eq.${friend.id},receiverId.eq.${userId})`
      )
      .order("timestamp", { ascending: false })
      .limit(1);

    final.push({
      id: friend.id,
      username: friend.username,
      profilePic: friend.profilePic,
      lastMessage: msg && msg.length ? decrypt(msg[0].text) : null,
      lastTimestamp: msg && msg.length ? msg[0].timestamp : null,
    });
  }

  res.json(final);
});

/* ------------------------------------------------------------------------------------------------
   SEND FRIEND REQUEST
------------------------------------------------------------------------------------------------ */
router.post("/friend-request", async (req, res) => {
  try {
    const userId = req.session.userId;
    const friendId = Number(req.body.friendId);

    if (!userId) return res.status(401).json({ error: "Not logged in" });
    if (!friendId) return res.status(400).json({ error: "friendId required" });
    if (userId === friendId)
      return res.status(400).json({ error: "You cannot friend yourself" });

    // Check if a relationship already exists
    const { data: existing, error: checkErr } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(userId.eq.${userId},friendId.eq.${friendId}),and(userId.eq.${friendId},friendId.eq.${userId})`
      );

    if (checkErr) return res.status(500).json({ error: checkErr.message });

    if (existing.length)
      return res
        .status(400)
        .json({ error: "Request already exists or already friends" });

    // Insert pending request
    const { data, error } = await supabase
      .from("friendships")
      .insert({
        userId,
        friendId,
        status: "pending",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    
// --- SEND NOTIF TO TARGET USER ---
await sendNotif(friendId, {
  title: "New Friend Request 💌",
  body: `You have a new friend request from ${req.session.username}!`,
  url: "/friends.html" // optional, wherever you want them to click to see requests
});


    res.json({ msg: "Friend request sent!", id: data.id });
  } catch (ex) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------------------------------------------------------------------------
   ACCEPT FRIEND REQUEST
------------------------------------------------------------------------------------------------ */
router.post("/friend-accept/:friendshipId", async (req, res) => {
  const userId = req.session.userId;
  const friendshipId = req.params.friendshipId;

  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("friendId", userId);

  if (error) return res.status(500).json({ error: error.message });

  // Get the original request to know who sent it
const { data: request, error: fetchErr } = await supabase
  .from("friendships")
  .select("userId, friendId")
  .eq("id", friendshipId)
  .single();

if (fetchErr) return res.status(500).json({ error: fetchErr.message });


// --- SEND NOTIF TO ORIGINAL SENDER ---
await sendNotif(request.userId, {
  title: "Friend Request Accepted 🎉",
  body: `${req.session.username} accepted your friend request!`,
  url: "/friends.html"
});

  res.json({ msg: "Friend request accepted!" });
});

// POST /chat/friend-decline/:id
router.post("/friend-decline/:id", async (req, res) => {
  const friendshipId = req.params.id;
  const userId = req.session?.userId;

  if (!userId) return res.status(401).json({ error: "Login required" });

  try {
    // make sure this request belongs to the current user
    const { data: fr, error: fetchErr } = await supabase
      .from("friendships")
      .select("*")
      .eq("id", friendshipId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!fr || fr.friendId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    // delete the pending request
    const { error: delErr } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);
    if (delErr) throw delErr;

    res.json({ msg: "Friend request declined" });
  } catch (err) {
    console.error("Decline request error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------------------------------------------------
   GET PENDING FRIEND REQUESTS
------------------------------------------------------------------------------------------------ */
router.get("/friend-requests", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      userId,
      users:userId (id, username, profilePic)
    `
    )
    .eq("friendId", userId)
    .eq("status", "pending");

  if (error) return res.status(500).json({ error: error.message });

  res.json(
    data.map((row) => ({
      id: row.id,
      userId: row.userId,
      username: row.users.username,
      profilePic: row.users.profilePic,
    }))
  );
});

/* ------------------------------------------------------------------------------------------------
   GET MESSAGE THREAD BETWEEN TWO USERS
------------------------------------------------------------------------------------------------ */
router.get("/thread/:otherUserId", async (req, res) => {
  const currentUser = req.session.userId || {};
  const otherUser = Number(req.params.otherUserId);

  if (!currentUser || !otherUser)
    return res.status(400).json({ error: "Invalid IDs" });

  // Check friendship
  const { data: friendship } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(userId.eq.${currentUser},friendId.eq.${otherUser}),and(userId.eq.${otherUser},friendId.eq.${currentUser})`
    )
    .eq("status", "accepted")
    .limit(1);

  if (!friendship || !friendship.length)
    return res.status(403).json({ error: "Not friends with this user" });

  // Fetch messages
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      senderId,
      receiverId,
      text,
      timestamp,
      users:senderId (username, profilePic)
    `
    )
    .or(
      `and(senderId.eq.${currentUser},receiverId.eq.${otherUser}),and(senderId.eq.${otherUser},receiverId.eq.${currentUser})`
    )
    .order("timestamp", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const decrypted = data.map((row) => ({
    ...row,
    text: decrypt(row.text),
    senderUsername: row.users.username,
    senderProfilePic: row.users.profilePic,
  }));

  res.json(decrypted);
});

module.exports = router;
module.exports.encrypt = encrypt;
