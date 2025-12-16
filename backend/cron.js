const cron = require("node-cron");
const { supabase } = require("./db/supabase.js");
const { sendNotif } = require("./notifications.js");

// Minimal cron: backend only uses fields present in `users` table
// (last_active, received_3day_notif, received_7day_notif, tree_level).

// ============================================
// MAIN DAILY NOTIFICATION JOB - Runs at 10 AM
// Uses only fields present in `users`: last_active, received_3day_notif,
// received_7day_notif, tree_level. One notif per user per run.
// Priority: Re-engagement > Tree reminder > Streak nudge
// ============================================
cron.schedule("0 10 * * *", async () => {
  console.log("🔔 Running daily notification job (minimal fields)...");

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, last_active, received_3day_notif, received_7day_notif, tree_level");

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    let notifsSent = 0;

    for (const user of users) {
      const lastActive = user.last_active ? new Date(user.last_active) : null;
      const daysInactive = lastActive ? Math.floor((now - lastActive.getTime()) / day) : 999;
      let notifData = null;

      // ============================================
      // PRIORITY 1: RE-ENGAGEMENT (3-day and 7-day)
      // ============================================
      if (daysInactive >= 7 && !user.received_7day_notif) {
        notifData = {
          title: "It's been a week! 🌟",
          body: "We noticed you haven't been around for a week. Come back and see what's new!",
          update: { received_7day_notif: true }
        };
      } else if (daysInactive >= 3 && daysInactive < 7 && !user.received_3day_notif) {
        notifData = {
          title: "We miss you 👀",
          body: "It's been a few days! We'd love to see you again.",
          update: { received_3day_notif: true }
        };
      }

      // ============================================
      // PRIORITY 2: TREE REMINDER (simple proxy by inactivity)
      // If user has a tree_level > 0 and has been inactive ~1 day, nudge them.
      // ============================================
      if (!notifData && user.tree_level && user.tree_level > 0 && daysInactive === 1) {
        notifData = {
          title: "Your tree needs water! 🌱",
          body: "Come back to water your tree and keep it growing.",
        };
      }

      // ============================================
      // PRIORITY 3: STREAK NUDGE (approx using inactivity)
      // Without streak fields, we gently ping if they've missed 1 day.
      // ============================================
      if (!notifData && daysInactive === 1) {
        notifData = {
          title: "Don't lose your streak! 🔥",
          body: "Drop in today to keep the momentum going."
        };
      }

      if (notifData) {
        await sendNotif(user.id, {
          title: notifData.title,
          body: notifData.body,
          url: "/"
        });

        if (notifData.update) {
          await supabase
            .from("users")
            .update(notifData.update)
            .eq("id", user.id);
        }

        notifsSent++;
      }
    }

    console.log(`✅ Daily notifications sent to ${notifsSent} users`);
  } catch (err) {
    console.error("Daily notification error:", err);
  }
});

// ============================================
// RESET FLAGS WHEN USER RETURNS
// Call this from your login/activity endpoint
// ============================================
async function onUserReturn(userId) {
  try {
    await supabase
      .from("users")
      .update({ 
        received_3day_notif: false,
        received_7day_notif: false,
        last_active: new Date().toISOString()
      })
      .eq("id", userId);
  } catch (err) {
    console.error("Reset user flags error:", err);
  }
}

module.exports = { onUserReturn };

console.log("✅ Cron job initialized!");
console.log("   🔔 10 AM - Daily notification (one per user per run)");
console.log("   Priority: Re-engagement > Tree reminder > Streak nudge");

