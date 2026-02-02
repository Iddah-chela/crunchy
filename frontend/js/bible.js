
// top-of-file globals
let bibleBooks = [];            // array of book names (strings) from server
let currentBookName = null;     // e.g. "Genesis"
let currentChapters = [];       // array of chapter numbers for current book
let currentChapterIdx = 0;      // zero-based index of current chapter
let showNotes = false;
let bibleData = [];
let currentVersion = "AMERICAN STANDARD VERSION";

window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? ""
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;

function recordBibleProgress(bookName, chapterNum) {
  // Keep a per-book list of read chapters
  const chaptersRead = JSON.parse(localStorage.getItem("chaptersRead")) || {};
  const chapterList = Array.isArray(chaptersRead[bookName]) ? chaptersRead[bookName] : [];
  if (!chapterList.includes(chapterNum)) {
    chapterList.push(chapterNum);
    chaptersRead[bookName] = chapterList;
    localStorage.setItem("chaptersRead", JSON.stringify(chaptersRead));
    console.log(`📖 Progress: Read ${bookName} chapter ${chapterNum}`);
  }

  const booksReadCount = Object.keys(chaptersRead).length;
  const chaptersReadCount = Object.values(chaptersRead).reduce((sum, arr) => {
    if (Array.isArray(arr)) return sum + arr.length;
    return sum;
  }, 0);

  localStorage.setItem("books_read_count", booksReadCount);
  localStorage.setItem("chapters_read_count", chaptersReadCount);
  console.log(`📖 Total progress: ${booksReadCount} books, ${chaptersReadCount} chapters`);
}


// BibleCache removed: all versions are now loaded directly from /bible/
// Bible version keys: en_kjv (default), others match filenames in /bible
const DEFAULT_VERSION = 'KING JAMES BIBLE';
let availableVersions = [DEFAULT_VERSION];

// Load available versions from /bible folder (except KJV)
async function fetchAvailableVersions() {
  // Hardcoded for now; could be fetched from server or manifest
  availableVersions = [DEFAULT_VERSION,
    'AMERICAN STANDARD VERSION', 'AMPLIFIED BIBLE', 'ANDERSON NEW TESTAMENT', 'ARAMAIC BIBLE IN PLAIN ENGLISH',
    'BEREAN LITERAL BIBLE', 'BEREAN STANDARD BIBLE', 'BRENTON SEPTUAGINT TRANSLATION', 'CATHOLIC PUBLIC DOMAIN VERSION',
    'CHRISTIAN STANDARD BIBLE', 'CONTEMPORARY ENGLISH VERSION', 'DOUAY-RHEIMS BIBLE', 'ENGLISH REVISED VERSION',
    'ENGLISH STANDARD VERSION', "GOD'S WORD® TRANSLATION", 'GODBEY NEW TESTAMENT', 'GOOD NEWS TRANSLATION',
    'HAWEIS NEW TESTAMENT', 'HOLMAN CHRISTIAN STANDARD BIBLE', 'INTERNATIONAL STANDARD VERSION', 'JPS TANAKH 1917',
    'LAMSA BIBLE', 'LEGACY STANDARD BIBLE', 'LITERAL STANDARD VERSION', 'MACE NEW TESTAMENT', 'MAJORITY STANDARD BIBLE',
    'NASB 1977', 'NASB 1995', 'NET BIBLE', 'NEW AMERICAN BIBLE', 'NEW AMERICAN STANDARD BIBLE', 'NEW HEART ENGLISH BIBLE',
    'NEW INTERNATIONAL VERSION', 'NEW KING JAMES VERSION', 'NEW LIVING TRANSLATION', 'NEW REVISED STANDARD VERSION',
    'PESHITTA HOLY BIBLE TRANSLATED', "SMITH'S LITERAL TRANSLATION"
  ];
}

// Load book list from KJV (bundled)
async function loadKJVBookList() {
  const kjv = await fetch('/bible/KING JAMES BIBLE.json').then(r => r.json());
  let booksArr;
  if (Array.isArray(kjv)) {
    booksArr = kjv;
  } else if (typeof kjv === 'object' && kjv !== null) {
    // Convert object format to array
    booksArr = Object.keys(kjv).map(name => ({
      name,
      abbrev: name,
      chapters: Object.keys(kjv[name]).map(chNum => {
        // Each chapter is an object: { '1': 'text', ... }
        const verses = kjv[name][chNum];
        // Defensive: skip if not an object
        if (typeof verses !== 'object' || verses === null) return [];
        return Object.keys(verses).sort((a,b)=>Number(a)-Number(b)).map(v => verses[v]);
      })
    }));
  } else {
    booksArr = [];
  }
  bibleBooks = booksArr.map(b => b.name);
  bibleData = booksArr;
}

// Main init

// Helper: restore last read state if available
async function restoreLastReadState() {
  const lastBook = localStorage.getItem("lastBook");
  const lastChapter = localStorage.getItem("lastChapter");
  if (lastBook && lastChapter !== null && bibleBooks.includes(lastBook)) {
    await renderChapters(lastBook);
    await renderVerses(lastBook, parseInt(lastChapter));
    return true;
  }
  return false;
}

(async function initBibleApp() {
  // BibleCache removed
  await fetchAvailableVersions();
  await loadKJVBookList();
  // Populate version select
  versionSelect.innerHTML = availableVersions.map(v => `<option value="${v}">${v}</option>`).join('');
  const savedVersion = localStorage.getItem('bibleVersion') || DEFAULT_VERSION;
  currentVersion = savedVersion;
  versionSelect.value = savedVersion;
  // Try to restore last read state, else show book list
  if (!(await restoreLastReadState())) {
    renderBookList('ot');
  }
})();


function showModal(message) {
  const modal = document.getElementById("appModal");
  const msg = document.getElementById("modalMessage");
  const closeBtn = document.getElementById("modalClose");

  msg.textContent = message;
  modal.style.display = "flex";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

// wire-up versionSelect to lazy-load on change
const versionSelect = document.getElementById("versionSelect");


versionSelect.addEventListener("change", async (e) => {
  const selected = e.target.value;
  localStorage.setItem("bibleVersion", selected);
  currentVersion = selected;
  renderVerses(currentBookName, currentChapterIdx);
});




// Extract notes vs grammar
function splitVerse(text) {
  const notes = [];
  let cleaned = text.replace(/\{(.*?)\}/g, (match, inner) => {
    const content = inner.trim();

    // Heuristics:
    // - If it starts with Heb./Or/Margin/Gr. OR contains a colon → it's a note
    // - If it's just short (like "is", "and", "are") → grammar
    if (/^(heb\.|or|margin|gr\.)/i.test(content) || content.includes(":")) {
      notes.push(content);
      return ""; // remove note from verse text
    } else {
      return content; // grammar word stays in verse
    }
  });
  return { cleaned: cleaned.trim(), notes };
}

function enterBibleReading() {
  document.body.classList.add("paused");   // pause animations
  const music = document.getElementById("bg-music");
  if (music && !music.paused) music.pause(); // stop bg music
}

function exitBibleReading() {
  document.body.classList.remove("paused"); // resume animations
  // const music = document.getElementById("bg-music");
  // if (music) music.play(); // resume bg music
}


// Utility: clean braces
function cleanVerse(text) {
  return text.replace(/\{.*?\}/g, "");
}

/* ---------- Utility: set main heading ---------- */
function setMainHeading(text) {
  const headingEl = document.querySelector(".heading");
  if (headingEl) headingEl.textContent = text;
}






// handle deep link or last read (called after books are loaded)
async function handleDeepLinkOrLastRead() {
  const params = new URLSearchParams(window.location.search);
  const refParam = params.get("ref");
  if (refParam) {
    const refMatch = refParam.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (refMatch) {
      const [, rawBook, chapterStr, verseStr] = refMatch;
      const chapterIdx = parseInt(chapterStr, 10) - 1;
      const wanted = normalizeName(rawBook);

      // find best matching book name from bibleBooks
      let matchedName = bibleBooks.find(b => normalizeName(b) === wanted);
      if (!matchedName) {
        matchedName = bibleBooks.find(b => normalizeName(b).startsWith(wanted) || wanted.startsWith(normalizeName(b)));
      }

      if (matchedName) {
        await renderChapters(matchedName);
        await renderVerses(matchedName, chapterIdx);
        // scroll to verse after render
        const ref = `${matchedName} ${chapterStr}:${verseStr}`;
        const expectedId = ref.replace(/\s+/g, "_").replace(":", "_");
        waitForElementAndHighlight(expectedId);
        return;
      }
    }
  }

  // fallback: last read
  const lastBook = localStorage.getItem("lastBook");
  const lastChapter = localStorage.getItem("lastChapter");
  if (lastBook && lastChapter !== null) {
    // if lastBook exists on server
    if (bibleBooks.includes(lastBook)) {
      await renderChapters(lastBook);
      await renderVerses(lastBook, parseInt(lastChapter));
      return;
    }
  }

  // default
  renderBookList("ot");
}

// small helper used above
function normalizeName(s) {
  return String(s || "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function waitForElementAndHighlight(id, timeout = 5000, interval = 60) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("jump-highlight");
        setTimeout(() => el.classList.remove("jump-highlight"), 2200);
        return resolve(el);
      }
      if (Date.now() - start > timeout) return reject(new Error("Timeout waiting for " + id));
      setTimeout(check, interval);
    };
    check();
  }).catch(e => console.warn(e));
}

// -------------------- Render Book List --------------------
function renderBookList(testament) {
  hideAll();
  setMainHeading("📖 Bible");
  const bookList = document.getElementById("book-list");
  bookList.style.display = "block";
  bookList.innerHTML = "";

  // bibleBooks is an array of strings; split first 39 as OT
  const books = testament === "ot" ? bibleBooks.slice(0, 39) : bibleBooks.slice(39);

  books.forEach((bookName) => {
    const btn = document.createElement("button");
    btn.className = "category-btn category-block";
    btn.textContent = bookName;
    btn.onclick = () => renderChapters(bookName);
    bookList.appendChild(btn);
  });

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "link-btn innerbtn";
  toggleBtn.textContent = testament === "ot" ? "Go to NT ➡️" : "⬅️ Back to OT";
  toggleBtn.onclick = () => renderBookList(testament === "ot" ? "nt" : "ot");
  bookList.appendChild(toggleBtn);
}

