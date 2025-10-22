// Add all your JS here
//oookay, I think an array will do, here or...?

let lastShownTags = [];
let lastShownId = null;
let lastShownVerse = null;

let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}

// Grab all the question buttons and convert to array of objects
const questionButtons = Array.from(document.querySelectorAll(".question-btn"))
  .filter(btn => btn.id !== "q9") // exclude verse of the day
  .map(btn => ({
    id: btn.id,
    text: btn.textContent.trim().toLowerCase(),
    element: btn
  }));

// Create Fuse instance
let fuse;
if (document.getElementById("questionSearch")) {
  fuse = new Fuse(questionButtons, {
    keys: ["text"],
    threshold: 0.4
  });
}

function getFavoritesFromStorage() {
  try {
    const data = storage.getItem("favorites");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn("Could not read from storage", err);
    return [];
  } 
}

function addButtonsToDisplay(display, chosen, tag) {
  const copy = document.createElement("button");
  copy.classList.add("innerbtn");
  copy.innerText = "Copy";
  copy.onclick = () => {
    navigator.clipboard.writeText(display.innerText).then(() => {
      alert("Verse copied to clipboard!");
    });
  };

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("innerbtn");
  closeBtn.innerText = "Close";
  closeBtn.onclick = () => {
    display.style.display = "none";
    document.getElementById("overlay").style.display = "none";
  };

  const favoritebtn = document.createElement("button");
  favoritebtn.classList.add("innerbtn");
  favoritebtn.innerText = "💖";
  favoritebtn.onclick = () => {
    let verseText = display.innerHTML.split('<div class="btn-container">')[0];
    let stored = storage.getItem("favorites");
    let currentFavorites = stored ? JSON.parse(stored) : [];

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    if (!currentFavorites.some(fav => fav.text === verseText)) {
      let newEntry = { text: verseText, notes: "" };
      currentFavorites.push(newEntry);

      let ul = document.getElementById("favoritelist");
      if (ul) {
        let li = document.createElement("li");
        li.innerHTML = verseText.replace(/\n/g, "<br>");
        addButtonsToLi(li, newEntry);
        ul.appendChild(li);
      }

      try {
        storage.setItem("favorites", JSON.stringify(currentFavorites));
      } catch (err) {
        console.warn("localStorage not supported.");
      }
    }
  };

  const moreLikeBtn = document.createElement("button");
  moreLikeBtn.classList.add("innerbtn");
  moreLikeBtn.innerText = "Get another verse like this";
  moreLikeBtn.onclick = () => showVersesByTag(tag);

  const btns = document.createElement("div");
  btns.classList.add("btn-container");
  btns.appendChild(favoritebtn);
  btns.appendChild(copy);
  btns.appendChild(closeBtn);
  btns.appendChild(moreLikeBtn);
  display.appendChild(btns);
}

function addButtonsToLi(li, entry) {
  // hii ni kama container ya ma-buttons zote
  let liBtn = document.createElement("div");
  liBtn.classList.add("btn-container");

  // ====== DELETE BUTTON ======
  let deletebtn = document.createElement("button");
  deletebtn.classList.add("innerbtn");
  deletebtn.innerText = "Delete";

  // ukiclick delete, inatoa hiyo verse kwa page na storage pia
  deletebtn.onclick = function () {
    li.remove(); // toa kwa screen

    // sasa tutoa kwa storage pia (local au session)
    let stored = storage.getItem("favorites");
    if (stored) {
      let arr = JSON.parse(stored); // chukua array
      let newArr = arr.filter(fav => fav.text !== entry.text); // toa ile iko sawa na hii verse
      storage.setItem("favorites", JSON.stringify(newArr)); // rudisha array mpya kwa storage
    }
  };

  // ====== ADD NOTES BUTTON ======
  let notesbtn = document.createElement("button");
  notesbtn.classList.add("innerbtn");
  notesbtn.innerText = "Add notes";

  notesbtn.onclick = function () {
    // hapa ndo user ataandika note yao
    let input = document.createElement("input");
    input.value = ""; // kama kuna note, ionyeshe

    // button ya kusave note
    let savebtn = document.createElement("button");
    savebtn.classList.add("innerbtn");
    savebtn.innerText = "Save";

    savebtn.onclick = function () {
      // paragraph ya kuonyesha note kwa screen
       //oooh ukieka input inadisplay kwa input...so just create a display space
      let notesSpace = document.createElement("p");
      notesSpace.innerHTML = `</br><b>📝Notes:</b> ${input.value}`;
      li.appendChild(notesSpace); // ongeza kwa li

      // sasa hio note tuiupdate kwa object yenyewe
      entry.notes = input.value;

      // then save kwa storage pia
      let stored = storage.getItem("favorites");
      if (stored) {
        let arr = JSON.parse(stored);
        let updated = arr.map(fav =>
          //^^walai sijui nini inaendelea hapa
          fav.text === entry.text ? { ...fav, notes: input.value } : fav
        );
        storage.setItem("favorites", JSON.stringify(updated));
      }

      // cleanup — toa input na save button
      input.remove();
      savebtn.remove();
    };
    // weka input na save kwa liBtn (ile container ya buttons)
    if (!li.querySelector("input")) {
      liBtn.appendChild(input);
      liBtn.appendChild(savebtn);
    };
  };

  // ====== APPEND BUTTONS TO LIST ITEM ======
  liBtn.appendChild(notesbtn); // weka Add Notes button
  liBtn.appendChild(deletebtn); // weka Delete button
  li.appendChild(liBtn); // weka container yote kwa verse item
}

