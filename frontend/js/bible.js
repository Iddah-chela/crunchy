
// top-of-file globals
let bibleBooks = [];            // array of book names (strings) from server
let currentBookName = null;     // e.g. "Genesis"
let currentChapters = [];       // array of chapter numbers for current book
let currentChapterIdx = 0;      // zero-based index of current chapter
let showNotes = false;
let bibleData = [];

import db, { migrateBible, isBibleLoaded } from "./bibleMigrator.js";

(async function loadBible() {
  

  const loaded = await isBibleLoaded();
  if (!loaded) {
    console.log("📥 Loading Bible for first time...");
    await migrateBible();
  }

  const verses = await db.bible.orderBy("order").toArray();
const seen = new Set();
bibleData = [];

for (const v of verses) {
  if (!seen.has(v.book)) {
    seen.add(v.book);
    bibleData.push({ name: v.book });
  }
}

  
  renderBookList("ot");



    // --- handle ?ref= deep-link here ---
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");

    if (refParam) {
      const refMatch = refParam.match(/^(.+?)\s+(\d+):(\d+)$/);
      if (refMatch) {
        const [, rawBook, chapterStr, verseStr] = refMatch;
        const chapterIdx = parseInt(chapterStr, 10) - 1;

        function normalizeName(s) {
          return s.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        }

        const wanted = normalizeName(rawBook);
        let book = bibleData.find(b => normalizeName(b.name) === wanted);
        if (!book) {
          book = bibleData.find(b =>
            normalizeName(b.name).startsWith(wanted) ||
            wanted.startsWith(normalizeName(b.name))
          );
        }

        if (book) {
          renderVerses(book, chapterIdx);
          const headingEl = document.querySelector(".heading");
          if (headingEl) headingEl.textContent = `${book.name} ${chapterStr}`;

          const ref = `${book.name} ${chapterStr}:${verseStr}`;
          const expectedId = ref.replace(/\s+/g, "_").replace(":", "_");

          const waitForElement = (id, timeout = 3000, interval = 50) =>
            new Promise((resolve, reject) => {
              const start = Date.now();
              const check = () => {
                const el = document.getElementById(id);
                if (el) return resolve(el);
                if (Date.now() - start > timeout)
                  return reject(new Error("Timeout waiting for " + id));
                setTimeout(check, interval);
              };
              check();
            });

          try {
            const verseEl = await waitForElement(expectedId, 5000, 60);
            verseEl.scrollIntoView({ behavior: "smooth", block: "center" });
            verseEl.classList.add("jump-highlight");
            setTimeout(() => verseEl.classList.remove("jump-highlight"), 2200);
          } catch (e) {
            console.warn(e);
          }

          return; // stop here, skip "last read" and OT render below
        }
      }
    }

    // --- fallback if no ?ref= ---
    const lastBook = localStorage.getItem("lastBook");
    const lastChapter = localStorage.getItem("lastChapter");
    if (lastBook && lastChapter !== null) {
      const book = bibleData.find(b => b.name === lastBook);
      if (book) {
        renderVerses(book, parseInt(lastChapter));
        return;
      }
    }

    renderBookList("ot");
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



// --- initial load: fetch book list (absolute path) ---
(async function initBible() {
  try {
  const loaded = await isBibleLoaded();
  if (!loaded) {
    console.log("📥 Loading Bible for first time...");
    await migrateBible();
  }

  // Pull *all* verses so we can extract book names in stored order
  const verses = await db.bible.orderBy("order").toArray();
  const seen = new Set();
  bibleBooks = [];
  
  for (const v of verses) {
    if (!seen.has(v.book)) {
      seen.add(v.book);
      bibleBooks.push(v.book);
    }
  }

  // canonical sort (so OT/NT stay in correct order)
  const canonicalOrder = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
    "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
    "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
    "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
    "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
    "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
    "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
    "1 John","2 John","3 John","Jude","Revelation"
  ];

  bibleBooks.sort(
    (a, b) => canonicalOrder.indexOf(a) - canonicalOrder.indexOf(b)
  );

  renderBookList("ot");
  handleDeepLinkOrLastRead();

} catch (err) {
  console.error("Could not load Bible from Dexie:", err);
  showModal("Could not load Bible.");
}

})();

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
  currentBookName = bookName;
  setMainHeading(`📖 ${bookName}`);
  const chapterList = document.getElementById("chapter-list");
  chapterList.style.display = "block";
  chapterList.innerHTML = "";

  try {
    // Get chapters directly from Dexie

const chapterRows = await db.bible.where("book").equals(bookName).toArray();
const chapters = [...new Set(chapterRows.map(r => r.chapter))].sort((a, b) => Number(a) - Number(b));

    currentChapters = chapters;
    // create buttons
    chapters.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "innerbtn";
      btn.textContent = ch;
      btn.onclick = () => renderVerses(bookName, ch - 1);
      chapterList.appendChild(btn);
    });

    // Back to books
    const backBtn = document.createElement("button");
    backBtn.className = "innerbtn";
    backBtn.id =  "backBtnb"
    backBtn.textContent = "⬅ Back";
    backBtn.onclick = () => {
      exitBibleReading();
      renderBookList(currentChapters && currentChapters.length ? (bibleBooks.indexOf(bookName) < 39 ? "ot" : "nt") : "ot");
    };
    chapterList.appendChild(backBtn);

  } catch (err) {
    console.error("Could not load chapters:", err);
    showModal("Failed to load chapters.");
  }
}

