// migrateQnA.js
const questionMap = require("./models/questionMap.js");
console.log("URL?", process.env.SUPABASE_URL);
console.log("KEY?", process.env.SUPABASE_SERVICE_KEY ? "Loaded" : "MISSING");

const { supabase } = require("./db/supabase"); // central client


async function migrate() {
  console.log("🔥 Migration started...");

  for (const [qkey, answers] of Object.entries(questionMap)) {
    // Insert (or fetch) question
    const { data: qRow, error: qErr } = await supabase
      .from("questions")
      .select("*")
      .eq("qkey", qkey)
      .single();

    let questionId;

    if (qRow) {
      questionId = qRow.id;
    } else {
      const { data, error } = await supabase
        .from("questions")
        .insert({ qkey })
        .select()
        .single();

      if (error) {
        console.error("❌ Question insert failed:", qkey, error.message);
        continue;
      }

      questionId = data.id;
    }

    // Insert explanations
    for (const [explanation, verses] of Object.entries(answers)) {
      const { data: exData, error: exErr } = await supabase
        .from("explanations")
        .insert({
          question_id: questionId,
          text: explanation
        })
        .select()
        .single();

      if (exErr) {
        console.error("❌ Explanation insert failed:", explanation, exErr.message);
        continue;
      }

      const explanationId = exData.id;

      // Insert verses
      for (const [ref, verseObj] of Object.entries(verses)) {
        const { error: vErr } = await supabase
          .from("verses")
          .insert({
            explanation_id: explanationId,
            ref,
            text: verseObj.text,
            theme: verseObj.theme,
            tags: verseObj.tags // Supabase supports arrays directly if type is TEXT[]
          });

        if (vErr) {
          console.error("❌ Verse insert failed:", ref, vErr.message);
        }
      }
    }

    console.log(`✔ Finished question: ${qkey}`);
  }

  console.log("🏁 Migration complete!");
}

migrate();