// -------------------- Render Chapters (by book name) --------------------
async function renderChapters(bookName) {
  hideAll();
  // Defensive: if bookName is an object, extract .name
  if (typeof bookName === 'object' && bookName !== null) bookName = bookName.name || String(bookName);
  currentBookName = bookName;
  setMainHeading(`📖 ${bookName}`);
  const chapterList = document.getElementById("chapter-list");
  chapterList.style.display = "block";
  chapterList.innerHTML = "";

  // Back to books
    const backBtn = document.createElement("button");
    backBtn.className = "innerbtn";
    backBtn.id = "backBtnb";
    backBtn.textContent = "⬅ Back";
    backBtn.onclick = () => {
      exitBibleReading();
      renderBookList(bibleBooks.indexOf(bookName) < 39 ? "ot" : "nt");
    };
    chapterList.appendChild(backBtn);

  try {
    // For all versions, load the book file directly
    let chapters = [];
    let book = null;
    let versionFile = currentVersion + '.json';
    if (currentVersion === DEFAULT_VERSION) versionFile = 'KING JAMES BIBLE.json';
    const bible = await fetch(`/bible/${versionFile}`).then(r => r.json());
    if (Array.isArray(bible)) {
      book = bible.find(b => b.name === bookName || b.abbrev === bookName);
      if (!book) {
        showModal("This book is not available in this version.");
        return;
      }
      chapters = book.chapters.map((_, idx) => idx + 1);
    } else if (typeof bible === 'object' && bible !== null) {
      // Object format: { Genesis: { 1: { 1: 'text', ... }, ... }, ... }
      if (bible[bookName]) {
        chapters = Object.keys(bible[bookName]).map(Number).sort((a,b)=>a-b);
      } else {
        showModal("This book is not available in this version.");
        return;
      }
    }
    currentChapters = chapters;
    chapters.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "innerbtn";
      btn.textContent = ch;
      btn.onclick = () => renderVerses(bookName, ch - 1);
      chapterList.appendChild(btn);
    });
  } catch (err) {
    console.error("Could not load chapters:", err);
    showModal("Failed to load chapters.");
  }
}


// -------------------- Render Verses (fetch from API) --------------------
async function renderVerses(bookName, chapterIdx) {
  hideAll();
  enterBibleReading();
  // Defensive: if bookName is an object, extract .name
  if (typeof bookName === 'object' && bookName !== null) bookName = bookName.name || String(bookName);
  currentBookName = bookName;
  currentChapterIdx = chapterIdx;

  // --- Add swipe to next/prev chapter ---
let startX = 0;

document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;

  if (diff > 100 && chapterIdx > 0) {
    // swipe right → previous chapter
    renderVerses(bookName, chapterIdx - 1);
    window.scrollTo(0, 0);
  } else if (diff < -100 && chapterIdx < currentChapters.length - 1) {
    // swipe left → next chapter
    renderVerses(bookName, chapterIdx + 1);
    window.scrollTo(0, 0);
  }
}, { passive: true });


  const chapterNum = chapterIdx + 1;
  setMainHeading(`📖 ${bookName} ${chapterNum}`);
  const verseList = document.getElementById("verse-list");
  verseList.style.display = "block";
  verseList.innerHTML = "";

  const notesCollected = [];

  // Back to chapters
  const backBtn = document.createElement("button");
  backBtn.className = "innerbtn";
  backBtn.id = "backBtnb";
  backBtn.textContent = "⬅ Back";
  backBtn.onclick = () => renderChapters(bookName);
  verseList.appendChild(backBtn);

  try {
    // For all versions, load the book file directly
    let verses = [];
    let versionFile = currentVersion + '.json';
    if (currentVersion === DEFAULT_VERSION) versionFile = 'KING JAMES BIBLE.json';
    const bible = await fetch(`/bible/${versionFile}`).then(r => r.json());
    let chapterArr = null;
    if (Array.isArray(bible)) {
      const book = bible.find(b => b.name === bookName || b.abbrev === bookName);
      if (!book) {
        showModal("This book is not available in this version.");
        return;
      }
      chapterArr = book.chapters[chapterIdx];
    } else if (typeof bible === 'object' && bible !== null) {
      if (bible[bookName] && bible[bookName][chapterIdx + 1]) {
        chapterArr = Object.values(bible[bookName][chapterIdx + 1]);
      }
    }
    if (!chapterArr) {
      showModal("This chapter is not available in this version.");
      return;
    }
    verses = chapterArr.map((text, idx) => ({ verse: idx + 1, text }));

    // Track reading progress for milestones
    recordBibleProgress(bookName, chapterIdx + 1);

    // Pre-load commentary to find verse ranges
    const commentary = await loadLocalCommentary();
    const chapterCommentary = commentary?.[bookName]?.[chapterIdx + 1] || {};
    const commentaryRanges = parseCommentaryRanges(chapterCommentary);

    for (const row of verses) {
      const idx = Number(row.verse) - 1;
      const text = row.text || "";
      const { cleaned, notes } = splitVerse(text);
      const verseNum = idx + 1;

      const card = document.createElement("div");
      card.className = "question-card";

      // Check if this verse has commentary (is the last verse of a range)
      const hasCommentary = commentaryRanges[verseNum];

      const verseText = document.createElement("p");
      const ref = `${bookName} ${chapterIdx + 1}:${verseNum}`;

      // Add inline commentary icon if this is the last verse of a commentary range
      if (hasCommentary) {
        verseText.innerHTML = `<b>${verseNum}</b>. ${cleaned} <span class=\"commentary-inline-icon\" title=\"Commentary available for verses ${hasCommentary.range}\">📖</span>`;
      } else {
        verseText.innerHTML = `<b>${verseNum}</b>. ${cleaned}`;
      }

      verseText.setAttribute("data-ref", ref);
      verseText.id = ref.replace(/\s+/g, "_").replace(":", "_");

      card.appendChild(verseText);

      if (notes.length) notesCollected.push(`v${verseNum}: ${notes.join("; ")}`);

      // Create commentary body outside the card if this verse has commentary
      let commBody = null;
      if (hasCommentary) {
        commBody = document.createElement("div");
        commBody.className = "commentary-body-standalone";
        commBody.innerHTML = `<div class=\"commentary-body-header\">📖 Matthew Henry commentary on verses ${hasCommentary.range}</div>${hasCommentary.text}`;
        commBody.style.display = "none";

        // Make the inline icon clickable
        const inlineIcon = verseText.querySelector(".commentary-inline-icon");
        if (inlineIcon) {
          inlineIcon.onclick = (e) => {
            e.stopPropagation();
            const isVisible = commBody.style.display !== "none";
            commBody.style.display = isVisible ? "none" : "block";
            inlineIcon.classList.toggle("active", !isVisible);
          };
        }
      }

      // toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "verse-toolbar";
      toolbar.style.display = "none";

      const noteBtn = document.createElement("button");
      noteBtn.textContent = "📝Note"; noteBtn.className = "innerbtn";
      noteBtn.onclick = () => addNote({name: bookName}, chapterIdx, verseNum);

      const highlightBtn = document.createElement("button");
      highlightBtn.textContent = "✨Highlight"; highlightBtn.className = "innerbtn";
      highlightBtn.onclick = () => toggleHighlight(card, {name: bookName}, chapterIdx, verseNum);

      const crossRefBtn = document.createElement("button");
      crossRefBtn.textContent = "🔗Cross-Refs"; crossRefBtn.className = "innerbtn";
      crossRefBtn.onclick = () => toggleCrossRefs(card, {name: bookName}, chapterIdx, verseNum);

      // Share button
      const shareBtn = document.createElement("button");
      shareBtn.textContent = "📤Share"; shareBtn.className = "innerbtn";
      shareBtn.onclick = () => shareVerse(bookName, chapterIdx, verseNum, cleaned);

      // Select button for multi-select
      const selectBtn = document.createElement("button");
      selectBtn.textContent = "☑️Select"; selectBtn.className = "innerbtn";
      selectBtn.onclick = () => {
        if (!window.multiSelectMode || !window.multiSelectMode()) {
          window.enterMultiSelectMode?.();
        }
        window.toggleVerseSelection?.(card, ref, cleaned);
      };

      toolbar.append(noteBtn, highlightBtn, crossRefBtn, shareBtn, selectBtn);
      card.appendChild(toolbar);

      // Handle card click - either multi-select or toggle toolbar
      card.onclick = (e) => {
        // Don't handle if clicking a button or the commentary icon
        if (e.target.tagName === "BUTTON" || e.target.classList.contains("commentary-inline-icon")) return;

        // If in multi-select mode, toggle selection
        if (window.multiSelectMode && window.multiSelectMode()) {
          window.toggleVerseSelection(card, ref, cleaned);
          return;
        }

        // Otherwise toggle toolbar
        toolbar.style.display = toolbar.style.display === "none" ? "block" : "none";
      };

      // notes from localStorage
      const noteKey = `note_${bookName}_${chapterIdx}_${verseNum}`;
      const savedNote = localStorage.getItem(noteKey);
      if (savedNote) {
        const noteBox = document.createElement("div");
        noteBox.className = "note-box";
        noteBox.textContent = savedNote;
        card.appendChild(noteBox);
      }

      // apply highlight
      const hKey = `highlight_${bookName}_${chapterIdx}_${verseNum}`;
      const savedHighlight = localStorage.getItem(hKey);
      if (savedHighlight) {
        if (savedHighlight.trim().startsWith("--")) card.style.backgroundColor = `var(${savedHighlight})`;
        else card.style.backgroundColor = savedHighlight;
      }

      verseList.appendChild(card);

      // Append commentary body after the card (outside, but right below)
      if (commBody) {
        verseList.appendChild(commBody);
      }
    }

    // Notes box
    if (notesCollected.length) {
      const notesBox = document.createElement("div");
      notesBox.id = "notes-box";
      notesBox.className = "game-card";
      notesBox.style.display = showNotes ? "block" : "none";
      notesBox.innerHTML = "<b>Notes:</b><br>" + notesCollected.join("<br>");
      verseList.appendChild(notesBox);

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "innerbtn note";
      toggleBtn.textContent = showNotes ? "Hide Notes" : "Show Notes";
      toggleBtn.onclick = () => { showNotes = !showNotes; renderVerses(bookName, chapterIdx); };
      verseList.appendChild(toggleBtn);
    }

    // previous / next
    const totalChapters = currentChapters && currentChapters.length ? currentChapters.length : null;
    if (totalChapters && chapterIdx < totalChapters - 1) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "innerbtn next"; nextBtn.textContent = "➡️";
      nextBtn.onclick = () => { renderVerses(bookName, chapterIdx + 1); window.scrollTo(0,0); };
      verseList.appendChild(nextBtn);
    }
    if (chapterIdx > 0) {
      const previousBtn = document.createElement("button");
      previousBtn.className = "innerbtn previous"; previousBtn.textContent = "⬅️";
      previousBtn.onclick = () => { renderVerses(bookName, chapterIdx - 1); window.scrollTo(0,0); };
      verseList.appendChild(previousBtn);
    }

    // Save progress
    localStorage.setItem("lastBook", bookName);
    localStorage.setItem("lastChapter", chapterIdx);

    // Setup scroll-based nav button visibility once (guarded)
    if (!window._holyverse_scroll_listener_added) {
      window._holyverse_scroll_listener_added = true;
      let lastScrollTop = 0;
      
      window.addEventListener("scroll", () => {
        const navBtns = document.querySelectorAll(".innerbtn.next, .innerbtn.previous, .innerbtn.note, #backBtnb, .notes");
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const atTop = scrollTop <= 10;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (atTop || atBottom || scrollTop < lastScrollTop) {
          // scrolling up or at top/bottom
          navBtns.forEach(btn => {
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
            btn.style.transition = "opacity 0.3s";
          });
        } else {
          // scrolling down
          navBtns.forEach(btn => {
            btn.style.opacity = "0";
            btn.style.pointerEvents = "none";
            btn.style.transition = "opacity 0.3s";
          });
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scroll
      }, { passive: true });
    }


  } catch (err) {
    console.error("Failed to render verses:", err);
    showModal("Could not load verses for this chapter.");
  }
}



