const cron = require("node-cron");
const { supabase } = require("./db/supabase.js");
const { sendNotif } = require("./notifications.js");

// Runs every day at 10am server time
cron.schedule("0 10 * * *", async () => {
  console.log("Running inactivity check...");

  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, last_active, received_miss_you")
    .lt("last_active", cutoff);

  if (error) {
    console.error("Cron error:", error);
    return;
  }

  for (const user of users) {
    if (!user.received_miss_you) {
      await sendNotif(user.id, {
        title: "We miss you 👀",
        body: "It’s been a while! We'd love to see you again."
      });

      await supabase
        .from("users")
        .update({ received_miss_you: true })
        .eq("id", user.id);
    }
  }
});