// -------------------- Render Verses (fetch from API) --------------------
async function renderVerses(bookName, chapterIdx) {
  hideAll();
  enterBibleReading();
  currentBookName = bookName;
  currentChapterIdx = chapterIdx;

  setMainHeading(`📖 ${bookName} ${chapterIdx + 1}`);
  const verseList = document.getElementById("verse-list");
  verseList.style.display = "block";
  verseList.innerHTML = "";

  const notesCollected = [];

  // Back to chapters
  const backBtn = document.createElement("button");
  backBtn.className = " innerbtn";
  backBtn.id =  "backBtnb"
  backBtn.textContent = "⬅ Back";
  backBtn.onclick = () => renderChapters(bookName);
  verseList.appendChild(backBtn);

  try {
    const chapterNum = chapterIdx + 1;
    // Read verses straight from Dexie
const verses = await db.bible
  .where({ book: bookName, chapter: chapterNum })
  .sortBy("verse");


    // iterate rows (use row.verse as number)
    for (const row of verses) {
      const idx = parseInt(row.verse, 10) - 1;   // zero-based
      const text = row.text || "";
      const { cleaned, notes } = splitVerse(text);
      const verseNum = idx + 1;

      const card = document.createElement("div");
      card.className = "question-card";

      const verseText = document.createElement("p");
      const ref = `${bookName} ${chapterNum}:${verseNum}`;
      verseText.innerHTML = `<b>${verseNum}</b>. ${cleaned}`;
      verseText.setAttribute("data-ref", ref);
      verseText.id = ref.replace(/\s+/g, "_").replace(":", "_");

      card.appendChild(verseText);

      if (notes.length) notesCollected.push(`v${verseNum}: ${notes.join("; ")}`);

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

      const commBtn = document.createElement("button");
      commBtn.textContent = "📖Commentary"; commBtn.className = "innerbtn";
      commBtn.onclick = () => toggleCommentary(card, {name: bookName}, chapterIdx, verseNum);

      toolbar.append(noteBtn, highlightBtn, commBtn);
      card.appendChild(toolbar);

      verseText.onclick = () => {
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

    // next/previous - use currentChapters to know lengths if available
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
    // --- show nav buttons only when user scrolls ---
    let scrollTimeout;
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;

  const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

  // Get your buttons
  const navBtns = document.querySelectorAll(".innerbtn.next, .innerbtn.previous, .innerbtn.note, #backBtnb, .notes");
  
  navBtns.forEach(btn => {
    btn.style.opacity = atBottom ? "1" : (scrollTop > 100 ? "1" : "0");
    btn.style.transition = "opacity 0.3s";
    btn.style.pointerEvents = btn.style.opacity === "1" ? "auto" : "none";
  });
  // hide after 1.2s of no movement (unless at bottom)
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (!atBottom) {
      navBtns.forEach(btn => {
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
      });
    }
  }, 3500);
});

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


function toggleCommentary(card, book, chapter, verse) {
  //placeholder - later fetch actual commentary
  const commBox = card.querySelector(".commentary-box");
  if (commBox) {
    commBox.remove();
    return;
  }

  const box = document.createElement("div");
  box.className = "commentary-box";
  box.textContent = "Commentary coming soon...";
  card.appendChild(box);
}

// Helper: hide all sections
function hideAll() {
  document.getElementById("book-list").style.display = "none";
  document.getElementById("chapter-list").style.display = "none";
  document.getElementById("verse-list").style.display = "none";
}

const menuToggle = document.getElementById("menuToggleBtn");
const highlightBtn = document.getElementById("highlightPageBtn");
const notesBtn = document.getElementById("notesPageBtn");

menuToggle.onclick = () => {
  const isVisible = highlightBtn.style.display === "inline-block";
  highlightBtn.style.display = isVisible ? "none" : "inline-block";
  notesBtn.style.display = isVisible ? "none" : "inline-block";
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
