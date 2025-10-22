let bibleData = [];
let currentBook = null;
let currentChapter = null;
let showNotes = false; // global flag

// Load Bible JSON
fetch("./bible/en_kjv.json")
  .then(res => res.json())
  .then(async (data) => {
    bibleData = data;

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
  const music = document.getElementById("bg-music");
  if (music) music.play(); // resume bg music
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


// Render book list
function renderBookList(testament) {
  hideAll();
  setMainHeading("📖 Bible");
  const bookList = document.getElementById("book-list");
  bookList.style.display = "block";
  bookList.innerHTML = "";

  const books = testament === "ot" ? bibleData.slice(0, 39) : bibleData.slice(39);

  books.forEach((book) => {
    const btn = document.createElement("button");
    btn.className = "category-btn category-block";
    btn.textContent = book.name;
    btn.onclick = () => renderChapters(book);
    bookList.appendChild(btn);
  });

  // toggle NT/OT
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "link-btn innerbtn";
  toggleBtn.textContent = testament === "ot" ? "Go to NT ➡️" : "⬅️ Back to OT";
  toggleBtn.onclick = () => renderBookList(testament === "ot" ? "nt" : "ot");
  bookList.appendChild(toggleBtn);
}

// Render chapters
function renderChapters(book) {
  hideAll();
  currentBook = book;
  setMainHeading(`📖 ${book.name}`);
  const chapterList = document.getElementById("chapter-list");
  chapterList.style.display = "block";
  chapterList.innerHTML = "";

  book.chapters.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.className = "innerbtn";
    btn.textContent = idx + 1;
    btn.onclick = () => renderVerses(book, idx);
    chapterList.appendChild(btn);
  });

  // Back to books
  const backBtn = document.createElement("button");
  backBtn.className = "link-btn innerbtn";
  backBtn.textContent = "⬅️ Back to Books";
  backBtn.onclick = () => 
  {
    exitBibleReading();
    renderBookList(book.index < 39 ? "nt" : "ot");
  }
  chapterList.appendChild(backBtn);
}

// Render verses
// Render verses
function renderVerses(book, chapterIdx) {
  hideAll();
  enterBibleReading();
  currentBook = book;
  currentChapter = chapterIdx;

  
  // update heading with book and chapter name
  setMainHeading(`📖 ${book.name} ${chapterIdx + 1}`);
  const verseList = document.getElementById("verse-list");
  verseList.style.display = "block";
  verseList.innerHTML = "";

  const notesCollected = [];

  // Back to chapters
  const backBtn = document.createElement("button");
  backBtn.className = "link-btn innerbtn";
  backBtn.textContent = "⬅️ Back to Chapters";
  backBtn.onclick = () => renderChapters(book);
  verseList.appendChild(backBtn);

  // Render verses
  const verses = book.chapters[chapterIdx];
  verses.forEach((text, idx) => {
    const { cleaned, notes } = splitVerse(text);
    const verseNum = idx + 1;

    const card = document.createElement("div");
    card.className = "question-card";

    const verseText = document.createElement("p");
    const ref = `${book.name} ${chapterIdx + 1}:${idx + 1}`;
verseText.innerHTML = `<b>${idx + 1}</b>. ${cleaned}`;
verseText.setAttribute("data-ref", ref);
verseText.id = ref.replace(/\s+/g, "_").replace(":", "_");


    card.appendChild(verseText);

    if (notes.length) {
      notesCollected.push(`v${idx + 1}: ${notes.join("; ")}`);
    }

    //toolbar(hidden by default)
    const toolbar = document.createElement("div");
    toolbar.className = "verse-toolbar";
    toolbar.style.display = "none";

    const noteBtn = document.createElement("button");
    noteBtn.textContent = "📝Note";
    noteBtn.className = "innerbtn";
    noteBtn.onclick = () => {
      addNote(book, chapterIdx, verseNum);
    }

    const highlightBtn = document.createElement("button");
    highlightBtn.textContent = "✨Highlight";
    highlightBtn.className = "innerbtn";
    highlightBtn.onclick = () => toggleHighlight(card, book, chapterIdx, verseNum);

    const commBtn = document.createElement("button");
    commBtn.textContent = "📖Commentary";
   commBtn.className = "innerbtn";
    commBtn.onclick = () => toggleCommentary(card, book, chapterIdx, verseNum);

    toolbar.append(noteBtn, highlightBtn, commBtn);
    card.appendChild(toolbar);

    //clicking verse shows or hides toolbar
    verseText.onclick = () => {
      toolbar.style.display = toolbar.style.display === "none" ? "block": "none";
    };

    //append user notes if they exist
    const noteKey = `note_${book.name}_${chapterIdx}_${verseNum}`;
    const savedNote = localStorage.getItem(noteKey);
    if (savedNote) {
      const noteBox = document.createElement("div");
      noteBox.className = "note-box";
      noteBox.textContent = savedNote;
      card.appendChild(noteBox);
    }

    
    // apply saved highlight if any (value might be var name or legacy hex)
    const hKey = `highlight_${book.name}_${chapterIdx}_${verseNum}`;
    const savedHighlight = localStorage.getItem(hKey);
    if (savedHighlight) {
      // if savedHighlight starts with '--' treat as var name; otherwise treat as color value
      if (savedHighlight.trim().startsWith("--")) {
        card.style.backgroundColor = `var(${savedHighlight})`;
      } else {
        card.style.backgroundColor = savedHighlight;
      }
    }

    verseList.appendChild(card);
  });

  // Notes box (hidden by default)
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
    toggleBtn.onclick = () => {
      showNotes = !showNotes;
      renderVerses(book, chapterIdx);
    };
    verseList.appendChild(toggleBtn);
  }
  // Next chapter button
  if (chapterIdx < book.chapters.length - 1) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "innerbtn next";
    nextBtn.textContent = "➡️";
    nextBtn.onclick = () => {
      renderVerses(book, chapterIdx + 1);
      window.scrollTo(0, 0);
    }
    verseList.appendChild(nextBtn);
  }

  //previous caphter button
  if (chapterIdx > 0) {
    const previousBtn = document.createElement("button");
    previousBtn.className = "innerbtn previous";
    previousBtn.textContent = "⬅️";
    previousBtn.onclick = () => {
      renderVerses(book, chapterIdx - 1);
      window.scrollTo(0, 0);
    }
    verseList.appendChild(previousBtn);
  }

  // Save progress
  localStorage.setItem("lastBook", book.name);
  localStorage.setItem("lastChapter", chapterIdx);
}

function renderNotesPage() {
  hideAll();
  const notesPage = document.getElementById("notes-page");
  notesPage.style.display = "block";
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


function addNote(book, chapter, verse) {
  const note = prompt("Write your note: ");
  if (note) {
    const key = `note_${book.name}_${chapter}_${verse}`;
    localStorage.setItem(key, note);
    renderVerses(book, chapter); //re-render so note appears
  }
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
const observer = new MutationObserver(() => {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.style.background = getComputedStyle(document.documentElement)
      
      .trim();
  });
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });


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
