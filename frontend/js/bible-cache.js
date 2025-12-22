// bible-cache.js
// Handles per-chapter fetch and caching for Bible versions.
// Uses Dexie (IndexedDB) for web, Capacitor Filesystem for mobile.

// Assumes Dexie is loaded globally as window.Dexie
// Assumes Capacitor Filesystem is available as window.Capacitor?.Plugins?.Filesystem

const BIBLE_CACHE_DB = 'bible_cache';
const BIBLE_CACHE_STORE = 'chapters';
const DEFAULT_VERSION = 'en_kjv';

// Setup Dexie DB
let db;
if (window.Dexie) {
  db = new window.Dexie(BIBLE_CACHE_DB);
  db.version(1).stores({
    chapters: '++id,version,book,chapter',
  });
}

function isMobile() {
  return !!window.Capacitor;
}

async function getCachedChapter(version, book, chapter) {
  if (version === DEFAULT_VERSION) {
    // Always load from bundled JSON for KJV
    return null;
  }
  if (isMobile()) {
    // Capacitor Filesystem
    const path = `bible_cache/${version}/${book}_${chapter}.json`;
    try {
      const result = await window.Capacitor.Plugins.Filesystem.readFile({
        path,
        directory: 'DATA',
      });
      return JSON.parse(result.data);
    } catch (e) {
      return null;
    }
  } else if (db) {
    // Dexie
    return await db.chapters.get({ version, book, chapter });
  }
  return null;
}

async function cacheChapter(version, book, chapter, data) {
  if (version === DEFAULT_VERSION) return; // Don't cache KJV
  if (isMobile()) {
    const path = `bible_cache/${version}/${book}_${chapter}.json`;
    await window.Capacitor.Plugins.Filesystem.writeFile({
      path,
      data: JSON.stringify(data),
      directory: 'DATA',
      recursive: true,
    });
  } else if (db) {
    await db.chapters.put({ version, book, chapter, data });
  }
}

async function fetchChapter(version, book, chapter) {
  // Try cache first (for non-KJV)
  if (version !== DEFAULT_VERSION) {
    const cached = await getCachedChapter(version, book, chapter);
    if (cached) return cached.data || cached;
  }

  // Fetch from server or bundled
  let url;
  if (version === DEFAULT_VERSION) {
    url = '/bible/KING JAMES BIBLE.json';
  } else {
    url = `/bible/${version}.json`;
  }
  const bible = await fetch(url).then(r => r.json());

  // Support both array and object formats
  let chapterData = null;
  if (Array.isArray(bible)) {
    // Array-of-books format (legacy KJV style)
    const meta = bible.find(b => {
      // Defensive: ensure b.name and b.abbrev are strings
      const name = typeof b.name === 'string' ? b.name : '';
      const abbrev = typeof b.abbrev === 'string' ? b.abbrev : '';
      return name.toLowerCase() === String(book).toLowerCase() || abbrev.toLowerCase() === String(book).toLowerCase();
    });
    if (meta && Array.isArray(meta.chapters)) chapterData = meta.chapters[chapter - 1] || null;
  } else if (typeof bible === 'object' && bible !== null) {
    // Object format: { Genesis: { 1: { 1: 'text', ... }, ... }, ... }
    let bookKey = null;
    if (typeof book === 'string') {
      // Try direct match first
      if (bible[book]) {
        bookKey = book;
      } else {
        // Try case-insensitive match
        const foundKey = Object.keys(bible).find(k => typeof k === 'string' && k.toLowerCase() === book.toLowerCase());
        if (foundKey) bookKey = foundKey;
      }
    }
    if (bookKey && bible[bookKey] && bible[bookKey][chapter]) {
      const verses = bible[bookKey][chapter];
      // Convert { '1': 'text', ... } to [ 'text', ... ]
      chapterData = Object.keys(verses).sort((a,b)=>Number(a)-Number(b)).map(v => verses[v]);
    }
  }
  if (chapterData && version !== DEFAULT_VERSION) await cacheChapter(version, book, chapter, chapterData);
  return chapterData;
}

async function clearCache(version) {
  if (isMobile()) {
    // Not implemented: would need to recursively delete directory
    return;
  } else if (db) {
    if (version) {
      await db.chapters.where('version').equals(version).delete();
    } else {
      await db.chapters.clear();
    }
  }
}

async function getCachedChapters(version) {
  if (isMobile()) {
    // Not implemented: would need to list files
    return [];
  } else if (db) {
    return await db.chapters.where('version').equals(version).toArray();
  }
  return [];
}

async function downloadVersionForOffline(version, progressCb) {
  // Download all chapters for a version and cache them
  const url = `/bible/${version}.json`;
  const bible = await fetch(url).then(r => r.json());
  let booksArr;
  if (Array.isArray(bible)) {
    booksArr = bible;
  } else if (typeof bible === 'object' && bible !== null) {
    booksArr = Object.keys(bible).map(name => ({
      name,
      abbrev: name,
      chapters: Object.keys(bible[name]).map(chNum => {
        const verses = bible[name][chNum];
        if (typeof verses !== 'object' || verses === null) return [];
        return Object.keys(verses).sort((a,b)=>Number(a)-Number(b)).map(v => verses[v]);
      })
    }));
  } else {
    booksArr = [];
  }
  let total = 0, done = 0;
  booksArr.forEach(b => total += b.chapters.length);
  for (const book of booksArr) {
    for (let i = 0; i < book.chapters.length; ++i) {
      await cacheChapter(version, book.abbrev, i + 1, book.chapters[i]);
      done++;
      if (progressCb) progressCb(done, total);
    }
  }
}

window.BibleCache = {
  fetchChapter,
  getCachedChapter,
  cacheChapter,
  clearCache,
  getCachedChapters,
  downloadVersionForOffline,
};