function buildTagScoresFromFavorites() {
  const tagScores = {}; // { love: 3, peace: 1, etc. }

  const stored = storage.getItem("favorites");

  if (!stored) return tagScores;

  try {
    const faves = JSON.parse(stored);
    
    //I regretfully changed this
    faves.forEach(entry => {
      if (Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
          tagScores[tag] = (tagScores[tag] || 0) + 1;
        });
      }
    });
  } catch (err) {
    console.warn("Couldn't read favorites for tag scoring:", err);
  }
  return tagScores;
}
// ------ Verses cache & loader ------

let _allVersesCache = null; // [{ qkey, ref, text, theme, tags:[], category }]

// Fetch and flatten ALL verses from the server (cached)
async function getAllVerses(forceReload = false) {
  if (_allVersesCache && !forceReload) return _allVersesCache;

  // 1) get list of questions (each row should include qkey)
  const qRes = await fetch("/questions");
  if (!qRes.ok) throw new Error("Failed to fetch questions list");
  const qRows = await qRes.json(); // e.g. [{id, qkey, title}, ...]

  // 2) for each qkey fetch its verses, in parallel
  const qkeys = qRows.map(q => q.qkey).filter(Boolean);
  const fetches = qkeys.map(k =>
    fetch(`/questions/${encodeURIComponent(k)}`)
      .then(r => r.ok ? r.json() : [])
      .catch(err => {
        console.warn("Failed to fetch question", k, err);
        return [];
      })
      .then(rows => ({ qkey: k, rows }))
  );

  //sasa hii ni nini surely
  const results = await Promise.all(fetches);

  // 3) flatten into array of verse objects
  const flat = [];
  for (const res of results) {
    const qkey = res.qkey;
    const rows = Array.isArray(res.rows) ? res.rows : [];

    for (const row of rows) {
      // server row shape: { ref, text, theme, tags, category }
      let tags = row.tags;
      if (typeof tags === "string") {
        try { tags = JSON.parse(tags || "[]"); } catch { tags = []; }
      }
      if (!Array.isArray(tags)) tags = [];

      flat.push({
        qkey,
        ref: row.ref,
        text: row.text,
        theme: row.theme,
        tags,
        category: row.category || row.category || "",
      });
    }
  }

  _allVersesCache = flat;
  return flat;
}

// optional helper to clear cache if DB changes
function invalidateVersesCache() {
  _allVersesCache = null;
}


// ------ UI helper to show a verse (clickable ref) ------
function renderVerseToDisplay(chosen) {
  const display = document.getElementById("versedisplay");
  if (!display) return;

  // chosen: { ref, text, theme, tags, category, qkey }
  const safeRef = chosen.ref || "";
  const encodedRef = encodeURIComponent(safeRef);

  display.className = "versebox";
  if (chosen.theme) display.classList.add(`bg-${chosen.theme}`);

  display.innerHTML = `
    <b>${escapeHtml(chosen.category)}</b><br>
    <hr>
    <b>
      <a href="bible.html?ref=${encodedRef}" class="verse-link" rel="noopener">
        ${escapeHtml(safeRef)}
      </a>:
    </b>
    ${escapeHtml(chosen.text)}<br><br>
    <i>${escapeHtml(chosen.source || "")}</i>
  `;
  display.style.display = "block";
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.style.display = "block";

  // update globals if you use them elsewhere
  lastShownId = chosen.qkey;
  lastShownTags = chosen.tags || [];
  lastShownVerse = chosen.text || "";
}

