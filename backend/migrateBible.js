const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const biblePath = path.join(__dirname, "models", "en_kjv.json");
const bibleData = JSON.parse(fs.readFileSync(biblePath, "utf8"));

const db = new sqlite3.Database("./randomverse.db");

db.serialize(() => {
    
  const stmt = db.prepare(
    `INSERT INTO bible (book, chapter, verse, text) VALUES (?, ?, ?, ?)`
  );

  let totalInserted = 0;

  for (const bookObj of bibleData) {
    const bookName = bookObj.name || "Unknown";
    const chapters = bookObj.chapters || [];

    chapters.forEach((chapter, chapterIndex) => {
      if (!Array.isArray(chapter)) return; // skip broken stuff

      chapter.forEach((verseText, verseIndex) => {
        stmt.run(
          bookName,
          chapterIndex + 1, // chapters start at 1
          verseIndex + 1,   // verses start at 1
          verseText,
          err => {
            if (err) console.error("Error inserting:", err.message);
            else totalInserted++;
          }
        );
      });
    });
  }

  stmt.finalize(err => {
    if (err) console.error("Finalize error:", err.message);
    console.log(`✅ Inserted ${totalInserted} verses into Bible table.`);
    db.close();
  });
});
