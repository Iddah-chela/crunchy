const webpush = require("web-push");
const {supabase} = require("./db/supabase.js"); // your supabase client

/**
 * Send push notification to a user or broadcast to all except one.
 * 
 * @param {number} userId - If sending to a single user, pass their ID. If sending broadcast, pass null/undefined.
 * @param {object} payload - { title: string, body: string, url?: string }
 * @param {number} [excludeUserId] - Optional. If set, skip this user (for broadcasts).
 */
async function sendNotif(userId, payload, excludeUserId = null) {
  try {
    let subs;

    if (userId) {
      // single user
      const { data, error } = await supabase
        .from("push_subs")
        .select("sub")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        if (error) console.warn("No push subscription found:", error?.message);
        return;
      }

      subs = [data]; // array to unify handling
    } else {
      // broadcast to all, maybe exclude a user
      const { data, error } = await supabase
        .from("push_subs")
        .select("*");

      if (error || !data) {
        console.warn("No push subscriptions found for broadcast.");
        return;
      }

      subs = data.filter(s => excludeUserId == null || s.user_id !== excludeUserId);
    }

    await Promise.all(
      subs.map(s => {
        const sub = JSON.parse(s.sub);
        return webpush.sendNotification(sub, JSON.stringify(payload));
      })
    );

  } catch (err) {
    console.error("sendNotif error:", err);
  }
}

module.exports = { sendNotif };
