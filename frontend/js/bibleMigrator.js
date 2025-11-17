import Dexie from "https://cdn.jsdelivr.net/npm/dexie@3.2.5/dist/dexie.mjs";


// setup db
const db = new Dexie("HolyVerseDB");
db.version(3).stores({
  bible: "++id, book, order, chapter, verse",
});

// load Bible JSON into IndexedDB
export async function migrateBible() {
  const res = await fetch("/models/en_kjv.json");
  const bibleData = await res.json();
  let total = 0;
// when looping through bibleData
for (let i = 0; i < bibleData.length; i++) {
  const book = bibleData[i];
  const bookName = book.name;
  const order = i + 1;

  for (let c = 0; c < book.chapters.length; c++) {
    const verses = book.chapters[c].map((text, v) => ({
      book: bookName,
      order,
      chapter: c + 1,
      verse: v + 1,
      text,
    }));
    async function chunkedAdd(list, size = 500) {
  for (let i = 0; i < list.length; i += size) {
    const chunk = list.slice(i, i + size);
    await db.bible.bulkAdd(chunk);
  }
}
    await chunkedAdd(verses);
      total += verses.length;
      if (total % 1000 === 0) console.log("Loaded", total, "verses");
    }
  }
  console.log("✅ Bible fully loaded into IndexedDB:", total);
}

// check if loaded
export async function isBibleLoaded() {
  const count = await db.bible.count();
  return count > 0;
}

export default db;
