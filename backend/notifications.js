const webpush = require("web-push");
const {supabase} = require("./db/supabase.js"); // your supabase client
let admin;
try {
  admin = require('firebase-admin');
  const serviceAccount = require('../serviceAccountKey.json');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
} catch (e) {
  console.warn('firebase-admin not initialized (serviceAccount missing?):', e?.message || e);
}

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

    // Also send to native device tokens (FCM/APNs) if firebase-admin configured
    try {
      if (admin) {
        // fetch device tokens for this user
        const { data: tokensData, error: tErr } = await supabase
          .from('device_tokens')
          .select('*')
          .eq('user_id', userId);

        if (!tErr && tokensData && tokensData.length) {
          await Promise.all(tokensData.map(d => {
            if (!d.token) return Promise.resolve();
            const message = {
              token: d.token,
              notification: {
                title: payload.title || '',
                body: payload.body || ''
              },
              data: payload.data || {}
            };
            return admin.messaging().send(message).catch(err => {
              console.warn('FCM send failed for token', d.token, err?.message || err);
            });
          }));
        }
      }
    } catch (e) {
      console.error('Error sending FCM notifications', e);
    }

  } catch (err) {
    console.error("sendNotif error:", err);
  }
}

module.exports = { sendNotif };
