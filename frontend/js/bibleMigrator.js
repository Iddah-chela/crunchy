import Dexie from "https://cdn.jsdelivr.net/npm/dexie@3.2.5/dist/dexie.mjs";
const API_BASE = window.location.hostname === "localhost"
  ? ""
  : "https://holyverse-s5s1.onrender.com";

// setup db with VERSION COLUMN
const db = new Dexie("HolyVerseDB");
db.version(4).stores({
  bible: "++id, version, book, order, chapter, verse",
});
const MIGRATION_KEY = "bible_migration_status";

export async function clearBibleDB() {
  await db.bible.clear();
}


// reuse-able chunker
async function chunkedAdd(list, size = 500) {
  for (let i = 0; i < list.length; i += size) {
    const chunk = list.slice(i, i + size);
    await db.bible.bulkAdd(chunk);
  }
}

// show/hide modal
function showLoadingModal() {
  const modal = document.getElementById("loadingBibleModal");
  if(modal){
    modal.style.display = "flex";
    document.body.classList.add("modal-active"); // block scroll
  }
}

function hideLoadingModal() {
  const modal = document.getElementById("loadingBibleModal");
  if(modal){
    modal.style.display = "none";
    document.body.classList.remove("modal-active");
  }
}

// MIGRATE KJV (single file)
async function loadKJV() {
  const res = await fetch(`${API_BASE}/models/en_kjv.json`);
  const bibleData = await res.json();
  let total = 0;

  for (let i = 0; i < bibleData.length; i++) {
    const book = bibleData[i];
    const bookName = book.name;
    const order = i + 1;

    for (let c = 0; c < book.chapters.length; c++) {
      const verses = book.chapters[c].map((text, v) => ({
        version: "KJV",
        book: bookName,
        order,
        chapter: c + 1,
        verse: v + 1,
        text,
      }));

      await chunkedAdd(verses);
      total += verses.length;
    }
  }

  console.log("📖 KJV loaded:", total, "verses");
}

// MIGRATE NIV (multiple json files)
async function loadNIV() {
  // you fill this list manually
  const NIV_BOOKS = [
  "Genesis.json",
  "Exodus.json",
  "Leviticus.json",
  "Numbers.json",
  "Deuteronomy.json",
  "Joshua.json",
  "Judges.json",
  "Ruth.json",
  "1 Samuel.json",
  "2 Samuel.json",
  "1 Kings.json",
  "2 Kings.json",
  "1 Chronicles.json",
  "2 Chronicles.json",
  "Ezra.json",
  "Nehemiah.json",
  "Esther.json",
  "Job.json",
  "Psalms.json",
  "Proverbs.json",
  "Ecclesiastes.json",
  "Song Of Solomon.json",
  "Isaiah.json",
  "Jeremiah.json",
  "Lamentations.json",
  "Ezekiel.json",
  "Daniel.json",
  "Hosea.json",
  "Joel.json",
  "Amos.json",
  "Obadiah.json",
  "Jonah.json",
  "Micah.json",
  "Nahum.json",
  "Habakkuk.json",
  "Zephaniah.json",
  "Haggai.json",
  "Zechariah.json",
  "Malachi.json",
  "Matthew.json",
  "Mark.json",
  "Luke.json",
  "John.json",
  "Acts.json",
  "Romans.json",
  "1 Corinthians.json",
  "2 Corinthians.json",
  "Galatians.json",
  "Ephesians.json",
  "Philippians.json",
  "Colossians.json",
  "1 Thessalonians.json",
  "2 Thessalonians.json",
  "1 Timothy.json",
  "2 Timothy.json",
  "Titus.json",
  "Philemon.json",
  "Hebrews.json",
  "James.json",
  "1 Peter.json",
  "2 Peter.json",
  "1 John.json",
  "2 John.json",
  "3 John.json",
  "Jude.json",
  "Revelation.json"
];


  let total = 0;

  for (let i = 0; i < NIV_BOOKS.length; i++) {
    const filename = NIV_BOOKS[i];
    const res = await fetch(`${API_BASE}/models/niv-maina/${filename}`);
    const bookData = await res.json();

    const bookName = bookData.book;
    const order = i + 1;

    for (let c = 0; c < bookData.chapters.length; c++) {
      const chapterObj = bookData.chapters[c];

      const verses = chapterObj.verses.map(v => ({
        version: "NIV",
        book: bookName,
        order,
        chapter: Number(chapterObj.chapter),
        verse: Number(v.verse),
        text: v.text
      }));

      await chunkedAdd(verses);
      total += verses.length;
    }
  }

  console.log("📖 NIV loaded:", total, "verses");
}

// MAIN migration router
export async function migrateBible() {
  localStorage.setItem(MIGRATION_KEY, "loading");
  showLoadingModal();

  try {
    console.log("🕊️ Starting Bible migration…");
    await loadKJV();
    await loadNIV();

    console.log("✅ All Bibles loaded.");
    localStorage.setItem(MIGRATION_KEY, "done");

  } catch (err) {
    console.error("Migration failed:", err);
    localStorage.removeItem(MIGRATION_KEY); // make sure it retries next launch
    throw err;

  } finally {
    hideLoadingModal();
  }
}


export async function isBibleLoaded() {
  const count = await db.bible.count();
  return count > 0;
}

export default db;