const backBtn = document.getElementById("backBtnb");

// keeps track of what section we came from
let lastVisibleSection = null;

function showBackButton() {
  backBtn.style.display = "block";
}

function hideBackButton() {
  backBtn.style.display = "none";
}

backBtn.onclick = () => {
  hideAll();
  hideBackButton();
  // go back to wherever user was last reading
  document.getElementById("verse-list").style.display = "block";
};



function renderNotesPage() {
  hideAll();
  showBackButton();
  const notesPage = document.getElementById("notes-page");
  notesPage.style.display = "block";
  notesPage.style.position  =  "relative";
  notesPage.innerHTML = "<h2>My Notes</h2>";

  for(let key in localStorage) {
    if (key.startsWith("note_")) {
      const ref = key.replace("note_", "").split("_");
      const [book, chapter, verse] = ref;
      const note = localStorage.getItem(key);

      const item = document.createElement("p");
      item.innerHTML = `<b>${book} ${parseInt(chapter) + 1}:${verse}</b> - ${note}`;
      notesPage.appendChild(item);
    }
  }
}

function renderHighlightsPage() {
  hideAll();
  showBackButton();
  const highlightsPage = document.getElementById("highlights-page");
  highlightsPage.style.display = "block";
  highlightsPage.innerHTML = "<h2>🌟Highlighted Verses</h2>";

  let hasHighlights = false;

  for (let key in localStorage) {
    if (key.startsWith("highlight_")) {
      const color = localStorage.getItem(key);
      if (!color) continue;

      const ref = key.replace("highlight_", "").split("_");
      const [book, chapter, verse] = ref;
      const bookObj = bibleData.find(b => b.name === book);
      const text = bookObj?.chapters?.[parseInt(chapter)]?.[parseInt(verse) - 1] || "";

      const item = document.createElement("div");
      item.className = "highlight-items";
      if (color.startsWith("--")) {
        item.style.backgroundColor = `var(${color})`;
      } else {
        item.style.backgroundColor = color;
      }
      item.style.padding = "8px";
      item.style.borderRadius = "10px";
      item.style.marginBottom = "8px";
      item.style.cursor = "pointer";
      item.innerHTML = `<b>${book} ${parseInt(chapter) + 1}:${verse}</b><br>
        <span>${text}</span>
      `;

      // clicking takes user directly to the verse
      item.onclick = () => {
        window.location.href = `bible.html?ref=${encodeURIComponent(
          `${book} ${parseInt(chapter) + 1}:${verse}`
        )}`;
      };

      highlightsPage.appendChild(item);
      hasHighlights = true;
    }
  }

  if (!hasHighlights) {
    highlightsPage.innerHTML += "<p>No highlights yet. Go mark some favorites ✨</p>";
  }
}

function showPrompt(message, callback) {
  const modal = document.getElementById("inputModal");
  const msg = document.getElementById("inputMessage");
  const input = document.getElementById("inputField");
  const okBtn = document.getElementById("inputOk");
  const cancelBtn = document.getElementById("inputCancel");

  msg.textContent = message;
  input.value = "";
  modal.style.display = "flex";
  input.focus();

  okBtn.onclick = () => {
    modal.style.display = "none";
    callback(input.value);
  };

  cancelBtn.onclick = () => {
    modal.style.display = "none";
    callback(null);
  };
}


function addNote(book, chapter, verse) {
  showPrompt("Write your note:", value => {
    if (value && value.trim() !== "") {
      const key = `note_${book.name}_${chapter}_${verse}`;
      try {
        localStorage.setItem(key, value.trim());
      } catch (err) {
        console.error("Failed to save note:", err);
        showModal("Couldn’t save your note. Try again.");
        return;
      }
      renderVerses(book, chapter);
    } else {
      // User either cancelled or entered empty note
      // Optionally show a modal or simply ignore
      showModal("No note was entered.");
    }
  });
}


function toggleHighlight(card, book, chapter, verse) {
  const key = `highlight_${book.name}_${chapter}_${verse}`;
  const currentColor = localStorage.getItem(key);

  // make a popup color selector
  const picker = document.createElement("div");
  picker.className = "color-picker";
  picker.style.display = "flex";
  picker.style.gap = "6px";
  picker.style.marginTop = "6px";

  // generate color buttons dynamically from --accent1 to --accent10
  for (let i = 1; i <= 10; i++) {
    const colorBtn = document.createElement("button");
    colorBtn.className = "color-dot";
    colorBtn.style.background = `var(--accent${i})`;
    colorBtn.style.border = "none";
    colorBtn.style.width = "20px";
    colorBtn.style.height = "20px";
    colorBtn.style.borderRadius = "50%";
    colorBtn.style.cursor = "pointer";

    colorBtn.onclick = () => {
      const varName = `--accent${i}`;
      card.style.backgroundColor = `var(${varName})`;
      localStorage.setItem(key, varName);
      picker.remove();
    };

    picker.appendChild(colorBtn);
  }

  // if there’s an existing picker, remove it
  const existingPicker = card.querySelector(".color-picker");
  if (existingPicker) existingPicker.remove();

  // show picker under verse
  card.appendChild(picker);
}


// Book name to bolls.life book ID mapping
const BOOK_ID_MAP = {
  "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
  "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
  "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
  "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
  "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22, "Isaiah": 23,
  "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27,
  "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32,
  "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37,
  "Zechariah": 38, "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42,
  "John": 43, "Acts": 44, "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
  "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
  "1 Thessalonians": 52, "2 Thessalonians": 53, "1 Timothy": 54, "2 Timothy": 55,
  "Titus": 56, "Philemon": 57, "Hebrews": 58, "James": 59, "1 Peter": 60,
  "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65, "Revelation": 66
};

// OpenBible abbreviated book names to full names
const ABBREV_TO_FULL = {
  "Gen": "Genesis", "Exod": "Exodus", "Lev": "Leviticus", "Num": "Numbers", "Deut": "Deuteronomy",
  "Josh": "Joshua", "Judg": "Judges", "Ruth": "Ruth", "1Sam": "1 Samuel", "2Sam": "2 Samuel",
  "1Kgs": "1 Kings", "2Kgs": "2 Kings", "1Chr": "1 Chronicles", "2Chr": "2 Chronicles",
  "Ezra": "Ezra", "Neh": "Nehemiah", "Esth": "Esther", "Job": "Job", "Ps": "Psalms",
  "Prov": "Proverbs", "Eccl": "Ecclesiastes", "Song": "Song of Solomon", "Isa": "Isaiah",
  "Jer": "Jeremiah", "Lam": "Lamentations", "Ezek": "Ezekiel", "Dan": "Daniel",
  "Hos": "Hosea", "Joel": "Joel", "Amos": "Amos", "Obad": "Obadiah", "Jonah": "Jonah",
  "Mic": "Micah", "Nah": "Nahum", "Hab": "Habakkuk", "Zeph": "Zephaniah", "Hag": "Haggai",
  "Zech": "Zechariah", "Mal": "Malachi", "Matt": "Matthew", "Mark": "Mark", "Luke": "Luke",
  "John": "John", "Acts": "Acts", "Rom": "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians",
  "Gal": "Galatians", "Eph": "Ephesians", "Phil": "Philippians", "Col": "Colossians",
  "1Thess": "1 Thessalonians", "2Thess": "2 Thessalonians", "1Tim": "1 Timothy", "2Tim": "2 Timothy",
  "Titus": "Titus", "Phlm": "Philemon", "Heb": "Hebrews", "Jas": "James", "1Pet": "1 Peter",
  "2Pet": "2 Peter", "1John": "1 John", "2John": "2 John", "3John": "3 John", "Jude": "Jude", "Rev": "Revelation"
};

// Full name to abbreviation (reverse mapping)
const FULL_TO_ABBREV = Object.fromEntries(Object.entries(ABBREV_TO_FULL).map(([k, v]) => [v, k]));

// Cache for commentary and cross-refs data
const commentaryCache = {};
let crossRefsCache = null;

// Cache for local commentary (full Matthew Henry Concise)
let localCommentaryCache = null;

async function loadLocalCommentary() {
  if (localCommentaryCache) return localCommentaryCache;
  
  try {
    const response = await fetch("/bible/matthew_henry/commentary_full.json");
    if (!response.ok) throw new Error("Failed to load commentary");
    localCommentaryCache = await response.json();
    return localCommentaryCache;
  } catch (error) {
    console.error("Commentary load error:", error);
    return null;
  }
}

