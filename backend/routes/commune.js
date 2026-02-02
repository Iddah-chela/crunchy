// routes/community.js
const express = require("express");

const path = require('path');
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

require("dotenv").config({ path: __dirname + "/../.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const { supabase } = require("../db/supabase"); // central client
const { sendNotif } = require("../notifications");

// Storage setup - use memory storage for cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

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


// Inappropriate content filter
const INAPPROPRIATE_WORDS = [
  // profanity
  'damn', 'hell', 'crap', 'ass', 'bastard', 'bitch', 'shit', 'fuck',

  // sexual content
  'sex', 'porn', 'nude', 'naked', 'xxx', 'explicit',
  'horny', 'sexy', 'dick', 'cock', 'pussy', 'slut', 'whore',

  // substances
  'drunk', 'alcohol', 'beer', 'vodka', 'whiskey',
  'drugs', 'weed', 'cocaine', 'heroin', 'meth',

  // violence / harm
  'violence', 'kill', 'murder', 'death', 'rape',
  'abuse', 'suicide', 'selfharm',

  // harassment / hate
  'idiot', 'stupid', 'hate', 'racist',

  // links & grooming vectors (handled separately but still flagged)
  'snapchat', 'instagram', 'telegram', 'whatsapp'
];

function containsMatureContent(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  
  // Check for inappropriate words
  for (const word of INAPPROPRIATE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  // Check for phone numbers, emails, and URLs
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) return true;
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) return true;
  if (/(https?:\/\/|www\.)/i.test(text)) return true;
  
  return false;
}

// ================= QUESTIONS ==================

// Get all questions with automatic age-appropriate filtering
router.get("/questions", async (req, res) => {
  const uid = req.session?.userId || -1;

  try {
    let userAge = 10;
    let ageWarning = null;

    if (uid !== -1) {
      const { data: user, error: userErr } = await supabase
        .from("users")
        .select("birthday")
        .eq("id", uid)
        .single();
      if (userErr) throw userErr;
      if (user?.birthday) {
        userAge = calculateAge(user.birthday);
        ageWarning = null;
      }
    } 

    
    const { data, error } = await supabase
      .from("community_questions")
      .select(`
        id, title, body, created_at, image, mature_content,
        users:user_id(username, id, profilePic),
        favorites:favorites(*)
      `)
      .eq("hidden", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const filtered = data
      .filter(q => userAge >= 18 || Number(q.mature_content) === 0)
      .map(q => {
        const favorited = (q.favorites || []).some(f => f.user_id === uid);
        const favorites_count = (q.favorites || []).length;
        return {
          id: q.id,
          title: q.title,
          body: q.body,
          created_at: q.created_at,
          image: q.image,
          author: q.users?.username || "Anonymous",
          authorId: q.users?.id || null,
          authorProfilePic: q.users?.profilePic || null,
          favorited,
          favorites_count
        };
      });


    res.json({questions: filtered, warning: ageWarning});

  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: err.message });
  }
});





// Create new question with automatic mature content detection
router.post("/questions", upload.single("image"), async (req, res) => {
  const { user_id, title, body } = req.body;

  if (!user_id || !title || !body) {
    return res.status(400).json({ error: "Fill all fields." });
  }

  // Block inappropriate content
  if (containsMatureContent(title + " " + body)) {
    return res.status(400).json({ 
      error: "Your message contains inappropriate content or personal information (profanity, phone numbers, emails, links). Please keep our community safe and respectful." 
    });
  }

  const mature_content = 0;

  try {
    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "holyverse/community",
        public_id: `post-${Date.now()}`
      });

      imageUrl = uploadResult.secure_url;
    }

    const { data, error } = await supabase
      .from("community_questions")
      .insert([{ user_id, title, body, mature_content, image: imageUrl }])
      .select()
      .single();

    if (error) throw error;

    res.json(data);

    // --- NOTIFICATIONS ---
    // fetch the posting user's info for the notification
    const { data: user } = await supabase
      .from("users")
      .select("username")
      .eq("id", user_id)
      .single();

    const payload = {
      title: "New post. 📣",
      body: `${user?.username || "Someone"} posted: ${
        title.length > 50 ? title.slice(0, 50) + "…" : title
      }`,
      url: "/community.html"
    };

    // Fetch all subscriptions except the poster
    await sendNotif(null, payload, user_id) // broadcast to all except poster

  } catch (err) {
    console.error("Insert question failed:", err);
    res.status(500).json({ error: err.message });
  }
});


