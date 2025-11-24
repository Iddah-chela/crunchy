const cron = require("node-cron");
const { supabase } = require("./db/supabase.js");
const { sendNotif } = require("./notifications.js");

// Runs every day at 10am server time
cron.schedule("0 10 * * *", async () => {
  console.log("Running inactivity check...");

  const now = Date.now();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(); // for welcome back reset

  try {
    // 1️⃣ Fetch all users inactive >3 days
    const { data: users, error } = await supabase
      .from("users")
      .select("id, last_active, received_miss_you, received_welcome_back")
      .lt("last_active", threeDaysAgo);

    if (error) {
      console.error("Cron fetch error:", error);
      return;
    }

    for (const user of users) {
      // 2️⃣ 3-day notification
      if (!user.received_miss_you && new Date(user.last_active) <= new Date(threeDaysAgo)) {
        await sendNotif(user.id, {
          title: "We miss you 👀",
          body: "It’s been a few days! We'd love to see you again."
        });

        await supabase
          .from("users")
          .update({ received_miss_you: true })
          .eq("id", user.id);
      }

      // 3️⃣ 7-day notification
      if (!user.received_miss_you && new Date(user.last_active) <= new Date(sevenDaysAgo)) {
        await sendNotif(user.id, {
          title: "It's been a week! 🌟",
          body: "We noticed you haven't been around for a week. Come back and check out what's new!"
        });

        await supabase
          .from("users")
          .update({ received_miss_you: true })
          .eq("id", user.id);
      }

      // 4️⃣ Reset received_welcome_back if inactive >2 days
      if (user.received_welcome_back && new Date(user.last_active) <= new Date(twoDaysAgo)) {
        await supabase
          .from("users")
          .update({ received_welcome_back: false })
          .eq("id", user.id);
      }
    }

    console.log(`Cron done. Checked ${users.length} users.`);
  } catch (err) {
    console.error("Cron error:", err);
  }
});
