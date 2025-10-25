// community-merged.js — merged version with offline drafts + image support
let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}

// ensure user is signed in
const currentUser = JSON.parse(storage.getItem("user"));
if (!currentUser) {
  console.log("Not logged in, skipping backend load");
  
}

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


document.querySelector('.baby-ai-bubble')?.addEventListener('click', () => {
  window.location.href = 'private.html';
});

const askInput = document.querySelector('.ask-input');
const questionFeed = document.querySelector('.question-feed');

const STORAGE_KEY = 'community_questions';
let questions = [];
let openQuestionId = null; // keep which question is open after re-render
let openReply = null; // top of file, as a global tracker

// load saved (old behavior)
const saved = storage.getItem(STORAGE_KEY);
if (saved) {
  try {
    questions = JSON.parse(saved) || [];
  } catch (e) {
    console.warn('Could not parse saved questions:', e);
    questions = [];
  }
}

// helper: persist locally
function saveQuestions() {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Could not save questions:', e);
  }
}

// ---------- verse/wit helpers (from old) ----------
// ---------- verse/wit helpers (cleaned) ----------
async function getVerseByIntent(intent, questionMap) {
  const keyword = intent
    .replace("ask_for_", "")
    .replace("ask_about_", "")
    .toLowerCase();

  try {
    // Use same pattern as main.js - fetch all questions and filter verses by theme
    const qRes = await fetch("/questions");
    if (!qRes.ok) throw new Error("Failed to fetch questions list");
    const qRows = await qRes.json();

    // Fetch verses for each question in parallel
    const fetches = qRows.map(q =>
      fetch(`/questions/${encodeURIComponent(q.qkey)}`)
        .then(r => r.ok ? r.json() : [])
        .catch(err => {
          console.warn("Failed to fetch question", q.qkey, err);
          return [];
        })
    );

    const results = await Promise.all(fetches);
    const allVerses = results.flat();

    // Filter by theme (case insensitive)
    const matchingVerses = allVerses.filter(v =>
      v.theme && v.theme.toLowerCase().includes(keyword)
    );

    if (!matchingVerses.length) {
      showModal(`No verses found.`);
      return [];
    }

    // Shuffle with Fisher-Yates
    for (let i = matchingVerses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matchingVerses[i], matchingVerses[j]] = [matchingVerses[j], matchingVerses[i]];
    }

    // Return only a few results
    return matchingVerses.slice(0, 3);
  } catch (err) {
    console.error("Error fetching verses by intent:", err);
    return [];
  }
}


async function getIntentFromWit(text) {
  try {
    const response = await fetch("https://api.wit.ai/message?v=20240515&q=" + encodeURIComponent(text), {
      headers: {
        Authorization: "Beare BN74P3DQIXTLCLXUES3Q27KSHXKAFV3G"
      }
    });
    const data = await response.json();
    const intent = data.intents?.[0]?.name;
    console.log("Wit intent:", intent);
    return intent || null;
  } catch (e) {
    console.warn("Wit.ai call failed:", e);
    return null;
  }
}
// ---------- end helpers ----------

// If user is offline or not logged in, treat new posts as drafts
function isDraftAllowed() {
  return (!currentUser || !navigator.onLine);
}

// convert dataURL -> Blob (for sending as FormData)
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// keep track of which response threads are expanded across reloads
// normalize global openQuestionId to string when set. initialize as null.
if(openQuestionId) openQuestionId = String(openQuestionId);

// expandedReplies already in your code — make sure keys are strings
let expandedReplies = JSON.parse(localStorage.getItem('expandedReplies') || '{}');
function saveExpandedReplies() {
  try {
    localStorage.setItem('expandedReplies', JSON.stringify(expandedReplies));
  } catch (e) {
    console.warn('Could not save expanded replies state', e);
  }
}


