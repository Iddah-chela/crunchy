let bibleData = [];
let currentBook = null;
let currentChapter = null;
let showNotes = false; // global flag

// Load Bible JSON
fetch("./bible/en_kjv.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data;
    //check saved location
    const lastBook = localStorage.getItem("lastBook");
    const lastChapter = localStorage.getItem("lastChapter");

    if (lastBook && lastChapter !== null) {
      const book = bibleData.find(b => b.name === lastBook);
      if (book) {
        renderVerses(book, parseInt(lastChapter)); //go straight to last read
        return
      }
    }

    //default to ot if no saved progress
    renderBookList("ot"); // show OT first
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

// Render book list
function renderBookList(testament) {
  
  hideAll();
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
  currentChapter = chapterIdx;
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
    verseText.innerHTML = `<b>${idx + 1}</b>. ${cleaned}`;

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
    nextBtn.textContent = "➡️ Next Chapter";
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
    previousBtn.textContent = "➡️ Previous Chapter";
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

  for(let key in localStorage) {
    if (key.startsWith("highlight_") && localStorage.getItem(key) === "true") {
      const ref = key.replace("highlight_", "").split("_");
      const [book, chapter, verse] = ref;
      const highlight = localStorage.getItem(key);

      const item = document.createElement("p");
      item.innerHTML = `<b>${book} ${parseInt(chapter) + 1}:${verse}</b>`;
      highlightsPage.appendChild(item);
    }
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
  card.classList.toggle("highlight");
  const key = `highlight_${book.name}_${chapter}_${verse}`;
  localStorage.setItem(key, card.classList.contains("highlight"));
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

// Restore last read on load
window.onload = () => {
  const lastBook = localStorage.getItem("lastBook");
  const lastChapter = localStorage.getItem("lastChapter");

  if (lastBook && lastChapter !== null) {
    const book = bibleData.find(b => b.name === lastBook);
    if (book) {
      renderChapters(book);
      renderVerses(book, parseInt(lastChapter));
    }
  }
};