// tiny helper to avoid injecting raw HTML
function escapeHtml(s) {
  if (!s && s !== "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


// ------ showMoreLikeThis(tag, currentVerseRef) ------
async function showMoreLikeThis(tag, currentVerseRef) {
  try {
    const all = await getAllVerses();

    // filter by tag & not the current verse (match by ref)
    const matches = all.filter(v =>
      Array.isArray(v.tags) && v.tags.includes(tag) && v.ref !== currentVerseRef
    );

    if (!matches.length) {
      alert(`No more verses found with this tag: ${tag}`);
      return;
    }

    const chosen = matches[Math.floor(Math.random() * matches.length)];
    renderVerseToDisplay(chosen);
    addButtonsToDisplay(document.getElementById("versedisplay"), chosen, chosen.tags?.[0] || tag);
  } catch (err) {
    console.error("showMoreLikeThis error:", err);
    alert("Something went wrong. Check console.");
  }
}


// ------ showVersesByTag(tag) ------
async function showVersesByTag(tag) {
  try {
    const all = await getAllVerses();
    const matches = all.filter(v => Array.isArray(v.tags) && v.tags.includes(tag));

    if (!matches.length) {
      alert(`No verses found for tag: ${tag}`);
      return;
    }

    const chosen = matches[Math.floor(Math.random() * matches.length)];
    renderVerseToDisplay(chosen);
    addButtonsToDisplay(document.getElementById("versedisplay"), chosen, chosen.tags?.[0] || tag);
  } catch (err) {
    console.error("showVersesByTag error:", err);
    alert("Something went wrong. Check console.");
  }
}




function suggestMoreFromFavoriteTags() {
  const tagScores = buildTagScoresFromFavorites();
  const sortedTags = Object.entries(tagScores)
    .filter(([_, count]) => count >= 5) // Only keep tags used 5+ times
    .sort((a, b) => b[1] - a[1]);

  if (!sortedTags.length) return;

  const [topTag] = sortedTags[0];

  const box = document.createElement("div");
  box.className = "suggestion-box";
  box.id = "tagSuggestionBox"; // ADD THIS LINE to remove it later

  box.innerHTML = `
    <p>You seem to love verses about <b>${topTag}</b>. Want more like that?</p>
  `;

  const btn = document.createElement("button");
  btn.innerText = "Show More";
  btn.classList.add("innerbtn");
  btn.onclick = () => {
    showVersesByTag(topTag);
    
    // Remove the suggestion box after click
    const boxToRemove = document.getElementById("tagSuggestionBox");
    if (boxToRemove) boxToRemove.remove();
  };

  box.appendChild(btn);
  document.getElementById("favoritesSuggestionArea")?.appendChild(box);
}

function randgen(q) {
  fetch(`./questions/${q}`)
    .then(res => res.json())
    .then(rows => {
      if (!rows || !rows.length) {
        console.error("No answers found");
        alert("Oops! That question doesn't have any verses yet.");
        return;
      }

      // pick random row from DB
      const randomRow = rows[Math.floor(Math.random() * rows.length)];

      let verse = randomRow.text;
      let themer = randomRow.theme;
      let category = randomRow.category;
      let ref = randomRow.ref;
      let tags = JSON.parse(randomRow.tags || "[]");

      // blur out the background, overlay is always blur so if verse is not there, blur kills app
      let overlay = document.getElementById("overlay");
      if (overlay) {
        overlay.style.display = "block";
      }

      // update globals
      lastShownId = q;
      lastShownTags = tags;
      lastShownVerse = verse;

      // display
      let display = document.getElementById("versedisplay");
      if (!display) return;

      display.classList.value = "versebox"; // Reset classes
      if (themer) {
        display.classList.add(`bg-${themer}`);
      }

      display.innerHTML = `<b>${category}</b><br><hr><b>${ref}:</b> ${verse}<br>`;
      display.style.display = "block";

      // ===== Buttons below the verse =====

      // Copy button
      var copy = document.createElement("button");
      copy.classList.add("innerbtn");
      copy.innerText = "Copy";

      copy.onclick = function copyVerse() {
        let display = document.getElementById("versedisplay");
        let text = display.innerText;

        // okay so theres a new object called navigator, and I think it can access the clipboard 
        // but where does it end...maybe it accesses time and location too.
        navigator.clipboard.writeText(text).then(() => {
          alert("Verse copied to clipboard!");
        }).catch(err => {
          console.error("Failed to copy: ", err);
        });
      };

      // Close button
      let closeBtn = document.createElement("button");
      closeBtn.classList.add("innerbtn");
      closeBtn.innerText = "Close";
      closeBtn.onclick = () => {
        display.style.display = "none";
        if (overlay) {
          overlay.style.display = "none";
        }
      };

      // More Like This button
      let moreLikeBtn = document.createElement("button");
      moreLikeBtn.classList.add("innerbtn");
      moreLikeBtn.innerText = "More Like This";
      moreLikeBtn.onclick = function () {
        const tag = (lastShownTags && lastShownTags[0]) || "love";
        showMoreLikeThis(tag, ref, lastShownId);
      };


      // Favorites button
      let favoritebtn = document.createElement("button");
      favoritebtn.classList.add("innerbtn");
      favoritebtn.innerText = ("💖");

      favoritebtn.onclick = function saveFavorite() {
        let display = document.getElementById("versedisplay");
        let verseText = display.innerHTML.split('<div class="btn-container">')[0];

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        let stored = storage.getItem("favorites");
        let currentFavorites = stored ? JSON.parse(stored) : [];

        if (!currentFavorites.some(fav => fav.text === verseText)) {
          let newEntry = {
            text: verseText,
            notes: "",
            tags: lastShownTags || []
          };

          currentFavorites.push(newEntry);

          let ul = document.getElementById("favoritelist");
          if (ul) {
            let li = document.createElement("li");
            li.innerHTML = verseText.replace(/\n/g, "<br>");
            addButtonsToLi(li, newEntry);
            ul.appendChild(li);
          }
        }

        try {
          storage.setItem("favorites", JSON.stringify(currentFavorites));
        } catch (err) {
          console.warn("localStorage is not supported in this environment 🥺");
        }
      };

      // Add buttons below verse
      if (typeof initTopbar === "function") {
        initTopbar();
      }

      let displayBtn = document.createElement("div");
      displayBtn.classList.add("btn-container");

      displayBtn.appendChild(favoritebtn);
      displayBtn.appendChild(copy);
      displayBtn.appendChild(moreLikeBtn);
      displayBtn.appendChild(closeBtn);

      display.appendChild(displayBtn);

    })
    .catch(err => console.error(err));
}


   

function displayItem(entry) {
  let ul = document.getElementById("favoritelist");
  if (!ul) return;

  let li = document.createElement("li");

  //Huh the line is back. no idea why it happens twice
  li.innerHTML = entry.text.replace(/\n/g, "<br>");

  // If there's a note, show it too
  if (entry.notes) {
    let notesSpace = document.createElement("p");
    notesSpace.innerHTML = `</br><b>📝Notes:</b> ${entry.notes}`;
    li.appendChild(notesSpace);
  }
  
  addButtonsToLi(li, entry);
  ul.appendChild(li);
}

window.onload = function () {

//make an array that'll contain our favorite list
  let fave = [];

  try {
    if (
    //check if localStorage is there and actually functional
      typeof storage !== "undefined" &&
      storage !== null &&
      typeof storage.getItem === "function"
    ) {
    //and get the fave list inside if it is, and parse it
      const rawData = storage.getItem("favorites");
      if (rawData) {
        fave = JSON.parse(rawData);
      }
    } else {
      console.warn("localStorage not supported in this environment.");
    }
  } catch (err) {
    console.warn("Error accessing localStorage:", err);
  }

  getAllVerses().catch(e => console.warn("Error preloading verses:", e));
  
  //this seems to say we should display the items from the localStorage which probably means if localStorage is supported, these items will be displayed twice
  //by displayitem and additem
  const ul = document.getElementById("favoritelist");
  if (ul && Array.isArray(fave)) {
    fave.forEach(entry => displayItem(entry));
  }
    if (window.location.pathname.includes("favorites.html")) {
      suggestMoreFromFavoriteTags();
      const scores = buildTagScoresFromFavorites();
      console.log("Tag scores from favorites (manual log):", scores);
      console.table(scores);
    }

};

//this just allows you to select a question when you click on category
let currentCategory = null; // Track which is open

function toggleCategory(id) {
  const selected = document.getElementById(id);
  if (!selected) return;
  
  const allGroups = document.querySelectorAll('.question-group');
  const allBlocks = document.querySelectorAll(".category-block");
  const input = document.getElementById("questionSearch");
  const searchValue = input ? input.value.trim().toLowerCase() : "";

  // If the same category is clicked again, hide it and restore all blocks
  if (currentCategory === id) {
    selected.style.display = 'none';
    currentCategory = null;

    // Only restore all blocks if there's no search
    if (!searchValue) {
      allBlocks.forEach(block => {
        block.style.display = "inline-block";
        const group = block.querySelector(".question-group");
        if (group) group.style.display = "none"; // collapse all groups again
      });
    }

    return;
  }

  // Otherwise: show selected and hide all others
  allGroups.forEach(group => group.style.display = 'none');
  allBlocks.forEach(block => block.style.display = "inline-block");

  selected.style.display = 'inline-block';
  selected.closest(".category-block").style.display = "block";
  currentCategory = id;

  // If no search is active, show all its question buttons
  if (!searchValue) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const selectedAge = currentUser.age || 10;

  const buttons = selected.querySelectorAll(".question-btn");
  buttons.forEach(btn => {
    const q = questions.find(q => q.id === btn.id);
    if (q && selectedAge >= q.ageRange[0] && selectedAge <= q.ageRange[1]) {
      btn.style.display = "inline-block";
    } else {
      btn.style.display = "none";
    }
  });
}
}

function filterQuestions() {
  const input = document.getElementById("questionSearch").value.toLowerCase().trim();
  const clearBtn = document.getElementById("clearBtn");
  const verseOfDayBtn = document.getElementById("q9");
  const categoryBlocks = document.querySelectorAll(".category-block");
  const noMatchMsg = document.getElementById("noMatchMessage");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedAge = user.age || "10";

  // Show/hide ❌ button and Verse of the Day
  clearBtn.style.display = input ? "inline-block" : "none";
  verseOfDayBtn.style.display = input ? "none" : "block";

  // Reset visibility
  let matchCount = 0;

  // If search input is empty
  if (!input) {
    // Show all category buttons, but keep question buttons hidden
    categoryBlocks.forEach(block => {
      const group = block.querySelector(".question-group");
      block.style.display = "block";
      if (group) group.style.display = "none";
    });

    // Hide all question buttons
    questionButtons.forEach(q => {
      q.element.style.display = "none";
    });

    noMatchMsg.style.display = "none";
    return;
  }

  // When searching: hide all categories first
  categoryBlocks.forEach(block => {
    block.style.display = "none";
    const group = block.querySelector(".question-group");
    if (group) group.style.display = "none";
  });

  // Run Fuse search
  const results = fuse.search(input);

  // Show only matching questions and their category buttons
  results.forEach(({ item }) => {
    const btn = item.element;
    const q = questions.find(q => q.id === item.id);
    
    //only show if age matches
    //have no idea what this does but I'm so hapy it works like damn!!
    if (q && selectedAge >= q.ageRange[0] && selectedAge <= q.ageRange[1]) {
      btn.style.display = "inline-block";

      const group = btn.closest(".question-group");
      const block = btn.closest(".category-block");
      if (group) group.style.display = "block";
      if (block) block.style.display = "block";

      matchCount++;
    } else {
      btn.style.display = "none";
    }
    
  });

  // Show "no matches" message
  noMatchMsg.style.display = matchCount === 0 ? "block" : "none";
}

function clearSearch() {
  const input = document.getElementById("questionSearch");
  input.value = "";
  currentCategory = null; // Reset open category
  filterQuestions(); // Reapply filters (will show all categories again)
}


document.querySelector('.baby-ai-bubble').addEventListener('click', () => {
  window.location.href = 'chat.html';
});