// Build nested replies from flat server response array (expects parent_response_id)
function buildNestedResponses(flatResponses) {
  const map = Object.create(null);
  flatResponses.forEach(r => {
    map[String(r.id)] = {
      id: r.id,
      text: r.body,
      author: r.username,
      image: r.image || null,
      parent_response_id: r.parent_response_id || null,
      created_at: r.created_at || null,
      replies: []
    };
  });

  const roots = [];
  Object.values(map).forEach(r => {
    if (r.parent_response_id) {
      const parent = map[String(r.parent_response_id)];
      if (parent) parent.replies.push(r);
      else {
        // parent missing — promote to root but log for debugging
        console.warn('Parent missing for response', r.id, 'parent_response_id', r.parent_response_id);
        roots.push(r);
      }
    } else {
      roots.push(r);
    }
  });

  // Sort recursively by created_at ascending (oldest first)
  const sortRec = (arr) => {
    arr.sort((a,b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });
    arr.forEach(x => { if (x.replies && x.replies.length) sortRec(x.replies); });
  };
  sortRec(roots);

  return roots;
}



// helper to focus main reply box inside currently-open question (non-fatal)
function reopenReplyBox() {
  if (!openQuestionId) return;
  const card = document.querySelector(`.question-card[data-qid="${openQuestionId}"]`);
  if (!card) return;
  const expanded = card.querySelector('.question-expanded');
  if (!expanded || expanded.classList.contains('hidden')) return;
  const box = expanded.querySelector('.response-box');
  if (box) {
    box.focus();
    return;
  }
  // if no main box, try to focus any inline response-box (rare)
  const inline = expanded.querySelector('.response .response-box');
  if (inline) inline.focus();
}



// ---------- Load from backend (new behavior) ----------
async function loadFromBackend() {
  if (!currentUser) {
    console.log("Not logged in, skipping backend load");
    renderQuestions();
    return;
  }
  try {
    const res = await fetch("/commune/questions");
    if (!res.ok) throw new Error("Backend /commune/questions failed");
    const data = await res.json();
    console.log("Loaded questions from backend:", data);

    // map backend → local structure (but keep local drafts + cached ones)
    // when mapping rows from /commune/questions
const backendQuestions = data.map(q => ({
  id: String(q.id),
  text: q.text || q.body || '',
  author: q.author || q.username || "Anonymous",
  authorId: q.authorId || q.user_id || q.userId || null,            // <-- important
  authorProfilePic: q.authorProfilePic || q.profile || q.author_profile_pic || null,
  image: q.image || null,
  responses: [],
  aiAnswered: false,
  draft: false,
  favorited: q.favorited === 1 || q.favorited === true,
  favoritesCount: q.favoritesCount ?? q.favorites_count ?? 0,
  created_at: q.created_at || q.createdAt || null
}));


    // merge strategy: keep local drafts and local-only items, replace backend ones by id
    const localDrafts = questions.filter(q => q.draft || !q.id);
    // replace any existing with backend versions
    const merged = backendQuestions.slice();
    for (const d of localDrafts) merged.unshift(d);
    questions = merged;

    // load responses for each backend question
    for (const q of questions) {
      if (!q.id) continue; // skip local-only
      try {
        const respRes = await fetch(`/commune/questions/${q.id}/responses`);
        if (!respRes.ok) throw new Error("responses fetch failed");
        const responses = await respRes.json();
        const nested = buildNestedResponses(Array.isArray(responses) ? responses :  []);
        q.responses = nested
      } catch (err) {
        console.warn("Could not load responses for", q.id, err);
        // leave existing responses as is
      }
    }

    saveQuestions();
    renderQuestions();
  } catch (err) {
    console.error("Could not load from backend:", err);
    // still render local cache
    renderQuestions();
  }
}




