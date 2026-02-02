// bible-cache.js
// Handles per-chapter fetch and caching for Bible versions.
// Uses Dexie (IndexedDB) for web, Capacitor Filesystem for mobile.

// Assumes Dexie is loaded globally as window.Dexie
// Assumes Capacitor Filesystem is available as window.Capacitor?.Plugins?.Filesystem

const BIBLE_CACHE_DB = 'bible_cache';
const BIBLE_CACHE_STORE = 'chapters';
const DEFAULT_VERSION = 'en_kjv';
window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? ""
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;

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

function normalizeVersion(version) {
  // Lowercase + remove non-alphanum for safer key matching
  return String(version).toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchChapter(version, book, chapter) {
  const normVersion = normalizeVersion(version);
  const normBook = String(book).toLowerCase();

  // Try cache first (except KJV)
  if (version !== DEFAULT_VERSION) {
    let cached = null;

    if (isMobile()) {
      const path = `bible_cache/${normVersion}/${normBook}_${chapter}.json`;
      try {
        const result = await window.Capacitor.Plugins.Filesystem.readFile({
          path,
          directory: 'DATA',
        });
        cached = JSON.parse(result.data);
      } catch (e) {
        cached = null;
      }
    } else if (db) {
      // Match cached version ignoring case
      const allCached = await db.chapters.where('version').equalsIgnoreCase(normVersion).toArray();
      cached = allCached.find(c => String(c.book).toLowerCase() === normBook && Number(c.chapter) === Number(chapter));
      if (cached) cached = cached.data || cached;
    }

    if (cached) return cached;
  }

  // Network fetch
  let url;
  if (version === DEFAULT_VERSION) {
    url = '/bible/KING JAMES BIBLE.json';
  } else {
    url = `${API_BASE}/bible/${version}.json`;
  }

  const bible = await fetch(url).then(r => r.json());

  // Support both array and object formats
  let chapterData = null;

  if (Array.isArray(bible)) {
    // Array-of-books format (legacy KJV style)
    const meta = bible.find(b => {
      const name = typeof b.name === 'string' ? b.name.toLowerCase() : '';
      const abbrev = typeof b.abbrev === 'string' ? b.abbrev.toLowerCase() : '';
      return name === normBook || abbrev === normBook;
    });
    if (meta && Array.isArray(meta.chapters)) chapterData = meta.chapters[chapter - 1] || null;
  } else if (typeof bible === 'object' && bible !== null) {
    const foundKey = Object.keys(bible).find(k => typeof k === 'string' && k.toLowerCase() === normBook);
    if (foundKey && bible[foundKey][chapter]) {
      const verses = bible[foundKey][chapter];
      chapterData = Object.keys(verses).sort((a,b)=>Number(a)-Number(b)).map(v => verses[v]);
    }
  }

  // Cache fetched chapter
  if (chapterData && version !== DEFAULT_VERSION) {
    const cacheKeyVersion = normVersion; // normalized
    const cacheKeyBook = normBook;
    await cacheChapter(cacheKeyVersion, cacheKeyBook, chapter, chapterData);
  }

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
  const url = `${API_BASE}/bible/${version}.json`;
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
