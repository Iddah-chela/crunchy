// 1) make the global container empty
window.BIBLE = {}; // will hold versions keyed by friendly name (filename without .json)
window.BIBLE_BOOKS = [];
let currentVersion = "AMERICAN STANDARD VERSION";

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

// helper - convert "NEW AMERICAN BIBLE.json" -> "NEW AMERICAN BIBLE"
function baseName(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}


// helper - normalize many possible file shapes into your in-memory structure
// REPLACE the old normalizeAndStore with this one
function normalizeAndStore(versionKey, rawData) {
  // ensure version slot
  window.BIBLE[versionKey] = window.BIBLE[versionKey] || {};

  // If rawData is an array-like or numeric-key object (0,1,2...), map numeric indices to CANONICAL_ORDER
  const topKeys = Object.keys(rawData || {});
  const looksNumericTopLevel = topKeys.length > 0 && topKeys.every(k => !isNaN(k));

  if (looksNumericTopLevel) {
    // numeric-indexed file (e.g., KJV split into array/object indexed by 0..65)
    topKeys.sort((a, b) => Number(a) - Number(b)).forEach((numKey, idx) => {
      const bookName = CANONICAL_ORDER[idx];
      if (!bookName) return; // defensive
      const book = rawData[numKey];
      if (book == null) return;
      // normalize that single book into the same internal shape
      window.BIBLE[versionKey][bookName] = window.BIBLE[versionKey][bookName] || {};
      // If the book uses `chapters` array (KJV single-file style inside each book), handle it
      if (Array.isArray(book.chapters)) {
        for (let c = 0; c < book.chapters.length; c++) {
          const versesArray = book.chapters[c] || [];
          window.BIBLE[versionKey][bookName][c + 1] = (versesArray || []).map((v, idxV) => {
            const text = (typeof v === "string") ? v : (v && v.text) || "";
            const verseNum = (v && v.verse) ? Number(v.verse) : idxV + 1;
            return {
              version: versionKey,
              book: bookName,
              order: CANONICAL_ORDER.indexOf(bookName) + 1,
              chapter: c + 1,
              verse: verseNum,
              text
            };
          });
        }
      } else {
        // assume book is { "1": { "1": "text", "2": "..." }, "2": {...} }
        const chapterKeys = Object.keys(book).filter(k => !isNaN(k));
        for (const chapterKey of chapterKeys) {
          const chapter = book[chapterKey];
          const verseKeys = Object.keys(chapter || {}).sort((a,b)=>Number(a)-Number(b));
          const versesArr = verseKeys.map(vk => ({
            version: versionKey,
            book: bookName,
            order: CANONICAL_ORDER.indexOf(bookName) + 1,
            chapter: Number(chapterKey),
            verse: Number(vk),
            text: chapter[vk]
          }));
          window.BIBLE[versionKey][bookName][Number(chapterKey)] = versesArr;
        }
      }
    });
    return; // done
  }

  // FALLBACK: top-level keys are book names (e.g., "Genesis": {...})
  for (const bookName of Object.keys(rawData || {})) {
    const book = rawData[bookName];
    if (!book || bookName.toLowerCase() === "meta") continue;
    window.BIBLE[versionKey][bookName] = window.BIBLE[versionKey][bookName] || {};

    // Handle book.chapters (array-of-chapters) style
    if (Array.isArray(book.chapters)) {
      for (let c = 0; c < book.chapters.length; c++) {
        const versesArray = book.chapters[c] || [];
        window.BIBLE[versionKey][bookName][c + 1] = (versesArray || []).map((v, idxV) => {
          const text = (typeof v === "string") ? v : (v && v.text) || "";
          const verseNum = (v && v.verse) ? Number(v.verse) : idxV + 1;
          return {
            version: versionKey,
            book: bookName,
            order: CANONICAL_ORDER.indexOf(bookName) + 1,
            chapter: c + 1,
            verse: verseNum,
            text
          };
        });
      }
      continue;
    }

    // Otherwise expect chapter keyed objects { "1": { "1": "text" } }
    const chapterKeys = Object.keys(book).filter(k => !isNaN(k));
    for (const chapterKey of chapterKeys) {
      const chapter = book[chapterKey];
      const verseKeys = Object.keys(chapter || {}).sort((a,b)=>Number(a)-Number(b));
      const versesArr = verseKeys.map(vk => ({
        version: versionKey,
        book: bookName,
        order: CANONICAL_ORDER.indexOf(bookName) + 1,
        chapter: Number(chapterKey),
        verse: Number(vk),
        text: chapter[vk]
      }));
      window.BIBLE[versionKey][bookName][Number(chapterKey)] = versesArr;
    }
  }
}


// 2) supply a manifest file on the server: /bible/versions.json
// content example: ["KJV.json","NEW AMERICAN BIBLE.json","NEW INTERNATIONAL VERSION.json", ...]
// fallback: if you don't want a manifest, hardcode VERSION_FILES below.
// === manifest / fallback tweaks ===
// If you have a manifest file on the server, set it here (recommended).
// If you don't, set this to null and rely on FALLBACK_VERSION_FILES.
const VERSIONS_MANIFEST_URL = null; // set to '/bible/versions.json' if you add a manifest file