// ---------- Posting utilities (support FormData or JSON with base64) ----------
async function postQuestionToServer({ user_id, title, body, imageFile, imageDataUrl }) {
  // If we have a File (imageFile) prefer FormData (multipart)
  try {
    if (imageFile) {
      const fd = new FormData();
      fd.append("user_id", user_id);
      fd.append("title", title);
      fd.append("body", body);
      fd.append("image", imageFile);
      const res = await fetch("/commune/questions", {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    } else if (imageDataUrl) {
      // convert dataURL to blob then multipart (better than JSON), backend with multer will accept
      const blob = dataURLtoBlob(imageDataUrl);
      const fd = new FormData();
      fd.append("user_id", user_id);
      fd.append("title", title);
      fd.append("body", body);
      fd.append("image", blob, 'upload.png');
      const res = await fetch("/commune/questions", {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    } else {
      // No image: send JSON
      const res = await fetch("/commune/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id, title, body })
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // bubble error up
    throw err;
  }
}

async function postResponseToServer({ questionId, user_id, body, parentResponseId = null, imageFile, imageDataUrl }) {
  try {
    let fd;
    if (imageFile || imageDataUrl) {
      fd = new FormData();
      fd.append("user_id", user_id);
      fd.append("body", body);
      fd.append("image", imageFile);
      const res = await fetch(`/commune/questions/${questionId}/responses`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    } else if (imageDataUrl) {
      const blob = dataURLtoBlob(imageDataUrl);
      const fd = new FormData();
      fd.append("user_id", user_id);
      fd.append("body", body);
      fd.append("image", blob, 'upload.png');
      const res = await fetch(`/commune/questions/${questionId}/responses`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    } else {
      const res = await fetch(`/commune/questions/${questionId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id, body, parent_response_id: parentResponseId })
      });
      if (!res.ok) throw res;
      return await res.json();
    }
  } catch (err) { throw err; }
}


// ---------- Add Question (merged behavior) ----------
async function addQuestion(text, imageFile = null, imageDataUrl = null) {
  const draft = isDraftAllowed();
  let aiReply = null;
  const intent = await getIntentFromWit(text).catch(() => null);
  if (intent && typeof questionMap !== 'undefined') {
    const matches = getVerseByIntent(intent, questionMap);
    if (matches.length) {
      aiReply = matches.map(m => `<strong>${m.reference}</strong>: ${m.text}`).join("<br></br>");
    }
  }

  // create local object first
  const localQuestion = {
  id: draft ? Date.now() : null,
  text,
  author: currentUser ? currentUser.username : "Anonymous",
  authorId: currentUser ? currentUser.id : null,          // <-- add
  authorProfilePic: currentUser ? currentUser.profilePic : null,
  image: imageDataUrl || null,
  responses: aiReply ? [{ text: aiReply, author: 'Vale' }] : [],
  aiAnswered: !!aiReply,
  draft,
  favorited: false,
  favoritesCount: 0
};


  questions.unshift(localQuestion);
  saveQuestions();
  renderQuestions();

  if (draft) {
    console.log("Saved as draft, will retry later");
    return;
  }

  // online — try to POST to server
  try {
    const data = await postQuestionToServer({
      user_id: currentUser.id,
      title: text.slice(0, 50),
      body: text,
      imageFile,
      imageDataUrl
    });

    console.log("Saved to backend:", data);

    
    // replace temp local id with backend id & update image URL if backend returned one
    localQuestion.id = data.id;
    if (data.image) localQuestion.image = data.image;
    localQuestion.draft = false;
    if (!localQuestion.authorId && data.user_id) localQuestion.authorId = data.user_id;
    saveQuestions();
    renderQuestions();
  } catch (err) {
    console.error("Backend save failed", err);
    // mark as draft so trySendDrafts will retry later
    localQuestion.draft = true;
    saveQuestions();
    renderQuestions();
  }
}

// ---------- Add Response (merged behavior) ----------
async function addResponse(questionId, parentResponse, text, imageDataUrl = null, replyingTo = null, imageFile = null) {
  const draft = isDraftAllowed();

  const newResp = {
    id: draft ? Date.now() : null,
    text,
    author: currentUser ? currentUser.username : "Anonymous",
    image: imageDataUrl || null,
    replies: [],
    replyingTo
  };

  if (parentResponse) parentResponse.replies.unshift(newResp);
  else {
    const q = questions.find(q => q.id === questionId);
    if (q) q.responses.unshift(newResp);
  }

  saveQuestions();

  if (draft) return;

  try {
    const data = await postResponseToServer({
      questionId,
      user_id: currentUser.id,
      body: text,
      parentResponseId: parentResponse?.id || null,
      imageFile,
      imageDataUrl
    });

    newResp.id = data.id;
    if (data.image) newResp.image = data.image;
    saveQuestions();

    // Immediately rerender only the expanded question
    const card = document.querySelector(`.question-card[data-qid="${questionId}"]`);
    if (card) {
      const expanded = card.querySelector('.question-expanded');
      if (!expanded.classList.contains('hidden')) {
        const respContainer = expanded.querySelector('.responses');
        respContainer.innerHTML = "";
        renderResponses(questions.find(q => q.id === questionId).responses, questionId, respContainer);
      }
    }
  } catch (err) {
    console.error("Response save failed", err);
    // mark as draft (we reuse the draft flag located on the parent question level if desired)
    const q = questions.find(q => q.id === questionId);
    if (q) q.draft = true;
    saveQuestions();
    
    
  }
}




// ---------- Favorites ----------
async function toggleFavorite(questionId, favBtn) {
  if (!currentUser) {
    showModal("You must log in to favorite.");
    return; // <-- prevent local toggle
  }

  const q = questions.find(q => q.id === questionId);
  if (!q) return;

  // local toggle
  q.favorited = !q.favorited;
  q.favoritesCount += q.favorited ? 1 : -1;
  
  updateFavUI(favBtn, q);

  try {
    const res = await fetch(`/commune/questions/${questionId}/favorite`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown");
    
    // sync local with backend
    q.favorited = !!data.favorited;
    q.favoritesCount = data.favoritesCount ?? q.favoritesCount;
    updateFavUI(favBtn, q);
  } catch(err) {
    console.error("Favorite failed:", err);
    // maybe revert UI changes here if you want strict consistency
  }

  saveQuestions();
}

function updateFavUI(favBtn, q) {
  favBtn.textContent = q.favorited ? "★" : "☆";
  const countSpan = favBtn.nextElementSibling;
  if (countSpan) countSpan.textContent = ` ${q.favoritesCount}`;
  favBtn.classList.toggle('favorited', q.favorited);
}




// ---------- Render helpers ----------
function countAllReplies(responses) {
  let count = responses.length;
  responses.forEach(r => {
    count += countAllReplies(r.replies || []);
  });
  return count;
}

function reopenExpandedIfNeeded() {
  if (!openQuestionId) return;
  const card = document.querySelector(`.question-card[data-qid="${openQuestionId}"]`);
  if (!card) return;
  const questionEl = card.querySelector('.question');
  if (questionEl) {
    questionEl.click();
    card.scrollIntoView({ block: 'nearest' });
  }
}

function renderResponses(responses, questionId, container, level = 0) {
  container.innerHTML = ""; // render fresh

  responses.forEach(r => {
    const div = document.createElement('div');
    div.className = "response";
    div.style.marginLeft = `${level * 20}px`;

    // main content
    const p = document.createElement('p');
    p.innerHTML = `<strong>${r.author}:</strong> ${r.text}`;
    div.appendChild(p);

    if (r.image) {
      const img = document.createElement('img');
      img.src = r.image;
      img.className = "post-img";
      div.appendChild(img);
    }

    // reply link (always visible)
    const replyBtn = document.createElement('button');
    replyBtn.textContent = "Reply";
    replyBtn.className = "reply-link";
    div.appendChild(replyBtn);

    let toggleBtn = null;
    let repliesContainer = null;

    // nested replies toggle
    if (r.replies && r.replies.length) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = "toggle-replies-link";
      const totalNested = countAllReplies(r.replies);
      const isOpen = !!expandedReplies[String(r.id)];
      toggleBtn.textContent = `💬 ${totalNested} response${totalNested > 1 ? "s" : ""}${isOpen ? " (open)" : ""}`;
      div.appendChild(toggleBtn);

      repliesContainer = document.createElement('div');
      repliesContainer.className = "replies" + (isOpen ? "" : " hidden");
      div.appendChild(repliesContainer);

      if (isOpen) {
        renderResponses(r.replies, questionId, repliesContainer, level + 1);
      }

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nowHidden = repliesContainer.classList.toggle("hidden");
        const newOpenState = !nowHidden;
        expandedReplies[String(r.id)] = newOpenState;
        saveExpandedReplies();
        if (newOpenState) {
          repliesContainer.innerHTML = "";
          renderResponses(r.replies, questionId, repliesContainer, level + 1);
        }
        toggleBtn.textContent = `💬 ${totalNested} response${totalNested > 1 ? "s" : ""}${newOpenState ? " (open)" : ""}`;
      });
    }

    // reply UI
    replyBtn.addEventListener('click', () => {
      if (div.querySelector('.response-box')) return;
      if (toggleBtn) toggleBtn.style.display = 'none';

      const replyBox = document.createElement('textarea');
      replyBox.placeholder = `Reply to ${r.author}...`;
      replyBox.className = "response-box";

      const fileInput = document.createElement('input');
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "file-input";

      const sendReplyBtn = document.createElement('button');
      sendReplyBtn.textContent = "Send";
      sendReplyBtn.className = "innerbtnc";

      replyBtn.style.display = "none";

      div.appendChild(replyBox);
      div.appendChild(fileInput);
      div.appendChild(sendReplyBtn);

      sendReplyBtn.addEventListener('click', () => {
        const text = replyBox.value.trim();
        const file = fileInput.files[0];
        if (!text && !file) return;

        // ensure parent thread is flagged open before sending
        if (r.id) {
          expandedReplies[String(r.id)] = true;
          saveExpandedReplies();
        }

        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            addResponse(questionId, r, text, reader.result, r.author, file)
              .catch(() => reopenReplyBox());
          };
          reader.readAsDataURL(file);
        } else {
          addResponse(questionId, r, text, null, r.author, null)
            .catch(() => reopenReplyBox());
        }
      });
    });

    container.appendChild(div);
  });
}


function renderQuestions(filter = "") {
  questionFeed.innerHTML = "";

  questions
   
    .filter(q => !q.draft || (q.draft && currentUser && q.author === currentUser.username))
    .filter(q => (q.text || "").toLowerCase().includes((filter || "").toLowerCase()))
    .forEach((q) => {
      const card = document.createElement('div');
      card.className = 'question-card';
            // previous: card.dataset.qid = q.id || '';
      if (q.draft || !q.id) {
        // local draft — prefix so dataset doesn't collide with server numerical ids
        card.dataset.qid = `local-${q.id || Date.now()}`;
      } else {
        card.dataset.qid = String(q.id);
      }
      // might be null for local drafts

      // Question text
      const questionText = document.createElement('p');
      questionText.className = 'question';
      questionText.textContent = `“${q.text}”`;
      questionText.innerHTML = questionText.innerHTML.replace(/“(.*?)”/, '“<em>$1</em>”');
            
      // Profile pic in chat bubble
const profileImg = document.createElement('img');
profileImg.src = q.authorProfilePic || '/images/default-avatar.png';
profileImg.className = 'bubble-pic';
profileImg.style.cursor = 'pointer';

// Click leads to profile page
profileImg.addEventListener('click', (e) => {
  e.stopPropagation(); // don't open the question

  // Try multiple possible fields (normalize across layers)
  const profileId =
    q.authorId ?? q.user_id ?? q.userId ?? q.senderId ?? q.author_id ?? null;

  // If no authorId and it's a local draft, let it point to current user when available
  const finalId = profileId || (q.draft && currentUser ? currentUser.id : null);

  if (finalId) {
    window.location.href = `/profile-view.html?id=${encodeURIComponent(finalId)}`;
    return;
  }

  // Helpful debug so we can see what we're missing instead of blind guessing
  console.warn("Profile click failed — no author id present on question:", q);
  showModal("User missing 😭");
});



card.appendChild(profileImg);


      // Meta info row
      const meta = document.createElement('div');
      meta.className = 'meta';

      // favorite button
      const favBtn = document.createElement('button');
      favBtn.textContent = q.favorited ? "★" : "☆";
      favBtn.className = "favorite-btn";
        favBtn.classList.toggle('favorited', q.favorited);

      const favCount = document.createElement('span');
favCount.className = "favorite-count";
favCount.textContent = q.favoritesCount ? ` ${q.favoritesCount}` : " 0";

    
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        toggleFavorite(q.id, favBtn);
      });

      const info = document.createElement('span');
      const total = countAllReplies(q.responses || []);
      info.textContent = `👤 ${q.author} · ${total} response${total !== 1 ? 's' : ''}`;
      meta.appendChild(info);
      meta.appendChild(favBtn);
      meta.appendChild(favCount);


      const badge = document.createElement('span');
      badge.className = "tag-badge";
      badge.textContent = q.draft
        ? "📝 Draft (not published)"
        : q.aiAnswered
          ? "🤖 Vale has answered"
          : "💬 Tap to open";
      meta.appendChild(badge);

      card.appendChild(questionText);
      if (q.image) {
        const img = document.createElement('img');
        img.src = q.image;
        img.className = "post-img";
        card.appendChild(img);
      }
      card.appendChild(meta);

      const expanded = document.createElement('div');
      expanded.className = 'question-expanded hidden';

      questionText.addEventListener('click', () => {
        questionText.classList.remove("open");
        toggleExpanded()}
      );
      badge.addEventListener('click', () => toggleExpanded());

      function toggleExpanded() {
        const nowOpening = expanded.classList.contains('hidden');
        expanded.classList.toggle('hidden');
        expanded.innerHTML = "";

        if (nowOpening) {
          openQuestionId = q.id ? String(q.id) : null;
          meta.style.display = "none";

          // close button
          const closeBtn = document.createElement('button');
          closeBtn.textContent = "✖";
          closeBtn.className = "close-btn";
          expanded.appendChild(closeBtn);

          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            expanded.classList.add('hidden');
            questionText.classList.remove("open");
            meta.style.display = "flex";
            openQuestionId = null;
          });
          questionText.classList.add("open")
          questionFeed.classList.add("open")


          // Check if user can edit (only if they posted the question)
      const canEdit = currentUser && q.author === currentUser.username && q.id;

      // main write response box ABOVE replies
      const box = document.createElement('textarea');
      box.placeholder = "Write a response...";
      box.className = "response-box";

      const fileInput = document.createElement('input');
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "file-input";

      const actionsRow = document.createElement('div');
      actionsRow.className = "actions-row";

      const sendBtn = document.createElement('button');
      sendBtn.textContent = "Send";
      sendBtn.className = "innerbtnc";
      actionsRow.appendChild(fileInput);
      actionsRow.appendChild(sendBtn);

     // Check if user can edit/delete (only author)

      if (canEdit) {
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = "Edit Question";
        editBtn.className = "edit-btn";
        actionsRow.appendChild(editBtn);

        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleEditMode();
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete Question";
        deleteBtn.className = "delete-btn";
        actionsRow.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const confirmDel = confirm("Are you sure you want to delete this question?");
          if (!confirmDel) return;

          // Optimistically remove locally
          questions = questions.filter(qq => qq.id !== q.id);
          saveQuestions();
          renderQuestions();

          // Sync with backend
          try {
            const res = await fetch(`/commune/questions/${q.id}`, {
              method: "DELETE",
              credentials: "include"
            });
            const data = await res.json();
            if (!data.success) showModal("Delete failed: " + (data.error || "unknown"));
          } catch (err) {
            console.error('Delete failed:', err);
            showModal("Failed to delete on server");
          }
        });
      }



      expanded.appendChild(box);
      expanded.appendChild(actionsRow);
      card.appendChild(expanded);

      const respContainer = document.createElement('div');
      respContainer.className = "responses";
      expanded.appendChild(respContainer);

      renderResponses(q.responses || [], q.id, respContainer);

      sendBtn.addEventListener('click', async (e) => {
  e.stopPropagation();

  if (box.classList.contains('editing')) {
    // EDIT mode
    const newText = box.value.trim();
    if (!newText) return;

    try {
      const res = await fetch(`/commune/questions/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: newText })
      });
      const data = await res.json();
      if (data.success) {
        q.text = newText;
        q.draft = false;
        saveQuestions();
        renderQuestions();
        showModal('Question updated!');
      } else {
        showModal('Failed to update question: ' + (data.error || 'unknown'));
      }
    } catch (err) {
      console.error('Edit failed:', err);
      showModal('Failed to update question');
    }
  } else {
    // RESPONSE mode (old logic)
    const text = box.value.trim();
    const file = fileInput.files[0];
    if (!text && !file) return;
    addResponse(q.id, null, text, file ? await fileToDataURL(file) : null, null, file);
    box.value = "";
    fileInput.value = "";
  }
});


      // Edit mode functionality
      let sendClickHandler; // keep reference

      function toggleEditMode() {
        if (!q.id) return showModal("Drafts must be published first before editing.");
        const isEditing = box.classList.contains('editing');

        if (!isEditing) {
          box.classList.add('editing');
          box.value = q.text;
          box.placeholder = "Edit your question...";
          sendBtn.textContent = "Save Changes";
          sendBtn.classList.add('save-edit');

          fileInput.style.display = 'none';
          editBtn.textContent = "Cancel Edit";

          // Remove previous send listener if any
          if (sendClickHandler) sendBtn.removeEventListener('click', sendClickHandler);

          sendClickHandler = async (e) => {
            e.stopPropagation();
            const newText = box.value.trim();
            if (!newText) return;

            try {
              const res = await fetch(`/commune/questions/${q.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ body: newText })
              });

              const data = await res.json();
              if (data.success) {
                q.text = newText;
                q.draft = false;
                saveQuestions();
                renderQuestions();
                showModal('Question updated!');
              } else {
                showModal('Failed to update question: ' + (data.error || 'unknown'));
              }
            } catch (err) {
              console.error('Edit failed:', err);
              showModal('Failed to update question');
            }
          };

          sendBtn.addEventListener('click', sendClickHandler);

        } else {
          // Exit edit mode
          box.classList.remove('editing');
          box.value = '';
          box.placeholder = "Write a response...";
          sendBtn.textContent = "Send";
          sendBtn.classList.remove('save-edit');
          fileInput.style.display = 'inline-block';
          editBtn.textContent = "Edit Question";

          if (sendClickHandler) sendBtn.removeEventListener('click', sendClickHandler);
          sendClickHandler = null;
        }
      }


        } else {
          meta.style.display = "flex";
          openQuestionId = null;
        }
      }
      questionFeed.appendChild(card);    
    }
    
  );

  reopenExpandedIfNeeded();
}    
    // ---------- Create top-level question from input (askInput) ----------
askInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const text = askInput.value.trim();
    if (text !== '') {
      // top-level doesn't have file input in this UI, but you could add one if desired
      addQuestion(text);
      askInput.value = '';
    }
  }
});

askInput?.addEventListener('input', () => {
  renderQuestions(askInput.value.trim());
});

// Hashtag search
document.querySelectorAll('.tags span').forEach(tag => {
  tag.addEventListener('click', () => {
    const tagText = tag.textContent.replace(/^#/, ''); // remove leading #
    askInput.value = tagText;
    renderQuestions(tagText);
  });
});


// ---------- Draft retry ----------
window.addEventListener("online", trySendDrafts);
window.addEventListener("DOMContentLoaded", () => {
  loadFromBackend();
  trySendDrafts();
});

function reopenReplyBox() {
  if (!openReply) return;
  const card = document.querySelector(`.question-card[data-qid="${openReply.qid}"]`);
  if (!card) return;
  const respDiv = card.querySelector(`.response[data-rid="${openReply.respId}"]`);
  if (!respDiv) return;
  respDiv.querySelector('.reply-link')?.click();
}
async function trySendDrafts() {
  if (!currentUser) return; // still can’t publish
  let changed = false;

  // Copy questions to iterate safely while removing drafts
  for (const q of [...questions]) {
    if (q.draft) {
      try {
        // Convert data URL to blob if needed
        let imageFile = null;
        if (q._file) imageFile = q._file;
        else if (q.image && q.image.startsWith('data:')) imageFile = dataURLtoBlob(q.image);

        const result = await postQuestionToServer({
          user_id: currentUser.id,
          title: q.text.slice(0, 50),
          body: q.text,
          imageFile: imageFile instanceof Blob && !(imageFile instanceof File) ? imageFile : imageFile,
          imageDataUrl: (q.image && q.image.startsWith('data:')) ? q.image : null
        });

        // Draft was successfully posted, remove it from local questions
        questions = questions.filter(qq => qq !== q);

        // Add the real question returned from backend
        questions.push({
          id: result.id,
          user_id: currentUser.id,
          title: q.text.slice(0, 50),
          body: q.text,
          image: result.image || null,
          favorited: false,
          favoritesCount: 0,
          draft: false,
          author: currentUser.username
        });

        changed = true;
      } catch (err) {
        console.warn("Draft publish failed for question:", q.id, err);
        // keep as draft; move on
      }
    }

    // handle reply drafts similarly if you need
  }

  if (changed) {
    saveQuestions();
    renderQuestions();
  }
}


// Export initial render if you loaded local cache before backend
renderQuestions();
