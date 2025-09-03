// migrateQnA.js
const sqlite3 = require("sqlite3").verbose();
const questionMap = require("./models/questionMap.js"); // your big object

// open db (or create if not exists)
const db = new sqlite3.Database("./randomverse.db");

db.serialize(() => {
  // create tables
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    qkey TEXT UNIQUE,
    title TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS explanations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    text TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(id)
  )`);

  


  db.run(`CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    explanation_id INTEGER,
    ref TEXT,
    text TEXT,
    theme TEXT,
    tags TEXT,
    FOREIGN KEY (explanation_id) REFERENCES explanations(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bible (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  text TEXT
  )`);


  // insert everything
  for (const [qkey, answers] of Object.entries(questionMap)) {
    db.run(`INSERT OR IGNORE INTO questions (qkey) VALUES (?)`, [qkey], function(err) {
  if (err) return console.error(err);

  const insertId = this.lastID;
  if (insertId) {
    handleExplanations(insertId);
  } else {
    db.get("SELECT id FROM questions WHERE qkey = ?", [qkey], (err, row) => {
      if (err) return console.error(err);
      handleExplanations(row.id);
    });
  }

  function handleExplanations(questionId) {
    for (const [explanation, verses] of Object.entries(answers)) {
      db.run(`INSERT INTO explanations (question_id, text) VALUES (?, ?)`,
        [questionId, explanation],
        function(err) {
          if (err) return console.error(err);

          const explanationId = this.lastID;
          for (const [ref, verseObj] of Object.entries(verses)) {
            db.run(
              `INSERT INTO verses (explanation_id, ref, text, theme, tags) VALUES (?, ?, ?, ?, ?)`,
              [explanationId, ref, verseObj.text, verseObj.theme, JSON.stringify(verseObj.tags)]
            );
          }
        }
      );
    }
  }
});
}
});


// hapa sielewi shiet
//only close when all queries finish
db.on("trace", (sql) => 
console.log("SQL:", sql));
db.on("profile", () => {});
process.on("beforeExit", () => 
db.close());