// Edit posts as the poster
router.put("/questions/:id", async (req, res) => {
  const { body } = req.body;
  const questionId = req.params.id;
  const userId = req.session.userId;

  try {
    const { data: post, error: fetchErr } = await supabase
      .from("community_questions")
      .select("user_id")
      .eq("id", questionId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.user_id !== userId) return res.status(403).json({ error: "Not yours" });

    const { error: updateErr } = await supabase
      .from("community_questions")
      .update({ body })
      .eq("id", questionId);

    if (updateErr) throw updateErr;
    res.json({ success: true });

  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete post
// Soft delete post
router.delete("/questions/:id", async (req, res) => {
  const questionId = req.params.id;
  const userId = req.session.userId;

  try {
    const { data: post, error: fetchErr } = await supabase
      .from("community_questions")
      .select("user_id")
      .eq("id", questionId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.user_id !== userId) return res.status(403).json({ error: "Not yours" });

    const { error } = await supabase
      .from("community_questions")
      .update({ hidden: 1 })
      .eq("id", questionId);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= RESPONSES ==================

// Get all responses for a question
// GET responses for a question (include parent_response_id)
router.get("/questions/:id/responses", async (req, res) => {
  const questionId = req.params.id;

  try {
    const { data, error } = await supabase
      .from("community_responses")
      .select(`
        id, body, created_at, parent_response_id, image,
        user:user_id(username)
      `)
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const formatted = data.map(r => ({
      id: r.id,
      body: r.body,
      created_at: r.created_at,
      parent_response_id: r.parent_response_id,
      image: r.image,
      username: r.user.username
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add response to a question
// POST response (nested)
router.post("/questions/:id/responses", upload.single("image"), async (req, res) => {
   const questionId = req.params.id;
  const { user_id, body, parent_response_id } = req.body;

  if (!user_id || !body) return res.status(400).json({ error: "Fill response" });

  try {
    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "holyverse/responses",
        public_id: `response-${Date.now()}`
      });

      imageUrl = uploadResult.secure_url;
    }

    const { data, error } = await supabase
      .from("community_responses")
      .insert([{ question_id: questionId, user_id, parent_response_id: parent_response_id || null, body, image: imageUrl }])
      .select()
      .single();

    if (error) throw error;
    // 🔔 2. Fetch who should be notified
    let targetUserId = null;

    if (parent_response_id) {
      // Replying to another response → notify that response owner
      const { data: parent, error: parentErr } = await supabase
        .from("community_responses")
        .select("user_id")
        .eq("id", parent_response_id)
        .single();

      if (!parentErr && parent && parent.user_id !== Number(user_id)) {
        targetUserId = parent.user_id;
      }

    } else {
      // Replying to the question directly → notify question owner
      const { data: question, error: qErr } = await supabase
        .from("community_questions")
        .select("user_id, title")
        .eq("id", questionId)
        .single();

      if (!qErr && question && question.user_id !== Number(user_id)) {
        targetUserId = question.user_id;
      }
    }

    // 3. Send notification if needed
    if (targetUserId) {
      await sendNotif(targetUserId, {
        title: "New reply",
        body: "Someone replied to your post!",
        url: `/question.html?id=${questionId}`
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Insert response error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite
router.post("/questions/:id/favorite", async (req, res) => {

  const userId = req.session?.userId;
  const questionId = req.params.id;

  if (!userId) return res.status(401).json({ error: "Login required" });

  try {
    // Check if already favorited
    const { data: existing, error: fetchErr } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (fetchErr && !fetchErr.message.includes("No rows")) throw fetchErr;

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;
      return res.json({ favorited: false });
    }

    // Add favorite
    const { data: fav, error } = await supabase
      .from("favorites")
      .insert([{ user_id: userId, question_id: questionId }])
      .select()
      .single();

    if (error) throw error;

    // 🔔 Notify the author
    const { data: question, error: qErr } = await supabase
      .from("community_questions")
      .select("user_id, title")
      .eq("id", questionId)
      .single();

    if (!qErr && question && question.user_id !== userId) {
      await sendNotif(question.user_id, {
        title: "New favorite ❤️",
        body: "Someone favorited your post!",
        url: `/question.html?id=${questionId}`
      });
    }

    res.json({ favorited: true, id: fav.id });

  } catch (err) {
    console.error("Favorite toggle error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's favorites
router.get("/favorites", async (req, res) => {
  const userId = req.session && req.session.userId;
  if (!userId) return res.json({ error: "Login required" });
  
  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("question_id")
      .eq("user_id", userId);
    if (error) throw error;

    res.json(data.map(r => r.question_id));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//get all favorites

module.exports = router;