// Parse commentary ranges and return a map of lastVerse -> {range, text, startVerse, endVerse}
function parseCommentaryRanges(chapterData) {
  const ranges = {};
  
  for (const [rangeKey, text] of Object.entries(chapterData)) {
    const normalizedKey = rangeKey.replace(/\s+/g, '');
    let startVerse, endVerse;
    
    if (normalizedKey.includes('-')) {
      // Range like "1-5"
      [startVerse, endVerse] = normalizedKey.split('-').map(n => parseInt(n));
    } else if (normalizedKey.includes(',')) {
      // List like "1,2" or "29,30"
      const verses = normalizedKey.split(',').map(n => parseInt(n));
      startVerse = Math.min(...verses);
      endVerse = Math.max(...verses);
    } else {
      // Single verse like "31"
      startVerse = endVerse = parseInt(normalizedKey);
    }
    
    // Map the last verse of this range to the commentary
    ranges[endVerse] = { range: rangeKey, text, startVerse, endVerse };
  }
  
  return ranges;
}

// Find which verse range a specific verse belongs to
// Ranges can be: "1-5", "6, 7", "31", "1, 2", "29, 30"
function findVerseRangeCommentary(chapterData, verseNum) {
  for (const [rangeKey, text] of Object.entries(chapterData)) {
    // Parse the range key
    // Handle formats: "1-5", "1, 2", "31"
    const normalizedKey = rangeKey.replace(/\s+/g, '');
    
    if (normalizedKey.includes('-')) {
      // Range like "1-5"
      const [start, end] = normalizedKey.split('-').map(n => parseInt(n));
      if (verseNum >= start && verseNum <= end) {
        return { range: rangeKey, text };
      }
    } else if (normalizedKey.includes(',')) {
      // List like "1,2" or "29,30"
      const verses = normalizedKey.split(',').map(n => parseInt(n));
      if (verses.includes(verseNum)) {
        return { range: rangeKey, text };
      }
    } else {
      // Single verse like "31"
      if (parseInt(normalizedKey) === verseNum) {
        return { range: rangeKey, text };
      }
    }
  }
  return null;
}

async function toggleCommentary(card, book, chapter, verse) {
  const commBox = card.querySelector(".commentary-box");
  if (commBox) {
    commBox.remove();
    return;
  }

  const bookName = typeof book === "object" ? book.name : book;
  const chapterNum = chapter + 1; // chapter is 0-indexed
  const verseNum = verse;

  const box = document.createElement("div");
  box.className = "commentary-box";
  box.innerHTML = "<i>Loading commentary...</i>";
  card.appendChild(box);

  try {
    const commentary = await loadLocalCommentary();
    if (!commentary) {
      box.innerHTML = "<i>Commentary data unavailable.</i>";
      return;
    }

    // Try to find commentary for this verse
    const bookComm = commentary[bookName];
    if (!bookComm || !bookComm[chapterNum]) {
      box.innerHTML = `<i>No commentary available for ${bookName} ${chapterNum}.</i>`;
      return;
    }

    // Find which verse range this verse belongs to
    const result = findVerseRangeCommentary(bookComm[chapterNum], verseNum);
    
    if (!result) {
      box.innerHTML = `<i>No commentary for verse ${verseNum} in this section.</i><br><small>Matthew Henry's Commentary covers verse groups. Try adjacent verses.</small>`;
      return;
    }

    box.innerHTML = `<b>📖 Matthew Henry on ${bookName} ${chapterNum}:${result.range}</b><br><br>${result.text}`;
  } catch (error) {
    console.error("Commentary error:", error);
    box.innerHTML = "<i>Unable to load commentary.</i>";
  }
}

// Load OpenBible cross-references
async function loadCrossRefs() {
  if (crossRefsCache) return crossRefsCache;
  try {
    const response = await fetch("/bible/crossrefs.json");
    if (!response.ok) throw new Error("Failed to load cross-references");
    crossRefsCache = await response.json();
    return crossRefsCache;
  } catch (error) {
    console.error("Cross-refs load error:", error);
    return null;
  }
}

