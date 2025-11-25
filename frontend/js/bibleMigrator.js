// --- GLOBAL BIBLE MEMORY ---
window.BIBLE = {
  KJV: {},
  NIV: {}
};

window.BIBLE_BOOKS = [];
const CANONICAL_ORDER = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song Of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
  "Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation"
];

// --- FETCH KJV (single JSON) ---
async function loadKJV() {
  const res = await fetch("/bible/en_kjv.json");
  const data = await res.json();

  for (let i = 0; i < data.length; i++) {
    const book = data[i];
    const name = book.name;

    window.BIBLE.KJV[name] = {};

    for (let c = 0; c < book.chapters.length; c++) {
      const versesArray = book.chapters[c]; // array of verse strings
      window.BIBLE.KJV[name][c + 1] = versesArray.map((text, index) => ({
        version: "KJV",
        book: name,
        order: CANONICAL_ORDER.indexOf(name) + 1,
        chapter: c + 1,
        verse: index + 1,
        text
      }));
    }
  }

  console.log("KJV loaded into memory");
}

// --- FETCH NIV (66 JSON files) ---
async function loadNIV() {
  const BOOK_FILES = CANONICAL_ORDER.map(name => `${name}.json`);

  for (const file of BOOK_FILES) {
    const res = await fetch(`/bible/Bible-niv-main/${file}`);
    const bookData = await res.json();

    const name = bookData.book;
    window.BIBLE.NIV[name] = {};

    for (const c of bookData.chapters) {
      const chapterNum = Number(c.chapter);
      window.BIBLE.NIV[name][chapterNum] = c.verses.map(v => ({
        version: "NIV",
        book: name,
        order: CANONICAL_ORDER.indexOf(name) + 1,
        chapter: chapterNum,
        verse: Number(v.verse),
        text: v.text
      }));
    }
  }

  console.log("NIV loaded into memory");
}

// --- MAIN LOADER ---
export async function initBibleMemory() {
  console.log("📚 Loading Bible from frontend JSON…");

  await loadKJV();
  await loadNIV();

  // Build books list in canonical order
  window.BIBLE_BOOKS = CANONICAL_ORDER.filter(name => window.BIBLE.KJV[name] || window.BIBLE.NIV[name]);

  console.log("📚 Bible fully ready.");
}