// Make sure fallback entries are the actual filenames in /bible (with .json)
const FALLBACK_VERSION_FILES = [
  "en_kjv.json",                      // if that’s exactly what’s in your folder
  "AMERICAN STANDARD VERSION.json",
  "Amplified Bible.json",
  "Anderson New Testament.json",
  "Aramaic Bible in Plain English.json",
  "Berean Literal Bible.json",
  "BEREAN STANDARD BIBLE.json",
  "BRENTON SEPTUAGINT TRANSLATION",
  "CATHOLIC PUBLIC DOMAIN VERSION",
  "CHRISTIAN STANDARD BIBLE",
  "CONTEMPORARY ENGLISH VERSION",
  "DOUAY-RHEIMS BIBLE",
  "ENGLISH REVISED VERSION",
  "ENGLISH STANDARD VERSION",
  "GODBEY NEW TESTAMENT",
  "GOD'S WORD® TRANSLATION",
  "GOOD NEWS TRANSLATION",
  "HAWEIS NEW TESTAMENT",
  "HOLMAN CHRISTIAN STANDARD BIBLE",
  "INTERNATIONAL STANDARD VERSION",
  "JPS TANAKH 1917",
  "KING JAMES BIBLE",
  "LAMSA BIBLE",
  "LEGACY STANDARD VERSION",
  "MACE NEW TESTAMENT",
  "MAJORITY STANDARD BIBLE",
  "NASB 1977",
  "NASB 1995",
  "NET BIBLE",
  "NEW AMERICAN BIBLE",
  "NEW AMERICAN STANDARD BIBLE",
  "NEW HEART ENGLISH BIBLE",
  "NEW INTERNATIONAL VERSION",
  "NEW KING JAMES VERSION",
  "NEW LIVING TRANSLATION",
  "NEW REVISED STANDARD VERSION",
  "PESHITTA HOLY BIBLE TRANSLATED",
  "SMITH'S LITERAL TRANSLATION",
  "WEBSTER'S BIBLE TRANSLATION",
  "WEYMOUTH NEW TESTAMENT",
  "WORLD ENGLISH BIBLE",
  "WORRELL NEW TESTAMENT",
  "WORSLEY NEW TESTAMENT",
  "YOUNG'S LITERAL TRANSLATION"
  // … rest: exact filenames
];


async function seedVersionList() {
  let files = null;

  // try manifest only if URL is truthy
  if (VERSIONS_MANIFEST_URL) {
    try {
      const r = await fetch(VERSIONS_MANIFEST_URL);
      files = await r.json();
    } catch (err) {
      console.warn("Could not fetch manifest, falling back to hardcoded list:", err);
      files = null;
    }
  }

  if (!files) {
    files = FALLBACK_VERSION_FILES;
  }

  // create safe keys and store path helpers
   // create safe keys and store path helpers
  for (const f of files) {
    const filename = String(f);                 // exact filename in /bible (keep capitals/spaces)
    const key = baseName(filename);             // e.g. "New American Bible" or "en_kjv"
    const friendlyKey = key.replace(/_/g, " ").toUpperCase(); // "NEW AMERICAN BIBLE" or "EN KJV"

    // ensure we set the friendlyKey (was the buggy line before)
    window.BIBLE[friendlyKey] = window.BIBLE[friendlyKey] || null; // null => not loaded yet

    // path must use the real filename (with its case/spaces)
    const path = filename.endsWith(".json") ? `/bible/${filename}` : `/bible/${filename}.json`;
    window.BIBLE[friendlyKey + "___path"] = path;
  }


  // keep canonical order list ready
  window.BIBLE_BOOKS = CANONICAL_ORDER.slice();
}


// lazy loader for a single version (called when user selects it)
export async function loadVersionIfNeeded(versionKey) {
  if (window.BIBLE[versionKey] && window.BIBLE[versionKey] !== null) return; // already loaded
  const path = window.BIBLE[versionKey + "___path"];
  if (!path) throw new Error("No path found for version " + versionKey);
  const res = await fetch(path);
  const data = await res.json();
  normalizeAndStore(versionKey, data);
  // remove path helper
  delete window.BIBLE[versionKey + "___path"];
}

function toSnakeName(friendlyKey) {
  // "EN KJV" -> "En KJV", "NEW INTERNATIONAL VERSION" -> "New International Version"
  return friendlyKey
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function populateVersionSelect() {
  versionSelect.innerHTML = Object.keys(window.BIBLE)
    .filter(k => !k.endsWith("___path"))
    .map(v => `<option value="${v}">${toSnakeName(v)}</option>`)
    .join('');
}


// 3) init flow
export async function initBibleMemory() {
  console.log("📚 seeding version list...");
  await seedVersionList();
  populateVersionSelect();

  // set default version
  const savedVersion = localStorage.getItem("bibleVersion");
  if (savedVersion && window.BIBLE[savedVersion] !== undefined) {
    currentVersion = savedVersion;
    window.currentVersion = savedVersion;
    versionSelect.value = savedVersion;
    // optionally pre-load the saved version immediately:
    await loadVersionIfNeeded(savedVersion);
  } else {
    // pick first available key
    const first = Object.keys(window.BIBLE).find(k => !k.endsWith("___path"));
    currentVersion = first;
    window.currentVersion = first;
    versionSelect.value = first;
    await loadVersionIfNeeded(first);
  }

  // update book list (use canonical order)
  window.BIBLE_BOOKS = CANONICAL_ORDER.filter(name =>
    Object.keys(window.BIBLE).some(v => window.BIBLE[v] && window.BIBLE[v][name])
  );

  console.log("📚 Bible memory ready (lazy mode).");
}