// Parse OpenBible reference format (e.g., "Gen.1.1" or "Ps.23.1-Ps.23.6")
function parseOpenBibleRef(ref) {
  // Handle range references like "Ps.91.1-Ps.91.2"
  const rangeParts = ref.split("-");
  const mainRef = rangeParts[0];
  
  const match = mainRef.match(/^(\d?\w+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  
  const [, abbrev, chapter, verse] = match;
  const fullName = ABBREV_TO_FULL[abbrev];
  if (!fullName) return null;
  
  let endVerse = parseInt(verse);
  if (rangeParts.length > 1) {
    const endMatch = rangeParts[1].match(/\.(\d+)$/);
    if (endMatch) endVerse = parseInt(endMatch[1]);
  }
  
  return {
    book: fullName,
    chapter: parseInt(chapter),
    startVerse: parseInt(verse),
    endVerse: endVerse,
    display: `${fullName} ${chapter}:${verse}${endVerse !== parseInt(verse) ? '-' + endVerse : ''}`
  };
}

// Fetch verse text from local Bible data
async function getVerseText(bookName, chapter, verse) {
  try {
    const verses = await db.bible.where({ book: bookName, chapter: chapter, verse: verse }).toArray();
    if (verses.length > 0) {
      return verses[0].text;
    }
  } catch (e) {
    console.warn("Could not get verse text:", e);
  }
  return null;
}

async function toggleCrossRefs(card, book, chapter, verse) {
  const refBox = card.querySelector(".crossref-box");
  if (refBox) {
    refBox.remove();
    return;
  }

  const bookName = typeof book === "object" ? book.name : book;
  const chapterNum = chapter + 1; // chapter is 0-indexed
  const verseNum = verse;

  const box = document.createElement("div");
  box.className = "crossref-box";
  box.innerHTML = "<i>Loading cross-references...</i>";
  card.appendChild(box);

  try {
    // Get abbreviation for lookup
    const abbrev = FULL_TO_ABBREV[bookName];
    if (!abbrev) {
      box.innerHTML = "<i>Cross-references not available for this book.</i>";
      return;
    }

    // Load OpenBible cross-refs
    const crossRefs = await loadCrossRefs();
    if (!crossRefs) {
      box.innerHTML = "<i>Unable to load cross-references data.</i>";
      return;
    }

    // Look up refs for this verse
    const key = `${abbrev}.${chapterNum}.${verseNum}`;
    const refs = crossRefs[key];
    
    if (!refs || refs.length === 0) {
      box.innerHTML = "<i>No cross-references found for this verse.</i>";
      return;
    }

    // Build HTML with verse text for top 5 refs
    let html = `<b>🔗 Cross-References (${refs.length}):</b><div class="crossref-list">`;
    
    const topRefs = refs.slice(0, 5);
    for (const refItem of topRefs) {
      const parsed = parseOpenBibleRef(refItem.ref);
      if (!parsed) continue;
      
      // Try to get actual verse text
      const verseText = await getVerseText(parsed.book, parsed.chapter, parsed.startVerse);
      
      html += `<div class="crossref-item">
        <a href="?ref=${encodeURIComponent(parsed.display)}" class="crossref-link">
          <b>${parsed.display}</b>
        </a>
        ${verseText ? `<span class="crossref-text">"${verseText.substring(0, 150)}${verseText.length > 150 ? '...' : ''}"</span>` : ''}
      </div>`;
    }
    
    if (refs.length > 5) {
      html += `<div class="crossref-more">+ ${refs.length - 5} more references</div>`;
    }
    
    html += '</div>';
    box.innerHTML = html;
    
  } catch (error) {
    console.error("Cross-reference error:", error);
    box.innerHTML = "<i>Unable to load cross-references. Please check your connection.</i>";
  }
}

// ===== TTS (Text-to-Speech) Feature =====
let ttsUtterance = null;
let isTTSSpeaking = false;
let ttsCurrentVerseIndex = 0;
let ttsVerseTexts = [];
let ttsAutoNextChapter = true;

let ttsSettings = {
  rate: parseFloat(localStorage.getItem("tts_rate")) || 1.0,
  pitch: parseFloat(localStorage.getItem("tts_pitch")) || 1.0,
  volume: parseFloat(localStorage.getItem("tts_volume")) || 1.0,
  voiceIndex: parseInt(localStorage.getItem("tts_voice")) || -1 // -1 means auto-select natural voice
};

function getAvailableVoices() {
  return speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
}

function selectNaturalVoice(voices) {
  // Priority list of natural-sounding voices
  const naturalKeywords = ["natural", "neural", "google", "microsoft", "samantha", "karen", "daniel", "premium", "enhanced"];
  
  for (const keyword of naturalKeywords) {
    const found = voices.findIndex(v => v.name.toLowerCase().includes(keyword));
    if (found !== -1) return found;
  }
  
  // Fallback to first voice
  return 0;
}

function getSelectedVoice() {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;
  
  let voiceIdx = ttsSettings.voiceIndex;
  if (voiceIdx === -1 || voiceIdx >= voices.length) { 
    voiceIdx = selectNaturalVoice(voices);
    ttsSettings.voiceIndex = voiceIdx;
    localStorage.setItem("tts_voice", voiceIdx);
  }
  return voices[voiceIdx];
}

function speakText(text, onEnd = null) {
  // Cancel any previous speech
  speechSynthesis.cancel();
  
  // Remove HTML tags, emojis, and normalize whitespace
  const cleanText = text
    .replace(/<[^>]*>/g, "")
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  const voice = getSelectedVoice();
  if (voice) utterance.voice = voice;
  
  utterance.rate = ttsSettings.rate;
  utterance.pitch = ttsSettings.pitch;
  utterance.volume = ttsSettings.volume;
  
  utterance.onstart = () => { 
    isTTSSpeaking = true; 
  };
  
  utterance.onend = () => { 
    isTTSSpeaking = true; // Keep speaking flag true until we're done with chapter
    if (onEnd) {
      // Small delay to prevent issues with rapid speech
      setTimeout(() => onEnd(), 100);
    }
  };
  
  utterance.onerror = (e) => { 
    console.error("TTS Error:", e);
    isTTSSpeaking = false; 
    updateTTSButtonState();
  };
  
  // Store reference
  ttsUtterance = utterance;
  
  speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  speechSynthesis.cancel();
  isTTSSpeaking = false;
  ttsCurrentVerseIndex = 0;
  ttsVerseTexts = [];
  // Remove reading highlight
  document.querySelectorAll(".question-card.tts-reading").forEach(c => c.classList.remove("tts-reading"));
  updateTTSButtonState();
}

// Read entire chapter, verse by verse
function readChapter() {
  const verseCards = document.querySelectorAll("#verse-list .question-card p[data-ref]");
  ttsVerseTexts = [];
  
  verseCards.forEach((p, idx) => {
    const text = p.textContent.replace(/^\d+\.\s*/, ""); // Remove verse number prefix
    ttsVerseTexts.push(text);
  });
  
  if (ttsVerseTexts.length === 0) {
    showModal("No verses to read. Please open a chapter first.");
    return;
  }
  
  ttsCurrentVerseIndex = 0;
  isTTSSpeaking = true;
  updateTTSButtonState();
  readNextVerse();
}

function readNextVerse() {
  if (ttsCurrentVerseIndex >= ttsVerseTexts.length) {
    // Chapter finished
    isTTSSpeaking = false;
    document.querySelectorAll(".question-card.tts-reading").forEach(c => c.classList.remove("tts-reading"));
    updateTTSButtonState();
    
    if (ttsAutoNextChapter) {
      // Check if there's a next chapter
      const nextBtn = document.querySelector(".innerbtn.next");
      if (nextBtn) {
        showModal("Chapter finished! Moving to next chapter...");
        setTimeout(() => {
          nextBtn.click();
          // Wait for chapter to load, then start reading
          setTimeout(() => {
            readChapter();
          }, 1000);
        }, 1500);
      } else {
        showModal("You've reached the end of this book!");
      }
    }
    return;
  }
  
  // Highlight current verse being read
  const verseCards = document.querySelectorAll("#verse-list .question-card");
  verseCards.forEach((card, idx) => {
    card.classList.remove("tts-reading");
    if (idx === ttsCurrentVerseIndex) {
      card.classList.add("tts-reading");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  
  speakText(ttsVerseTexts[ttsCurrentVerseIndex], () => {
    ttsCurrentVerseIndex++;
    if (isTTSSpeaking) {
      readNextVerse();
    }
  });
}

function updateTTSButtonState() {
  const listenBtn = document.getElementById("listenChapterBtn");
  const stopBtn = document.getElementById("stopReadingBtn");
  
  if (listenBtn && stopBtn) {
    if (isTTSSpeaking) {
      listenBtn.style.display = "none";
      stopBtn.style.display = "inline-block";
    } else {
      listenBtn.style.display = "inline-block";
      stopBtn.style.display = "none";
    }
  }
}

function showTTSControlsModal() {
  // Remove existing modal
  const existing = document.getElementById("ttsControlsModal");
  if (existing) existing.remove();
  
  const voices = getAvailableVoices();
  const currentVoiceIdx = ttsSettings.voiceIndex === -1 ? selectNaturalVoice(voices) : ttsSettings.voiceIndex;
  
  const modal = document.createElement("div");
  modal.id = "ttsControlsModal";
  modal.className = "modal";
  modal.style.display = "block";
  
  modal.innerHTML = `
    <div class="modal-content tts-modal">
      <h3>🔊 Audio Settings</h3>
      <div class="tts-control-row">
        <label>Voice:</label>
        <select id="ttsVoiceSelect" class="tts-select">
          ${voices.map((v, i) => `<option value="${i}" ${i === currentVoiceIdx ? 'selected' : ''}>${v.name}</option>`).join('')}
        </select>
      </div>
      <div class="tts-control-row">
        <label>Speed: <span id="speedVal">${ttsSettings.rate.toFixed(1)}x</span></label>
        <input type="range" id="ttsSpeed" min="0.5" max="2" step="0.1" value="${ttsSettings.rate}" class="tts-slider">
      </div>
      <div class="tts-control-row">
        <label>Pitch: <span id="pitchVal">${ttsSettings.pitch.toFixed(1)}</span></label>
        <input type="range" id="ttsPitch" min="0.5" max="2" step="0.1" value="${ttsSettings.pitch}" class="tts-slider">
      </div>
      <div class="tts-control-row">
        <label>Volume: <span id="volVal">${Math.round(ttsSettings.volume * 100)}%</span></label>
        <input type="range" id="ttsVolume" min="0" max="1" step="0.1" value="${ttsSettings.volume}" class="tts-slider">
      </div>
      <div class="tts-control-row">
        <label>
          <input type="checkbox" id="autoNextChapter" ${ttsAutoNextChapter ? 'checked' : ''}>
          Auto-play next chapter
        </label>
      </div>
      <div class="modal-actions">
        <button id="closeTTSModal" class="innerbtn">Close</button>
        <button id="testVoiceBtn" class="innerbtn">🔊 Test Voice</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  const speedSlider = modal.querySelector("#ttsSpeed");
  const pitchSlider = modal.querySelector("#ttsPitch");
  const volumeSlider = modal.querySelector("#ttsVolume");
  const voiceSelect = modal.querySelector("#ttsVoiceSelect");
  const autoNextCheckbox = modal.querySelector("#autoNextChapter");
  const closeBtn = modal.querySelector("#closeTTSModal");
  const testBtn = modal.querySelector("#testVoiceBtn");
  
  speedSlider.oninput = (e) => {
    ttsSettings.rate = parseFloat(e.target.value);
    localStorage.setItem("tts_rate", ttsSettings.rate);
    modal.querySelector("#speedVal").textContent = ttsSettings.rate.toFixed(1) + "x";
  };
  
  pitchSlider.oninput = (e) => {
    ttsSettings.pitch = parseFloat(e.target.value);
    localStorage.setItem("tts_pitch", ttsSettings.pitch);
    modal.querySelector("#pitchVal").textContent = ttsSettings.pitch.toFixed(1);
  };
  
  volumeSlider.oninput = (e) => {
    ttsSettings.volume = parseFloat(e.target.value);
    localStorage.setItem("tts_volume", ttsSettings.volume);
    modal.querySelector("#volVal").textContent = Math.round(ttsSettings.volume * 100) + "%";
  };
  
  voiceSelect.onchange = (e) => {
    ttsSettings.voiceIndex = parseInt(e.target.value);
    localStorage.setItem("tts_voice", ttsSettings.voiceIndex);
  };
  
  autoNextCheckbox.onchange = (e) => {
    ttsAutoNextChapter = e.target.checked;
  };
  
  closeBtn.onclick = () => modal.remove();
  
  testBtn.onclick = () => {
    speakText("The Lord is my shepherd, I shall not want.");
  };
  
  // Close on outside click
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

// Ensure voices are loaded (Chrome needs this)
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    // Auto-select natural voice on first load
    if (ttsSettings.voiceIndex === -1) {
      const voices = getAvailableVoices();
      if (voices.length > 0) {
        ttsSettings.voiceIndex = selectNaturalVoice(voices);
        localStorage.setItem("tts_voice", ttsSettings.voiceIndex);
      }
    }
  };
}

// Helper: hide all sections
function hideAll() {
  document.getElementById("book-list").style.display = "none";
  document.getElementById("chapter-list").style.display = "none";
  document.getElementById("verse-list").style.display = "none";
  // Hide search results when navigating
  const searchResults = document.getElementById("searchResults");
  if (searchResults) searchResults.style.display = "none";
}

const menuToggle = document.getElementById("menuToggleBtn");
const highlightBtn = document.getElementById("highlightPageBtn");
const notesBtn = document.getElementById("notesPageBtn");
const versionBtn = document.getElementById("versionSelect");

// Create Listen button dynamically
const listenChapterBtn = document.createElement("button");
listenChapterBtn.id = "listenChapterBtn";
listenChapterBtn.className = "innerbtn";
listenChapterBtn.textContent = "🔊 Listen";
listenChapterBtn.style.display = "none";
listenChapterBtn.onclick = () => readChapter();

// Create Stop button
const stopReadBtn = document.createElement("button");
stopReadBtn.id = "stopReadingBtn";
stopReadBtn.className = "innerbtn";
stopReadBtn.textContent = "⏹️ Stop";
stopReadBtn.style.display = "none";
stopReadBtn.onclick = () => stopSpeaking();

// Create Audio Settings button
const audioSettingsBtn = document.createElement("button");
audioSettingsBtn.id = "audioSettingsBtn";
audioSettingsBtn.className = "innerbtn";
audioSettingsBtn.textContent = "⚙️ Audio settings";
audioSettingsBtn.style.display = "none";
audioSettingsBtn.onclick = () => showTTSControlsModal();

// Add to notes container (after the menu toggle button)
const notesContainer = document.querySelector(".notes");
if (notesContainer && menuToggle) {
  // Insert after menuToggle button
  menuToggle.after(listenChapterBtn);
  listenChapterBtn.after(stopReadBtn);
  stopReadBtn.after(audioSettingsBtn);
}

menuToggle.onclick = () => {
  const isVisible = highlightBtn.style.display === "inline-block";
  highlightBtn.style.display = isVisible ? "none" : "inline-block";
  notesBtn.style.display = isVisible ? "none" : "inline-block";
  versionBtn.style.display = isVisible ? "none" : "inline-block";
  listenChapterBtn.style.display = isVisible ? "none" : (isTTSSpeaking ? "none" : "inline-block");
  stopReadBtn.style.display = isVisible ? "none" : (isTTSSpeaking ? "inline-block" : "none");
  audioSettingsBtn.style.display = isVisible ? "none" : "inline-block";
};

// Hook buttons to pages
highlightBtn.onclick = () => renderHighlightsPage();
notesBtn.onclick = () => renderNotesPage();

// optional: auto theme sync

//observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });


// Restore last read on load
window.onload = async () => {
  const lastBook = localStorage.getItem("lastBook");
  const lastChapter = localStorage.getItem("lastChapter");

  if (lastBook && lastChapter !== null) {
    const book = bibleData.find(b => b.name === lastBook);
    if (book) {
      renderChapters(book);
      renderVerses(book, parseInt(lastChapter));
    }
  }
  // Robust deep-link handler: scrolls to a verse like "Jeremiah 29:11"

  const params = new URLSearchParams(window.location.search);
  const refParam = params.get("ref");
  if (!refParam) return;

  // Expecting "BookName Chapter:Verse" e.g. "Jeremiah 29:11"
  // Tolerant parsing: allow multi-word book names
  const refMatch = refParam.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!refMatch) {
    console.warn("Ref param didn't match expected shape:", refParam);
    return;
  }

  const [, rawBook, chapterStr, verseStr] = refMatch;
  const chapterIdx = parseInt(chapterStr, 10) - 1;
  const verseNum = parseInt(verseStr, 10);

  // normalize helper: strip punctuation, collapse spaces, lowercase
  function normalizeName(s) {
    return s
      .replace(/[^\w\s]/g, "")   // remove punctuation like commas, apostrophes
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  // find best match in bibleData (robust to spacing/case/punctuation)
  const wanted = normalizeName(rawBook);
  let book = bibleData.find(b => normalizeName(b.name) === wanted);

  // fallback: startsWith match (for occasional abbreviations or "1 John" vs "1John")
  if (!book) {
    book = bibleData.find(b => normalizeName(b.name).startsWith(wanted) || wanted.startsWith(normalizeName(b.name)));
  }

  if (!book) {
    console.warn("Book not found in bibleData for:", rawBook);
    return;
  }

  // render the target chapter
  renderVerses(book, chapterIdx);

  // set heading (use your .heading element)
  const headingEl = document.querySelector(".heading");
  if (headingEl) headingEl.textContent = `${book.name} ${chapterStr}`;

  // build expected id exactly the same way renderVerses builds it:
  // verse id used: ref.replace(/\s+/g, "_").replace(":", "_")
  const ref = `${book.name} ${chapterStr}:${verseStr}`;
  const expectedId = ref.replace(/\s+/g, "_").replace(":", "_");

  // wait for the element to appear, then scroll & highlight
  const waitForElement = (id, timeout = 3000, interval = 50) => new Promise((resolve, reject) => {
    const start = Date.now();
    const tryFind = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      if (Date.now() - start > timeout) return reject(new Error("Timed out waiting for verse element: " + id));
      setTimeout(tryFind, interval);
    };
    tryFind();
  });

  try {
    const verseEl = await waitForElement(expectedId, 5000, 60);
    verseEl.scrollIntoView({ behavior: "smooth", block: "center" });

    // tiny visual highlight so user knows they're at the right verse
    verseEl.classList.add("jump-highlight");
    // remove highlight after a small delay
    setTimeout(() => verseEl.classList.remove("jump-highlight"), 2200);
  } catch (err) {
    console.warn(err);
  }


};

// ============================================
// SMART SEARCH - Feeling/Emotion based search
// ============================================

// Feeling/emotion to Bible topic mappings with suggested verses
const feelingToVerses = {
  // Positive emotions
  happy: [
    { ref: "Philippians 4:4", text: "Rejoice in the Lord always. I will say it again: Rejoice!" },
    { ref: "Psalm 118:24", text: "This is the day the Lord has made; let us rejoice and be glad in it." },
    { ref: "Nehemiah 8:10", text: "The joy of the Lord is your strength." },
    { ref: "Psalm 16:11", text: "You make known to me the path of life; in your presence there is fullness of joy." },
    { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace in believing." }
  ],
  joy: [
    { ref: "Psalm 30:5", text: "Weeping may stay for the night, but rejoicing comes in the morning." },
    { ref: "Galatians 5:22", text: "The fruit of the Spirit is love, joy, peace, patience, kindness..." },
    { ref: "John 15:11", text: "I have told you this so that my joy may be in you and your joy may be complete." },
    { ref: "James 1:2", text: "Consider it pure joy, my brothers and sisters, whenever you face trials." },
    { ref: "1 Peter 1:8", text: "Though you have not seen him, you love him... filled with an inexpressible and glorious joy." }
  ],
  grateful: [
    { ref: "1 Thessalonians 5:18", text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." },
    { ref: "Psalm 107:1", text: "Give thanks to the Lord, for he is good; his love endures forever." },
    { ref: "Colossians 3:17", text: "Whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks." },
    { ref: "Psalm 100:4", text: "Enter his gates with thanksgiving and his courts with praise." },
    { ref: "Ephesians 5:20", text: "Always giving thanks to God the Father for everything." }
  ],
  thankful: [
    { ref: "Psalm 136:1", text: "Give thanks to the Lord, for he is good. His love endures forever." },
    { ref: "Hebrews 12:28", text: "Let us be thankful, and so worship God acceptably with reverence and awe." },
    { ref: "Philippians 4:6", text: "In every situation, by prayer and petition, with thanksgiving, present your requests to God." }
  ],
  blessed: [
    { ref: "Matthew 5:3-12", text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven..." },
    { ref: "Psalm 1:1", text: "Blessed is the one who does not walk in step with the wicked." },
    { ref: "Numbers 6:24-26", text: "The Lord bless you and keep you; the Lord make his face shine on you." },
    { ref: "Jeremiah 17:7", text: "Blessed is the one who trusts in the Lord, whose confidence is in him." }
  ],
  peaceful: [
    { ref: "John 14:27", text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled." },
    { ref: "Philippians 4:7", text: "The peace of God, which transcends all understanding, will guard your hearts." },
    { ref: "Isaiah 26:3", text: "You will keep in perfect peace those whose minds are steadfast." },
    { ref: "Romans 8:6", text: "The mind governed by the Spirit is life and peace." }
  ],
  hopeful: [
    { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, plans to prosper you and not to harm you." },
    { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him." },
    { ref: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see." },
    { ref: "Psalm 42:11", text: "Put your hope in God, for I will yet praise him, my Savior and my God." }
  ],
  loved: [
    { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son." },
    { ref: "Romans 8:38-39", text: "Nothing can separate us from the love of God that is in Christ Jesus." },
    { ref: "1 John 4:19", text: "We love because he first loved us." },
    { ref: "Jeremiah 31:3", text: "I have loved you with an everlasting love." }
  ],
  strong: [
    { ref: "Isaiah 40:31", text: "Those who hope in the Lord will renew their strength." },
    { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
    { ref: "2 Timothy 1:7", text: "God gave us a spirit not of fear but of power and love and self-control." },
    { ref: "Psalm 27:1", text: "The Lord is my light and my salvation—whom shall I fear?" }
  ],

  // Negative emotions needing comfort
  sad: [
    { ref: "Psalm 34:18", text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit." },
    { ref: "Matthew 5:4", text: "Blessed are those who mourn, for they will be comforted." },
    { ref: "Revelation 21:4", text: "He will wipe every tear from their eyes. There will be no more death or mourning." },
    { ref: "Psalm 147:3", text: "He heals the brokenhearted and binds up their wounds." },
    { ref: "2 Corinthians 1:3-4", text: "The God of all comfort, who comforts us in all our troubles." }
  ],
  depressed: [
    { ref: "Psalm 42:11", text: "Why, my soul, are you downcast? Put your hope in God." },
    { ref: "Psalm 40:1-2", text: "He lifted me out of the slimy pit, out of the mud and mire." },
    { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God." },
    { ref: "Psalm 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil." }
  ],
  anxious: [
    { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer..." },
    { ref: "Matthew 6:34", text: "Do not worry about tomorrow, for tomorrow will worry about itself." },
    { ref: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you." },
    { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God." },
    { ref: "Psalm 55:22", text: "Cast your cares on the Lord and he will sustain you." }
  ],
  worried: [
    { ref: "Matthew 6:25-27", text: "Do not worry about your life, what you will eat or drink." },
    { ref: "Luke 12:22-26", text: "Life is more than food, and the body more than clothes." },
    { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding." }
  ],
  afraid: [
    { ref: "Psalm 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil." },
    { ref: "Isaiah 41:13", text: "For I am the Lord your God who takes hold of your right hand." },
    { ref: "2 Timothy 1:7", text: "God has not given us a spirit of fear, but of power, love, and self-discipline." },
    { ref: "Psalm 27:1", text: "The Lord is my light and my salvation—whom shall I fear?" },
    { ref: "Deuteronomy 31:6", text: "Be strong and courageous. Do not be afraid... the Lord your God goes with you." }
  ],
  scared: [
    { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged." },
    { ref: "Psalm 56:3", text: "When I am afraid, I put my trust in you." },
    { ref: "Isaiah 43:1", text: "Fear not, for I have redeemed you; I have called you by name, you are mine." }
  ],
  lonely: [
    { ref: "Deuteronomy 31:8", text: "The Lord himself goes before you and will be with you; he will never leave you." },
    { ref: "Psalm 68:6", text: "God sets the lonely in families." },
    { ref: "Hebrews 13:5", text: "Never will I leave you; never will I forsake you." },
    { ref: "Matthew 28:20", text: "And surely I am with you always, to the very end of the age." }
  ],
  angry: [
    { ref: "Ephesians 4:26-27", text: "In your anger do not sin. Do not let the sun go down while you are still angry." },
    { ref: "James 1:19-20", text: "Everyone should be quick to listen, slow to speak and slow to become angry." },
    { ref: "Proverbs 15:1", text: "A gentle answer turns away wrath, but a harsh word stirs up anger." },
    { ref: "Colossians 3:8", text: "But now you must also rid yourselves of all such things as these: anger, rage, malice." }
  ],
  frustrated: [
    { ref: "Galatians 6:9", text: "Let us not become weary in doing good, for at the proper time we will reap." },
    { ref: "Isaiah 40:31", text: "Those who hope in the Lord will renew their strength." },
    { ref: "Romans 8:28", text: "All things work together for good to those who love God." }
  ],
  stressed: [
    { ref: "Matthew 11:28-30", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
    { ref: "Psalm 55:22", text: "Cast your cares on the Lord and he will sustain you." },
    { ref: "Philippians 4:19", text: "My God will meet all your needs according to the riches of his glory." }
  ],
  overwhelmed: [
    { ref: "Psalm 61:2", text: "From the ends of the earth I call to you when my heart is overwhelmed." },
    { ref: "2 Corinthians 4:8-9", text: "We are hard pressed on every side, but not crushed." },
    { ref: "Isaiah 43:2", text: "When you pass through the waters, I will be with you." }
  ],
  tired: [
    { ref: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
    { ref: "Isaiah 40:29", text: "He gives strength to the weary and increases the power of the weak." },
    { ref: "Psalm 23:2-3", text: "He makes me lie down in green pastures... he refreshes my soul." }
  ],
  lost: [
    { ref: "Psalm 32:8", text: "I will instruct you and teach you in the way you should go." },
    { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart... he will make your paths straight." },
    { ref: "John 14:6", text: "I am the way and the truth and the life." },
    { ref: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path." }
  ],
  confused: [
    { ref: "James 1:5", text: "If any of you lacks wisdom, let him ask God, who gives generously." },
    { ref: "1 Corinthians 14:33", text: "For God is not a God of confusion but of peace." },
    { ref: "Proverbs 2:6", text: "For the Lord gives wisdom; from his mouth come knowledge and understanding." }
  ],
  hurt: [
    { ref: "Psalm 147:3", text: "He heals the brokenhearted and binds up their wounds." },
    { ref: "Isaiah 53:5", text: "By his wounds we are healed." },
    { ref: "Psalm 34:17-18", text: "The Lord hears and delivers them out of all their troubles." }
  ],
  betrayed: [
    { ref: "Psalm 55:12-14", text: "If an enemy were insulting me, I could endure it..." },
    { ref: "Hebrews 13:5", text: "Never will I leave you; never will I forsake you." },
    { ref: "Proverbs 18:24", text: "There is a friend who sticks closer than a brother." }
  ],
  guilty: [
    { ref: "1 John 1:9", text: "If we confess our sins, he is faithful and just and will forgive us." },
    { ref: "Romans 8:1", text: "There is now no condemnation for those who are in Christ Jesus." },
    { ref: "Psalm 103:12", text: "As far as the east is from the west, so far has he removed our transgressions." },
    { ref: "Isaiah 1:18", text: "Though your sins are like scarlet, they shall be as white as snow." }
  ],
  ashamed: [
    { ref: "Romans 10:11", text: "Anyone who believes in him will never be put to shame." },
    { ref: "Isaiah 54:4", text: "Do not be afraid; you will not be put to shame." },
    { ref: "Joel 2:26", text: "You will never again be put to shame." }
  ],
  weak: [
    { ref: "2 Corinthians 12:9-10", text: "My grace is sufficient for you, for my power is made perfect in weakness." },
    { ref: "Isaiah 40:29", text: "He gives strength to the weary and increases the power of the weak." },
    { ref: "Psalm 73:26", text: "My flesh and my heart may fail, but God is the strength of my heart." }
  ],
  jealous: [
    { ref: "Galatians 5:26", text: "Let us not become conceited, provoking and envying each other." },
    { ref: "James 3:16", text: "For where you have envy and selfish ambition, there you find disorder." },
    { ref: "Proverbs 14:30", text: "A heart at peace gives life to the body, but envy rots the bones." }
  ],

  // Life situations
  tempted: [
    { ref: "1 Corinthians 10:13", text: "No temptation has overtaken you except what is common to mankind." },
    { ref: "James 4:7", text: "Submit yourselves to God. Resist the devil, and he will flee from you." },
    { ref: "Hebrews 4:15-16", text: "We have a high priest... tempted in every way, just as we are—yet he did not sin." }
  ],
  forgiving: [
    { ref: "Ephesians 4:32", text: "Be kind and compassionate to one another, forgiving each other." },
    { ref: "Colossians 3:13", text: "Forgive as the Lord forgave you." },
    { ref: "Matthew 6:14-15", text: "If you forgive other people when they sin against you, your heavenly Father will also forgive you." }
  ],
  guidance: [
    { ref: "Psalm 25:4-5", text: "Show me your ways, Lord, teach me your paths." },
    { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart... he will make your paths straight." },
    { ref: "Isaiah 30:21", text: "Whether you turn to the right or to the left, your ears will hear a voice behind you saying, 'This is the way; walk in it.'" }
  ],
  patience: [
    { ref: "James 1:2-4", text: "The testing of your faith produces perseverance." },
    { ref: "Romans 12:12", text: "Be joyful in hope, patient in affliction, faithful in prayer." },
    { ref: "Ecclesiastes 7:8", text: "The end of a matter is better than its beginning, and patience is better than pride." }
  ],
  courage: [
    { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged." },
    { ref: "Deuteronomy 31:6", text: "Be strong and courageous... the Lord your God goes with you." },
    { ref: "Isaiah 41:10", text: "Do not fear, for I am with you; do not be dismayed, for I am your God." }
  ],
  faith: [
    { ref: "Hebrews 11:1", text: "Faith is confidence in what we hope for and assurance about what we do not see." },
    { ref: "Romans 10:17", text: "Faith comes from hearing the message, and the message is heard through the word about Christ." },
    { ref: "Mark 11:22-24", text: "Have faith in God... whatever you ask for in prayer, believe that you have received it." }
  ],
  love: [
    { ref: "1 Corinthians 13:4-7", text: "Love is patient, love is kind. It does not envy, it does not boast." },
    { ref: "1 John 4:8", text: "Whoever does not love does not know God, because God is love." },
    { ref: "John 13:34-35", text: "A new command I give you: Love one another. As I have loved you." }
  ],
  wisdom: [
    { ref: "James 1:5", text: "If any of you lacks wisdom, let him ask God, who gives generously." },
    { ref: "Proverbs 9:10", text: "The fear of the Lord is the beginning of wisdom." },
    { ref: "Colossians 2:3", text: "In Christ are hidden all the treasures of wisdom and knowledge." }
  ],
  healing: [
    { ref: "Jeremiah 17:14", text: "Heal me, Lord, and I will be healed; save me and I will be saved." },
    { ref: "James 5:15", text: "The prayer offered in faith will make the sick person well." },
    { ref: "Psalm 103:2-3", text: "Praise the Lord, my soul... who heals all your diseases." }
  ],
  grieving: [
    { ref: "2 Corinthians 1:3-4", text: "The God of all comfort, who comforts us in all our troubles." },
    { ref: "Psalm 34:18", text: "The Lord is close to the brokenhearted." },
    { ref: "John 11:35", text: "Jesus wept." },
    { ref: "1 Thessalonians 4:13-14", text: "We do not grieve like the rest of mankind, who have no hope." }
  ],
  success: [
    { ref: "Joshua 1:8", text: "Keep this Book of the Law always on your lips... then you will be prosperous and successful." },
    { ref: "Proverbs 16:3", text: "Commit to the Lord whatever you do, and he will establish your plans." },
    { ref: "Psalm 1:3", text: "Whatever they do prospers." }
  ],
  provision: [
    { ref: "Philippians 4:19", text: "My God will meet all your needs according to the riches of his glory." },
    { ref: "Matthew 6:31-33", text: "Seek first his kingdom and his righteousness, and all these things will be given to you." },
    { ref: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing." }
  ],
  protection: [
    { ref: "Psalm 91:1-2", text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty." },
    { ref: "Psalm 121:7-8", text: "The Lord will keep you from all harm—he will watch over your life." },
    { ref: "2 Thessalonians 3:3", text: "The Lord is faithful, and he will strengthen you and protect you from the evil one." }
  ]
};

// Alternative words mapping to main feelings
const feelingAliases = {
  "joyful": "happy", "cheerful": "happy", "content": "happy", "delighted": "happy", "elated": "happy",
  "rejoicing": "joy", "jubilant": "joy", "ecstatic": "joy", "blissful": "joy",
  "appreciation": "grateful", "thankfulness": "grateful", "appreciative": "thankful",
  "calm": "peaceful", "serene": "peaceful", "tranquil": "peaceful", "quiet": "peaceful",
  "optimistic": "hopeful", "encouraged": "hopeful", "confident": "hopeful",
  "cherished": "loved", "adored": "loved", "treasured": "loved", "valued": "loved",
  "mighty": "strong", "powerful": "strong", "brave": "courage", "courageous": "courage",
  "unhappy": "sad", "sorrowful": "sad", "heartbroken": "sad", "crying": "sad", "weeping": "sad",
  "down": "depressed", "hopeless": "depressed", "despair": "depressed", "empty": "depressed",
  "nervous": "anxious", "panic": "anxious", "restless": "anxious", "uneasy": "anxious",
  "concerned": "worried", "troubled": "worried", "distressed": "worried",
  "fearful": "afraid", "terrified": "scared", "frightened": "scared", "horror": "scared",
  "isolated": "lonely", "alone": "lonely", "abandoned": "lonely", "rejected": "lonely",
  "mad": "angry", "furious": "angry", "rage": "angry", "irritated": "angry", "annoyed": "frustrated",
  "pressure": "stressed", "burnout": "stressed", "tension": "stressed",
  "swamped": "overwhelmed", "burden": "overwhelmed", "crushed": "overwhelmed",
  "exhausted": "tired", "fatigued": "tired", "drained": "tired", "weary": "tired",
  "directionless": "lost", "wandering": "lost", "uncertain": "confused", "unsure": "confused",
  "pain": "hurt", "wounded": "hurt", "broken": "hurt", "suffering": "hurt",
  "shame": "ashamed", "embarrassed": "ashamed", "humiliated": "ashamed",
  "regret": "guilty", "remorse": "guilty", "conviction": "guilty",
  "feeble": "weak", "powerless": "weak", "helpless": "weak",
  "envy": "jealous", "envious": "jealous", "covetous": "jealous",
  "temptation": "tempted", "struggling": "tempted", "sin": "tempted",
  "forgive": "forgiving", "forgiveness": "forgiving", "pardon": "forgiving",
  "direction": "guidance", "path": "guidance", "purpose": "guidance",
  "waiting": "patience", "endurance": "patience", "perseverance": "patience",
  "trust": "faith", "believe": "faith", "believing": "faith",
  "caring": "love", "affection": "love", "compassion": "love", "kindness": "love",
  "knowledge": "wisdom", "understanding": "wisdom", "discernment": "wisdom",
  "sickness": "healing", "illness": "healing", "disease": "healing", "recovery": "healing",
  "mourning": "grieving", "loss": "grieving", "death": "grieving", "bereavement": "grieving",
  "prosperity": "success", "achievement": "success", "victory": "success",
  "needs": "provision", "finances": "provision", "money": "provision", "poverty": "provision",
  "safety": "protection", "security": "protection", "danger": "protection", "harm": "protection"
};

// Initialize search functionality
function initSmartSearch() {
  const searchInput = document.getElementById("bibleSearch");
  const clearBtn = document.getElementById("clearBibleSearch");
  const searchResults = document.getElementById("searchResults");
  
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    clearBtn.style.display = query.length > 0 ? "block" : "none";
    
    if (query.length < 2) {
      searchResults.style.display = "none";
      return;
    }
    
    const results = performSmartSearch(query);
    displaySearchResults(results, searchResults, query);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      if (query.length >= 2) {
        const results = performSmartSearch(query);
        displaySearchResults(results, searchResults, query);
      }
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    searchResults.style.display = "none";
  });
}

function performSmartSearch(query) {
  const results = [];
  const addedRefs = new Set();

  // Check if query matches a feeling or its alias
  let matchedFeeling = null;
  if (feelingToVerses[query]) {
    matchedFeeling = query;
  } else if (feelingAliases[query]) {
    matchedFeeling = feelingAliases[query];
  }

  // Check for partial matches in feelings
  if (!matchedFeeling) {
    for (const feeling of Object.keys(feelingToVerses)) {
      if (feeling.includes(query) || query.includes(feeling)) {
        matchedFeeling = feeling;
        break;
      }
    }
  }

  // Check partial matches in aliases
  if (!matchedFeeling) {
    for (const [alias, feeling] of Object.entries(feelingAliases)) {
      if (alias.includes(query) || query.includes(alias)) {
        matchedFeeling = feeling;
        break;
      }
    }
  }

  // Add feeling-based results
  if (matchedFeeling && feelingToVerses[matchedFeeling]) {
    for (const verse of feelingToVerses[matchedFeeling]) {
      if (!addedRefs.has(verse.ref)) {
        results.push({ ...verse, type: "feeling", feeling: matchedFeeling });
        addedRefs.add(verse.ref);
      }
    }
  }

  // Also search for literal text matches in current Bible version
  if (window.BIBLE && window.BIBLE[currentVersion]) {
    const bible = window.BIBLE[currentVersion];
    let textMatches = 0;
    const maxTextMatches = 20;

    for (const bookName of Object.keys(bible)) {
      if (textMatches >= maxTextMatches) break;
      const book = bible[bookName];
      
      for (const chapterNum of Object.keys(book)) {
        if (textMatches >= maxTextMatches) break;
        const verses = book[chapterNum];
        
        for (const verse of verses) {
          if (textMatches >= maxTextMatches) break;
          const text = (verse.text || "").toLowerCase();
          
          if (text.includes(query)) {
            const ref = `${bookName} ${chapterNum}:${verse.verse}`;
            if (!addedRefs.has(ref)) {
              results.push({
                ref: ref,
                text: verse.text.substring(0, 150) + (verse.text.length > 150 ? "..." : ""),
                type: "text"
              });
              addedRefs.add(ref);
              textMatches++;
            }
          }
        }
      }
    }
  }

  return results;
}

function displaySearchResults(results, container, query) {
  container.innerHTML = "";
  
  if (results.length === 0) {
    container.innerHTML = `<p style="text-align: center; padding: 20px; color: var(--text-color);">No results found for "${query}" 😢</p>`;
    container.style.display = "block";
    return;
  }

  // Group results by type
  const feelingResults = results.filter(r => r.type === "feeling");
  const textResults = results.filter(r => r.type === "text");

  if (feelingResults.length > 0) {
    const feelingHeader = document.createElement("div");
    feelingHeader.className = "search-section-header";
    feelingHeader.innerHTML = `<span style="color: var(--accent);">💭 Verses for when you feel ${feelingResults[0].feeling}</span>`;
    feelingHeader.style.cssText = "padding: 10px 15px; font-weight: bold; background: var(--card-bg); border-bottom: 1px solid var(--accent);";
    container.appendChild(feelingHeader);

    for (const result of feelingResults) {
      const item = createSearchResultItem(result);
      container.appendChild(item);
    }
  }

  if (textResults.length > 0) {
    const textHeader = document.createElement("div");
    textHeader.className = "search-section-header";
    textHeader.innerHTML = `<span style="color: var(--accent);">📖 Text matches for "${query}"</span>`;
    textHeader.style.cssText = "padding: 10px 15px; font-weight: bold; background: var(--card-bg); border-bottom: 1px solid var(--accent);";
    container.appendChild(textHeader);

    for (const result of textResults) {
      const item = createSearchResultItem(result);
      container.appendChild(item);
    }
  }

  container.style.display = "block";
}

function createSearchResultItem(result) {
  const item = document.createElement("div");
  item.className = "question-card";
  item.style.cssText = "cursor: pointer; margin: 5px 0; padding: 12px;";
  item.innerHTML = `
    <b style="color: var(--accent);">${result.ref}</b><br>
    <span style="font-size: 0.95em;">${result.text}</span>
  `;
  
  item.onclick = () => {
    // Navigate to the verse
    window.location.href = `bible.html?ref=${encodeURIComponent(result.ref)}`;
  };
  
  return item;
}

// Initialize search when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initSmartSearch();
});

// ============================================
// SHARE VERSE FUNCTIONALITY
// ============================================

function shareVerse(bookName, chapter, verse, text) {
  const ref = `${bookName} ${chapter + 1}:${verse}`;
  const verseLink = `https://holy-verse.web.app/bible.html?book=${encodeURIComponent(bookName)}&chapter=${chapter + 1}&verse=${verse}`;
  const shareText = `"${text}"\n\n— ${ref}\n\n📖 \n\nShared via HolyVerse`;
  
  if (navigator.share) {
    navigator.share({
      title: ref,
      text: shareText,
      url: verseLink
    }).catch(err => console.log("Share cancelled"));
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      showModal("Verse copied to clipboard! You can now paste and share it.");
    }).catch(() => {
      showModal("Could not share. Please copy the verse manually.");
    });
  }
}

// ============================================
// MULTI-SELECT VERSES FUNCTIONALITY
// ============================================

let multiSelectMode = false;
let selectedVerses = [];

function initMultiSelect() {
  const toolbar = document.getElementById("multiSelectToolbar");
  const shareBtn = document.getElementById("shareSelectedBtn");
  const highlightBtn = document.getElementById("highlightSelectedBtn");
  const cancelBtn = document.getElementById("cancelSelectBtn");
  
  if (!toolbar) return;

  shareBtn?.addEventListener("click", shareSelectedVerses);
  highlightBtn?.addEventListener("click", highlightSelectedVerses);
  cancelBtn?.addEventListener("click", exitMultiSelectMode);
}

function enterMultiSelectMode() {
  multiSelectMode = true;
  selectedVerses = [];
  updateMultiSelectToolbar();
  document.getElementById("multiSelectToolbar").style.display = "flex";
  
  // Add visual indicator to all verse cards
  document.querySelectorAll(".question-card").forEach(card => {
    card.classList.add("selectable");
  });
}

function exitMultiSelectMode() {
  multiSelectMode = false;
  selectedVerses = [];
  document.getElementById("multiSelectToolbar").style.display = "none";
  
  // Remove selection styling
  document.querySelectorAll(".question-card").forEach(card => {
    card.classList.remove("selectable", "selected");
  });
}

function toggleVerseSelection(card, ref, text) {
  if (!multiSelectMode) return false;
  
  const index = selectedVerses.findIndex(v => v.ref === ref);
  if (index >= 0) {
    selectedVerses.splice(index, 1);
    card.classList.remove("selected");
  } else {
    selectedVerses.push({ ref, text, card });
    card.classList.add("selected");
  }
  
  updateMultiSelectToolbar();
  return true;
}

function updateMultiSelectToolbar() {
  const countEl = document.getElementById("selectedCount");
  if (countEl) {
    countEl.textContent = `${selectedVerses.length} selected`;
  }
}

function shareSelectedVerses() {
  if (selectedVerses.length === 0) {
    showModal("No verses selected.");
    return;
  }
  
  const appLink = "https://holy-verse.web.app/bible.html";
  const shareText = selectedVerses.map(v => `"${v.text}"\n— ${v.ref}`).join("\n\n") + `\n\n📖 Read in app: ${appLink}\n\nShared via HolyVerse`;
  
  if (navigator.share) {
    navigator.share({
      title: `${selectedVerses.length} Bible Verses`,
      text: shareText,
      url: appLink
    }).catch(err => console.log("Share cancelled"));
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      showModal(`${selectedVerses.length} verses copied to clipboard!`);
    }).catch(() => {
      showModal("Could not share. Please try again.");
    });
  }
}

function highlightSelectedVerses() {
  if (selectedVerses.length === 0) {
    showModal("No verses selected.");
    return;
  }
  
  // Create color picker popup (styled via .multi-color-picker CSS class)
  const picker = document.createElement("div");
  picker.className = "multi-color-picker";
  
  const title = document.createElement("p");
  title.textContent = `Choose a color for ${selectedVerses.length} verses:`;
  picker.appendChild(title);
  
  const colorRow = document.createElement("div");
  
  for (let i = 1; i <= 10; i++) {
    const colorBtn = document.createElement("button");
    colorBtn.style.cssText = `width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; background: var(--accent${i});`;
    
    colorBtn.onclick = () => {
      const varName = `--accent${i}`;
      selectedVerses.forEach(v => {
        // Parse the ref to get book, chapter, verse
        const match = v.ref.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (match) {
          const [, bookName, chapterNum, verseNum] = match;
          const key = `highlight_${bookName}_${parseInt(chapterNum) - 1}_${verseNum}`;
          localStorage.setItem(key, varName);
          v.card.style.backgroundColor = `var(${varName})`;
        }
      });
      picker.remove();
      exitMultiSelectMode();
      showModal(`${selectedVerses.length} verses highlighted!`);
    };
    
    colorRow.appendChild(colorBtn);
  }
  
  picker.appendChild(colorRow);
  
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "innerbtn";
  cancelBtn.textContent = "✖ Cancel";
  cancelBtn.onclick = () => picker.remove();
  picker.appendChild(cancelBtn);
  
  document.body.appendChild(picker);
}

// Initialize multi-select when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initMultiSelect();
});

// Export functions for use in renderVerses
window.shareVerse = shareVerse;
window.enterMultiSelectMode = enterMultiSelectMode;
window.toggleVerseSelection = toggleVerseSelection;
window.multiSelectMode = () => multiSelectMode;
