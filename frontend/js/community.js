// community-merged.js — merged version with offline drafts + image support
let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}

window.API_BASE = window.API_BASE || (window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://holyverse-s5s1.onrender.com");
const API_BASE = window.API_BASE;

// ensure user is signed in
const currentUser = JSON.parse(storage.getItem("user")) || {};
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




const askInput = document.querySelector('.ask-input');
const questionFeed = document.querySelector('.question-feed');

const STORAGE_KEY = 'community_questions';
let questions = [];
let openQuestionId = null; // keep which question is open after re-render
let openReply = null; // top of file, as a global tracker

function updateCommunityPostCount() {
  const published = questions.filter(q => !q.draft).length;
  try {
    localStorage.setItem("community_posts_count", published);
    console.log(`💬 Community posts count updated to ${published}`);
  } catch (e) {
    // ignore storage errors (private browsing)
  }
}

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
    updateCommunityPostCount(); // Update count whenever questions are saved
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
    const qRes = await fetch(`${API_BASE}/questions`);
    if (!qRes.ok) throw new Error("Failed to fetch questions list");
    const qRows = await qRes.json();

    // Fetch verses for each question in parallel
    const fetches = qRows.map(q =>
      fetch(`${API_BASE}/questions/${encodeURIComponent(q.qkey)}`)
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
    const res = await fetch(`${API_BASE}/commune/questions`);
    if (!res.ok) throw new Error("Backend /commune/questions failed");
    const data = await res.json();
    const {questions: qList, warning} = data;
    if (warning) { showModal(warning); }



    // map backend → local structure (but keep local drafts + cached ones)
    // when mapping rows from /commune/questions
const backendQuestions = qList.map(q => ({
  id: String(q.id),
  text: q.text || q.body || q.title || '',
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

    // after fetching backendQuestions
for (const bq of backendQuestions) {
  const local = questions.find(q => q.id === bq.id);
  if (local) {
    bq.favorited = local.favorited;
    bq.favoritesCount = local.favoritesCount;
  }
}


    // merge strategy: keep local drafts and local-only items, replace backend ones by id
    const localDrafts = questions.filter(q => q.draft || !q.id);
questions = [...localDrafts, ...backendQuestions];

    // replace any existing with backend versions
    const merged = backendQuestions.slice();
    for (const d of localDrafts) merged.unshift(d);
    questions = merged;

    // load responses for each backend question
    for (const q of questions) {
      if (!q.id) continue; // skip local-only
      try {
        const respRes = await fetch(`${API_BASE}/commune/questions/${q.id}/responses`);
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
      const res = await fetch(`${API_BASE}/commune/questions`, {
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
      const res = await fetch(`${API_BASE}/commune/questions`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    } else {
      // No image: send JSON
      const res = await fetch(`${API_BASE}/commune/questions`, {
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
      const res = await fetch(`${API_BASE}/commune/questions/${questionId}/responses`, {
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
      const res = await fetch(`${API_BASE}/commune/questions/${questionId}/responses`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    } else {
      const res = await fetch(`${API_BASE}/commune/questions/${questionId}/responses`, {
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
    const res = await fetch(`${API_BASE}/commune/questions/${questionId}/favorite`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown");
    
    // sync local with backend
    q.favorited = !!data.favorited;
    q.favoritesCount = data.favoritesCount ?? q.favoritesCount;
    
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

      const replyWrapper = document.createElement('div');
      replyWrapper.style.cssText = 'display:flex; gap:0.5rem; align-items:flex-end; margin-bottom:1rem;';

      const replyBox = document.createElement('textarea');
      replyBox.placeholder = `Reply to ${r.author}...`;
      replyBox.className = "ask-input";
      replyBox.rows = 2;
      replyBox.style.cssText = 'flex:1; padding:0.75rem; border-radius:20px; border:1px solid var(--accent); resize:none; max-height:80px;';

      const fileInput = document.createElement('input');
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";

      const fileBtn = document.createElement('button');
      fileBtn.innerHTML = '<i class="fa-solid fa-image"></i>';
      fileBtn.className = "post-action-btn image-btn";
      fileBtn.title = "Add image";
      fileBtn.onclick = () => fileInput.click();

      const sendReplyBtn = document.createElement('button');
      sendReplyBtn.textContent = "Send";
      sendReplyBtn.className = "post-action-btn send-btn";

      replyBtn.style.display = "none";

      replyWrapper.appendChild(replyBox);
      replyWrapper.appendChild(fileInput);
      replyWrapper.appendChild(fileBtn);
      replyWrapper.appendChild(sendReplyBtn);
      div.appendChild(replyWrapper);

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

// Apply milestone border
const profileId = q.authorId ?? q.user_id ?? q.userId ?? q.senderId ?? q.author_id ?? null;
const finalId = profileId || (q.draft && currentUser ? currentUser.id : null);
if (finalId) {
  const borderStyle = getUserBorderStyle(finalId);
  if (borderStyle) {
    profileImg.style.cssText += borderStyle;
  }
}

// Click leads to profile page
profileImg.addEventListener('click', (e) => {
  e.stopPropagation(); // don't open the question

  if (finalId) {
    window.location.href = `/profile-view.html?id=${encodeURIComponent(finalId)}`;
    return;
  }

  // Helpful debug so we can see what we're missing instead of blind guessing
  console.warn("Profile click failed — no author id present on question:", q);
  showModal("User information not available.");
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
      
      // Check if author is theology contributor
      const contributorBadge = q.isTheologyContributor ? ' <span class="theology-badge" title="Theology Contributor">📘</span>' : '';
      
      info.innerHTML = `👤 ${q.author}${contributorBadge} · ${total} response${total !== 1 ? 's' : ''}`;
      meta.appendChild(info);
      meta.appendChild(favBtn);
      meta.appendChild(favCount);

      // Report button
      if (!q.draft) {
        const reportBtn = document.createElement('button');
        reportBtn.textContent = "⚠️";
        reportBtn.className = "report-btn";
        reportBtn.title = "Report this post";
        reportBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          reportContent(q.id, 'post');
        });
        meta.appendChild(reportBtn);
      }

      const badge = document.createElement('span');
      badge.className = "tag-badge";
      badge.textContent = q.draft
        ? "📝 Draft (not published)"
        : q.aiAnswered
          ? "🤖 Vale has answered"
          : "💬 Tap to open";
      meta.appendChild(badge);

      card.appendChild(questionText);
      // Check both image and image_url fields (backend returns image_url)
      const imageUrl = q.image_url || q.image;
      if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = "post-img";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.style.marginTop = "10px";
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

          // Show disclaimer if theology contributor
          if (q.isTheologyContributor) {
            const disclaimer = document.createElement('div');
            disclaimer.className = "theology-disclaimer";
            disclaimer.innerHTML = `
              <span class="theology-badge">📘</span>
              <em>This is an interpretation from a theology contributor. Reflect personally.</em>
            `;
            expanded.appendChild(disclaimer);
          }

          // Check if user can edit (only if they posted the question)
      const canEdit = currentUser && q.author === currentUser.username && q.id;

      // main write response box ABOVE replies
      const responseWrapper = document.createElement('div');
      responseWrapper.style.cssText = 'display:flex; gap:0.5rem; align-items:flex-end; margin-bottom:1rem;';

      const box = document.createElement('textarea');
      box.placeholder = "Write a response...";
      box.className = "ask-input";
      box.rows = 2;
      box.style.cssText = 'flex:1; padding:0.75rem; border-radius:20px; border:1px solid var(--accent); resize:none; max-height:80px;';

      const fileInput = document.createElement('input');
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";

      const fileBtn = document.createElement('button');
      fileBtn.innerHTML = '<i class="fa-solid fa-image"></i>';
      fileBtn.className = "post-action-btn image-btn";
      fileBtn.title = "Add image";
      fileBtn.onclick = () => fileInput.click();

      const sendBtn = document.createElement('button');
      sendBtn.textContent = "Send";
      sendBtn.className = "post-action-btn send-btn";

      responseWrapper.appendChild(box);
      responseWrapper.appendChild(fileInput);
      responseWrapper.appendChild(fileBtn);
      responseWrapper.appendChild(sendBtn);

      const actionsRow = document.createElement('div');
      actionsRow.className = "actions-row";

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
          showConfirm("Are you sure you want to delete this question?", async () => {
            // Optimistically remove locally
            questions = questions.filter(qq => qq.id !== q.id);
            saveQuestions();
            renderQuestions();

            // Sync with backend
            try {
              const res = await fetch(`${API_BASE}/commune/questions/${q.id}`, {
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
        });
      }



      expanded.appendChild(responseWrapper);
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
      const res = await fetch(`${API_BASE}/commune/questions/${q.id}`, {
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
    addResponse(q.id, null, text, null, null, file);
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
              const res = await fetch(`${API_BASE}/commune/questions/${q.id}`, {
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
  updateCommunityPostCount();
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

// ============================================
// HELPER: Get User Milestone Border
// ============================================
function getUserBorderStyle(userId) {
  if (!userId) return '';
  const borderLevel = localStorage.getItem(`profileBorderLevel:${userId}`);
  
  if (borderLevel === "legendary") {
    return 'border:4px solid transparent; background:linear-gradient(white, white) padding-box, linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box;';
  } else if (borderLevel === "gold") {
    return 'border:4px solid gold; box-shadow:0 0 15px rgba(255,215,0,0.6);';
  } else if (borderLevel === "silver") {
    return 'border:4px solid silver; box-shadow:0 0 10px rgba(192,192,192,0.6);';
  } else if (borderLevel === "bronze") {
    return 'border:4px solid #cd7f32; box-shadow:0 0 8px rgba(205,127,50,0.5);';
  }
  return '';
}

// ============================================
// COMMUNITY TABS SYSTEM
// ============================================

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const tabs = {
    'community': 'communityTab',
    'testimony': 'testimonyTab',
    'groups': 'groupsTab'
  };
  
  document.getElementById(tabs[tabName]).classList.add('active');
  event.target.classList.add('active');
  
  // Load data for specific tab
  if (tabName === 'testimony') {
    loadTestimonies();
  } else if (tabName === 'groups') {
    loadGroups();
  }
}

// ============================================
// TESTIMONY FUNCTIONS
// ============================================

let selectedTags = [];

function toggleTag(button) {
  const tag = button.getAttribute('data-tag');
  
  if (button.classList.contains('selected')) {
    button.classList.remove('selected');
    selectedTags = selectedTags.filter(t => t !== tag);
  } else {
    button.classList.add('selected');
    selectedTags.push(tag);
  }
}

async function submitTestimony() {
  const text = document.getElementById("testimonyText").value.trim();
  const isAnonymous = document.getElementById("anonymousTestimony").checked;
  
  if (!text) {
    showModal("Please share your story");
    return;
  }
  
  if (selectedTags.length === 0) {
    showModal("Please select at least one tag");
    return;
  }
  
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{"username": "Guest"}');
    
    const response = await fetch(`${API_BASE}/api/testimonies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        tags: selectedTags,
        username: isAnonymous ? "Anonymous" : user.username,
        userId: user.id || null
      })
    });
    
    if (response.ok) {
      document.getElementById("testimonyText").value = "";
      document.getElementById("anonymousTestimony").checked = false;
      selectedTags = [];
      document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('selected'));
      loadTestimonies();
      showModal("Testimony submitted! It will be reviewed before publishing. 🙏");
    }
  } catch (error) {
    console.error("Error submitting testimony:", error);
    showModal("Failed to submit. Please try again.");
  }
}

async function loadTestimonies() {
  try {
    const response = await fetch(`${API_BASE}/api/testimonies`);
    const testimonies = await response.json();
    
    const feed = document.getElementById("testimoniesFeed");
    feed.innerHTML = "";
    
    if (testimonies.length === 0) {
      feed.innerHTML = "<p style='text-align:center; opacity:0.6;'>No testimonies yet. Be the first to share your story.</p>";
      return;
    }
    
    testimonies.forEach(test => {
      const card = document.createElement("div");
      card.className = "testimony-card";
      
      const tagHTML = test.tags.map(tag => `<span class="story-tag">${tag}</span>`).join('');
      
      card.innerHTML = `
        <div class="testimony-header">
          <span>👤 ${test.username}</span>
          <div class="testimony-tags">${tagHTML}</div>
        </div>
        <p class="testimony-text">${test.text}</p>
        <div class="testimony-footer">
          <span>${new Date(test.created_at).toLocaleDateString()}</span>
        </div>
      `;
      feed.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading testimonies:", error);
  }
}

// ============================================
// GROUPS FUNCTIONS
// ============================================

const availableGroups = [
  "Catholic", "Protestant", "Orthodox", "Pentecostal", 
  "Baptist", "Methodist", "Lutheran", "Anglican",
  "Non-denominational", "Young Adults", "College Students",
  "Parents", "Singles", "Recovery"
];

function showJoinGroupsModal() {
  const modal = document.getElementById("joinGroupsModal");
  const selection = document.getElementById("groupsSelection");
  
  selection.innerHTML = "";
  availableGroups.forEach(group => {
    const div = document.createElement("div");
    div.className = "group-option";
    div.innerHTML = `
      <label>
        <input type="checkbox" value="${group}" />
        ${group}
      </label>
    `;
    selection.appendChild(div);
  });
  
  modal.classList.remove("hidden");
}

function closeJoinGroupsModal() {
  document.getElementById("joinGroupsModal").classList.add("hidden");
}

async function saveGroupSelections() {
  const selected = Array.from(document.querySelectorAll('#groupsSelection input:checked'))
    .map(input => input.value);
  
  if (selected.length === 0) {
    showModal("Please select at least one group");
    return;
  }
  
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    
    const response = await fetch(`${API_BASE}/api/user-groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        groups: selected
      })
    });
    
    if (response.ok) {
      closeJoinGroupsModal();
      loadGroups();
    }
  } catch (error) {
    console.error("Error saving groups:", error);
  }
}

async function loadGroups() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    
    const response = await fetch(`${API_BASE}/api/user-groups/${user.id}`);
    const userGroups = await response.json();
    
    const list = document.getElementById("yourGroupsList");
    
    if (!userGroups || userGroups.groups.length === 0) {
      list.innerHTML = "<p style='opacity:0.6; text-align:center;'>You haven't joined any groups yet</p>";
    } else {
      list.innerHTML = userGroups.groups.map(group => 
        `<div class="group-item">${group}</div>`
      ).join('');
    }
  } catch (error) {
    console.error("Error loading groups:", error);
  }
}

// ============================================
// REPORT SYSTEM
// ============================================

async function reportContent(contentId, contentType) {
  const reasons = [
    "Sexual content",
    "Hate / harassment",
    "Misinformation",
    "Spam",
    "Self-harm / crisis",
    "Other"
  ];
  
  const reason = prompt("Why are you reporting?\n\n" + reasons.map((r, i) => `${i+1}. ${r}`).join("\n") + "\n\nEnter number or text:");
  
  if (!reason) return;
  
  const selectedReason = reasons[parseInt(reason) - 1] || reason;
  
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    
    const response = await fetch(`${API_BASE}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId,
        contentType,
        reason: selectedReason,
        reporterId: user.id || "guest"
      })
    });
    
    if (response.ok) {
      showModal("✓ Report submitted. Thank you for helping keep our community safe.");
    } else {
      const errorData = await response.json();
      showModal(`Failed to submit report: ${errorData.error || "Unknown error"}`);
    }
  } catch (error) {
    showModal("Failed to submit report. Please try again.");
  }
}

// ============================================
// COMMUNITY GROUPS MANAGEMENT
// ============================================

let userGroups = [];

let allGroups = []; // Store all groups for search filtering

async function loadGroups() {
  try {
    const response = await fetch(`${API_BASE}/api/groups`);
    if (!response.ok) throw new Error("Failed to load groups");
    
    allGroups = await response.json();
    renderGroups(allGroups);
  } catch (error) {
    console.error("Error loading groups:", error);
  }
}

function renderGroups(groups) {
  const groupsList = document.getElementById("groupsList");
  if (!groupsList) return;
  
  groupsList.innerHTML = "";
  
  if (!groups || groups.length === 0) {
    groupsList.innerHTML = "<p style='text-align:center; opacity:0.6;'>No groups found</p>";
    return;
  }
  
  groups.forEach(group => {
    const card = document.createElement("div");
    card.className = "group-card";
    card.innerHTML = `
      <div class="group-header">
        <span class="group-icon" style="font-size:2rem;">${group.icon || "👥"}</span>
        <div class="group-info">
          <h3>${group.name}</h3>
          <p style="opacity:0.7; margin:0.25rem 0;">${group.description || "No description"}</p>
          <small style="opacity:0.6;">Created by ${group.creator_name || "Unknown"}</small>
        </div>
      </div>
      <div class="group-actions">
        <button class="innerbtn" onclick="viewGroup('${group.id}')">View</button>
        <button class="innerbtn" onclick="joinGroup('${group.id}', '${group.name}')">Join</button>
      </div>
    `;
    groupsList.appendChild(card);
  });
}

function filterGroups() {
  const searchTerm = document.getElementById("groupSearch").value.toLowerCase();
  const filtered = allGroups.filter(g => 
    (g.name || "").toLowerCase().includes(searchTerm) ||
    (g.description || "").toLowerCase().includes(searchTerm) ||
    (g.creator_name || "").toLowerCase().includes(searchTerm)
  );
  renderGroups(filtered);
}

window.filterGroups = filterGroups;

let currentGroupId = null;
let currentGroupData = null;

async function viewGroup(groupId) {
  try {
    currentGroupId = groupId;
    
    // Fetch group details
    const groupResponse = await fetch(`${API_BASE}/api/groups/${groupId}`);
    if (!groupResponse.ok) throw new Error("Failed to load group");
    currentGroupData = await groupResponse.json();
    
    // Hide tabs and main content
    document.querySelector('.community-tabs')?.style.setProperty('display', 'none');
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    
    let groupViewSection = document.getElementById('groupViewSection');
    if (!groupViewSection) {
      groupViewSection = document.createElement('div');
      groupViewSection.id = 'groupViewSection';
      groupViewSection.style.padding = '1rem';
      const app = document.getElementById('app');
      if (app) app.appendChild(groupViewSection);
    }
    
    groupViewSection.style.display = 'flex';
    groupViewSection.style.flexDirection = 'column';
    groupViewSection.style.height = '100vh';
    groupViewSection.style.padding = '0';
    groupViewSection.innerHTML = `
      <!-- Group Header (clickable for details) - FIXED -->
      <div onclick="showGroupDetails()" style="position:sticky; top:0; z-index:10; cursor:pointer; background:linear-gradient(135deg, var(--accent) 0%, rgba(255,107,53,0.6) 100%); padding:1rem; border-radius:0; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:1rem;">
          <span style="font-size:3rem;">${currentGroupData.icon || "👥"}</span>
          <div>
            <h2 style="margin:0; font-size:1.5rem;">${currentGroupData.name}</h2>
            <small style="opacity:0.9;">${currentGroupData.member_count || 0} members • Tap for info</small>
          </div>
        </div>
        <button class="innerbtn" onclick="event.stopPropagation(); closeGroupView()" style="padding:0.5rem 1rem;">← Back</button>
      </div>
      
      <!-- Chat Feed - SCROLLABLE -->
      <div id="groupChatFeed" style="flex:1; background:rgba(0,0,0,0.3); padding:1rem; overflow-y:auto;">
        <div style="text-align:center; padding:2rem; opacity:0.6;">
          <div style="font-size:3rem; margin-bottom:1rem;">💬</div>
          Loading messages...
        </div>
      </div>
      
      <!-- Message Input - FIXED -->
      <div style="position:sticky; bottom:0; z-index:10; background:var(--bg-color); border-top:1px solid rgba(255,107,53,0.3); padding:1rem; display:flex; gap:0.5rem; align-items:flex-end;">
        <textarea id="groupMessageInput" placeholder="Type a message..." rows="1" style="flex:1; padding:0.75rem; border-radius:20px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,107,53,0.3); color:var(--text-color); resize:none; max-height:100px; font-family:inherit;" oninput="this.style.height='auto'; this.style.height=this.scrollHeight+'px';" onkeypress="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); postToGroup();}"></textarea>
        <button class="innerbtn" onclick="postToGroup()" style="padding:0.75rem 1.5rem; border-radius:20px;">Send</button>
      </div>
    `;
    
    // Load posts
    loadGroupPosts();
    
  } catch (error) {
    console.error("Error viewing group:", error);
    showModal("Failed to load group details.");
  }
}

function closeGroupView() {
  const groupView = document.getElementById('groupViewSection');
  if (groupView) groupView.style.display = 'none';
  
  document.querySelector('.community-tabs')?.style.setProperty('display', '');
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = '');
  
  currentGroupId = null;
  currentGroupData = null;
}

function showGroupDetails() {
  if (!currentGroupData) return;
  
  let rulesHtml = "";
  if (currentGroupData.rules && currentGroupData.rules.length > 0) {
    rulesHtml = "<h3 style='margin-top:1.5rem; color:var(--accent);'>Group Rules:</h3><ol style='line-height:1.8;'>";
    currentGroupData.rules.forEach(rule => {
      rulesHtml += `<li>${escapeModalHtml(rule.rule_text)}</li>`;
    });
    rulesHtml += "</ol>";
  }
  
  // Create custom modal with HTML content
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:500px;">
      <span class="close" onclick="this.closest('.custom-modal').remove()">&times;</span>
      <div style="text-align:center;">
        <div style="font-size:4rem; margin-bottom:1rem;">${currentGroupData.icon || "👥"}</div>
        <h2 style="margin:0 0 0.5rem 0;">${currentGroupData.name}</h2>
        <p style="opacity:0.7; margin-bottom:1rem;">${currentGroupData.description || ""}</p>
        <div style="display:inline-block; background:rgba(255,107,53,0.2); padding:0.5rem 1rem; border-radius:20px;">
          <strong>${currentGroupData.member_count || 0}</strong> members
        </div>
        ${rulesHtml}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

async function loadGroupPosts() {
  try {
    const response = await fetch(`${API_BASE}/api/groups/${currentGroupId}/posts`);
    const posts = await response.json();
    renderGroupPosts(posts);
  } catch (error) {
    console.error("Error loading posts:", error);
    document.getElementById('groupChatFeed').innerHTML = '<p style="text-align:center; opacity:0.6; padding:2rem;">Failed to load messages</p>';
  }
}

function renderGroupPosts(posts) {
  const feed = document.getElementById('groupChatFeed');
  if (!feed) return;
  
  // Handle error responses or non-array data
  if (!Array.isArray(posts) || posts.length === 0) {
    feed.innerHTML = '<div style="text-align:center; padding:3rem; opacity:0.6;"><div style="font-size:3rem; margin-bottom:1rem;">💬</div><p>No messages yet.<br/>Start the conversation!</p></div>';
    return;
  }
  
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  
  feed.innerHTML = posts.map(post => {
    const isOwn = String(post.user_id) === String(user.id) || post.users?.username === user.username;
    const time = new Date(post.created_at);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageText = post.message || post.body || '';
    const postUserId = post.user_id || post.users?.id || null;
    const profilePic = post.profile_pic || post.users?.profile_pic || '/images/default-avatar.png';
    
    // Get border style for profile pic
    const borderStyle = postUserId ? getUserBorderStyle(postUserId) : '';
    
    return `
      <div style="margin-bottom:1rem; display:flex; gap:8px; ${isOwn ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
        ${!isOwn ? `<img src="${profilePic}" class="bubble-pic" onclick="window.location.href='/profile-view.html?id=${encodeURIComponent(postUserId)}'" style="cursor:pointer; ${borderStyle}" />` : ''}
        <div class="bubble ${isOwn ? 'you' : 'them'}" style="max-width:70%; display:inline-flex; flex-direction:column;">
          ${!isOwn ? `<span class="bubble-username">${escapeModalHtml(post.username || "Anonymous")}</span>` : ''}
          <span class="bubble-message" style="line-height:1.5; word-wrap:break-word; white-space:pre-wrap;">${escapeModalHtml(messageText)}</span>
          <span style="font-size:0.7rem; opacity:0.7; margin-top:0.25rem; align-self:flex-end;">${timeStr}</span>
        </div>
        ${isOwn ? `<img src="${profilePic}" class="bubble-pic" onclick="window.location.href='/profile-view.html?id=${encodeURIComponent(postUserId)}'" style="cursor:pointer; ${borderStyle}" />` : ''}
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  feed.scrollTop = feed.scrollHeight;
}

async function postToGroup() {
  const textarea = document.getElementById('groupMessageInput');
  const text = textarea?.value.trim();
  
  if (!text) return;
  
  if (!currentGroupId) {
    showModal("Group not found");
    return;
  }
  
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    
    const response = await fetch(`${API_BASE}/api/groups/${currentGroupId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: String(user.id),
        username: user.username || "Anonymous",
        body: text
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to post");
    }
    
    textarea.value = "";
    textarea.style.height = 'auto';
    
    // Reload posts
    loadGroupPosts();
    
  } catch (error) {
    console.error("Error posting to group:", error);
    showModal("Failed to send message. Please try again.");
  }
}

async function joinGroup(groupId, groupName) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    
    const response = await fetch(`${API_BASE}/api/groups/${groupId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        username: user.username || "Guest"
      })
    });
    
    if (response.ok) {
      showModal(`✓ Joined ${groupName}!`);
      loadUserGroups();
    } else {
      const error = await response.json();
      showModal(error.error || "Failed to join group");
    }
  } catch (error) {
    console.error("Error joining group:", error);
    showModal("Failed to join group. Please try again.");
  }
}

async function createGroup() {
  showPrompt("Group name:", "", async (name) => {
    if (!name) return;
    
    showPrompt("Group description (optional):", "", async (description) => {
      showPrompt("Group icon/emoji (default: 👥):", "👥", async (iconEmoji) => {
        showPrompt("Group rules (separate with |):\nExample: Be kind|No spam|Keep it family-friendly", "", async (rulesStr) => {
  const rules = rulesStr ? rulesStr.split("|").map(r => r.trim()).filter(r => r) : [];
  
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    
    // Convert user.id to UUID format if it's just a number
    let creatorId = null;
    if (user.id) {
      // If it's a numeric ID, leave it null and backend will handle it
      // If it's already a UUID string, use it
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      creatorId = uuidPattern.test(String(user.id)) ? user.id : null;
    }
    
    const response = await fetch(`${API_BASE}/api/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || "",
        icon: iconEmoji || "👥",
        creator_id: creatorId,
        creator_name: user.username || "Anonymous"
      })
    });
    
    if (!response.ok) throw new Error("Failed to create group");
    
    const group = await response.json();
    
    // Add rules if provided
    if (rules.length > 0) {
      await fetch(`${API_BASE}/api/groups/${group.id}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules })
      });
    }
    
    showModal(`✓ Group "${name}" created successfully!`);
    loadGroups();
  } catch (error) {
    showModal("Failed to create group. Please try again.");
  }
        });
      });
    });
  });
}

async function loadUserGroups() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    if (!user.id) return;
    
    const response = await fetch(`${API_BASE}/api/user/${user.id}/groups`);
    if (!response.ok) throw new Error("Failed to load user groups");
    
    userGroups = await response.json();
    
    const yourGroupsList = document.getElementById("yourGroupsList");
    if (!yourGroupsList) return;
    
    yourGroupsList.innerHTML = "";
    
    if (!userGroups || userGroups.length === 0) {
      yourGroupsList.innerHTML = "<p style='text-align:center; opacity:0.6;'>You haven't joined any groups yet.</p>";
      return;
    }
    
    userGroups.forEach(group => {
      const card = document.createElement("div");
      card.className = "group-card";
      card.innerHTML = `
        <div class="group-header">
          <span class="group-icon" style="font-size:2rem;">${group.icon || "👥"}</span>
          <div class="group-info">
            <h3>${group.name}</h3>
            <p style="opacity:0.7; margin:0.25rem 0;">${group.description || "No description"}</p>
          </div>
        </div>
        <div class="group-actions">
          <button class="innerbtn" onclick="viewGroup('${group.id}')">View</button>
          <button class="innerbtn" onclick="leaveGroup('${group.id}', '${group.name}')">Leave</button>
        </div>
      `;
      yourGroupsList.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading user groups:", error);
  }
}

async function leaveGroup(groupId, groupName) {
  showConfirm(`Leave "${groupName}"?`, async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || '{}');
      
      const response = await fetch(`${API_BASE}/api/groups/${groupId}/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: user.id,
          username: user.username 
        })
      });
      
      if (response.ok) {
        showModal(`✓ Left ${groupName}`);
        loadUserGroups();
        loadGroups(); // Refresh available groups
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      showModal("Failed to leave group.");
    }
  });
}

// Submit community post with optional image
async function submitCommunityPost() {
  const text = document.getElementById("communityPostText").value.trim();
  const imageInput = document.getElementById("communityPostImage");
  const imageFile = imageInput?.files[0];
  
  if (!text) {
    showModal("Please write something!");
    return;
  }
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id) {
    showModal("Please log in to post.");
    return;
  }
  
  try {
    await postQuestionToServer({
      user_id: user.id,
      title: text.slice(0, 100), // Use first 100 chars as title
      body: text,
      imageFile: imageFile || null
    });
    
    showModal("✓ Posted!");
    document.getElementById("communityPostText").value = "";
    if (imageInput) imageInput.value = "";
    loadFromBackend(); // Reload feed
  } catch (error) {
    console.error("Error posting:", error);
    showModal("Failed to post.");
  }
}

window.submitCommunityPost = submitCommunityPost;

// Load on page load
window.addEventListener("DOMContentLoaded", () => {
  loadGroups();
  loadUserGroups();
});