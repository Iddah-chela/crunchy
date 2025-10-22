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
  // keep showing UI but warn — some parts will be drafts
  // you might want to remove this alert in production
  alert("You need to sign in to post questions!");
}

document.querySelector('.baby-ai-bubble')?.addEventListener('click', () => {
  window.location.href = 'private.html';
});

const askInput = document.querySelector('.ask-input');
const questionFeed = document.querySelector('.question-feed');

const STORAGE_KEY = 'community_questions';
let questions = [];
let openQuestionId = null; // keep which question is open after re-render

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
      alert(`No verses found for the theme: ${keyword}`);
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
    const backendQuestions = data.map(q => ({
      id: q.id,
      text: q.body,
      author: q.username,
      image: q.image || null,           // backend should return image URL if exists
      responses: [],                    // fetch separately
      aiAnswered: false,
      draft: false,
      favorited: q.favorited === 1 || q.favorited === true,
      favoritesCount: q.favorites_count || 0
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
        q.responses = responses.map(r => ({
          id: r.id,
          text: r.body,
          author: r.username,
          image: r.image || null,
          replies: []
        }));
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

async function postResponseToServer({ questionId, user_id, body, imageFile, imageDataUrl }) {
  try {
    if (imageFile) {
      const fd = new FormData();
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
        body: JSON.stringify({ user_id, body })
      });
      if (!res.ok) throw res;
      const data = await res.json();
      return data;
    }
  } catch (err) {
    throw err;
  }
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
    id: draft ? Date.now() : null, // temp id for local drafts
    text,
    author: currentUser ? currentUser.username : "Anonymous",
    image: imageDataUrl || null,      // local display uses dataURL if present; if file uploaded server will return URL later
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

  if (parentResponse) {
    parentResponse.replies.unshift(newResp);
  } else {
    const q = questions.find(q => q.id === questionId);
    if (q) q.responses.unshift(newResp);
  }

  saveQuestions();
  
  //reopenExpandedIfNeeded();

  if (draft) return;

  try {
    const data = await postResponseToServer({
      questionId,
      user_id: currentUser.id,
      body: text,
      imageFile,
      imageDataUrl
    });
    console.log("Response saved:", data);
    newResp.id = data.id;
    if (data.image) newResp.image = data.image;
    saveQuestions();
    
  } catch (err) {
    console.error("Response save failed", err);
    // mark as draft (we reuse the draft flag located on the parent question level if desired)
    const q = questions.find(q => q.id === questionId);
    if (q) q.draft = true;
    saveQuestions();
    
    reopenExpandedIfNeeded();
    reopenReplyBox();
  }
}

// ---------- Favorites ----------
async function toggleFavorite(questionId, favBtn) {
  if (!currentUser) {
    alert("You must log in to favorite.");
    return;
  }

  try {
    const res = await fetch(`/commune/questions/${questionId}/favorite`, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    const q = questions.find(q => q.id === questionId);
    if (q) {
      q.favorited = data.favorited;
      q.favoritesCount = (q.favoritesCount || 0) + (data.favorited ? 1 : -1);
    }
    saveQuestions();

    favBtn.textContent = data.favorited ? "★" : "☆";
    const countSpan = favBtn.nextElementSibling;
    if (countSpan) countSpan.textContent = ` ${q.favoritesCount}`;
    favBtn.setAttribute('aria-pressed', data.favorited ? 'true' : 'false');
    saveQuestions();
  } catch (err) {
    console.error('Favorite failed:', err);
  }
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
      toggleBtn.textContent = `💬 ${totalNested} response${totalNested > 1 ? "s" : ""}`;
      div.appendChild(toggleBtn);

      repliesContainer = document.createElement('div');
      repliesContainer.className = "replies hidden";
      div.appendChild(repliesContainer);

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        repliesContainer.classList.toggle("hidden");
        if (!repliesContainer.classList.contains("hidden")) {
          repliesContainer.innerHTML = "";
          renderResponses(r.replies, questionId, repliesContainer, level + 1);
          toggleBtn.textContent = `💬 ${totalNested} response${totalNested > 1 ? "s" : ""} (open)`;
        } else {
          toggleBtn.textContent = `💬 ${totalNested} response${totalNested > 1 ? "s" : ""}`;
        }
      });
    }

    // on reply → show inline mini input
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

      replyBtn.style.display = "none"; // hide reply link while open

      div.appendChild(replyBox);
      div.appendChild(fileInput);
      div.appendChild(sendReplyBtn);

      sendReplyBtn.addEventListener('click', () => {
        const text = replyBox.value.trim();
        const file = fileInput.files[0];
        if (!text && !file) return;

        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            // reader.result is dataURL
            addResponse(questionId, r, text, reader.result, r.author, file);
          };
          reader.readAsDataURL(file);
        } else {
          addResponse(questionId, r, text, null, r.author, null);
        }
        reopenExpandedIfNeeded();
      });
    });

    container.appendChild(div);
  });
}

function renderQuestions(filter = "") {
  questionFeed.innerHTML = "";

  questions
    .filter(q => q.text.toLowerCase().includes(filter.toLowerCase()))
    .forEach((q) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.dataset.qid = q.id || ''; // might be null for local drafts

      const questionText = document.createElement('p');
      questionText.className = 'question';
      questionText.textContent = `“${q.text}”`;

      const meta = document.createElement('div');
      meta.className = 'meta';

      // favorite button
      const favBtn = document.createElement('button');
      favBtn.textContent = q.favorited ? "★" : "☆";
      favBtn.className = "favorite-btn";

      const favCount = document.createElement('span');
favCount.className = "favorite-count";
favCount.textContent = q.favoritesCount ? ` ${q.favoritesCount}` : " 0";

    
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentUser) {
          alert("You must log in to favorite.");
          return;
        }
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
          openQuestionId = q.id;
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
      const canEdit = currentUser && q.author === currentUser.username;

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

      // Add edit button if user can edit
      if (canEdit) {
        const editBtn = document.createElement('button');
        editBtn.textContent = "Edit Question";
        editBtn.className = "edit-btn";
        actionsRow.appendChild(editBtn);

        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleEditMode();
        });
      }

      expanded.appendChild(box);
      expanded.appendChild(actionsRow);
      card.appendChild(expanded);

      const respContainer = document.createElement('div');
      respContainer.className = "responses";
      expanded.appendChild(respContainer);

      renderResponses(q.responses || [], q.id, respContainer);

      sendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = box.value.trim();
        const file = fileInput.files[0];
        if (!text && !file) return;

        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            // dataURL available for local preview; file included to send when online
            addResponse(q.id, null, text, reader.result, null, file);
            box.value = "";
            fileInput.value = "";
          };
          reader.readAsDataURL(file);
        } else {
          addResponse(q.id, null, text, null, null, null);
          box.value = "";
        }
      });

      // Edit mode functionality
      function toggleEditMode() {
        const isEditing = box.classList.contains('editing');

        if (!isEditing) {
          // Enter edit mode
          box.classList.add('editing');
          box.value = q.text;
          box.placeholder = "Edit your question...";
          sendBtn.textContent = "Save Changes";
          sendBtn.classList.add('save-edit');

          // Hide file input and other buttons during edit
          fileInput.style.display = 'none';
          actionsRow.querySelector('.edit-btn').textContent = "Cancel Edit";

          // Change send button behavior to save edit
          const originalSendHandler = sendBtn.onclick;
          sendBtn.onclick = async (e) => {
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

              if (res.ok) {
                q.text = newText;
                saveQuestions();
                renderQuestions();
                alert('Question updated successfully!');
              } else {
                alert('Failed to update question');
              }
            } catch (err) {
              console.error('Edit failed:', err);
              alert('Failed to update question');
            }
          };
        } else {
          // Exit edit mode
          box.classList.remove('editing');
          box.value = '';
          box.placeholder = "Write a response...";
          sendBtn.textContent = "Send";
          sendBtn.classList.remove('save-edit');

          // Show file input and restore buttons
          fileInput.style.display = 'inline-block';
          actionsRow.querySelector('.edit-btn').textContent = "Edit Question";

          // Restore original send button behavior
          sendBtn.onclick = null;
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
    askInput.value = tag.textContent;
    renderQuestions(tag.textContent);
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
  for (const q of [...questions]) {
    if (q.draft) {
      // attempt to publish
      try {
        // if q.image is a data URL, convert to blob
        let imageFile = null;
        if (q._file) imageFile = q._file; // prefer original File if saved
        else if (q.image && q.image.startsWith('data:')) imageFile = dataURLtoBlob(q.image);

        const result = await postQuestionToServer({
          user_id: currentUser.id,
          title: q.text.slice(0, 50),
          body: q.text,
          imageFile: imageFile instanceof Blob && !(imageFile instanceof File) ? imageFile : imageFile,
          imageDataUrl: (q.image && q.image.startsWith('data:')) ? q.image : null
        });

        q.id = result.id;
        if (result.image) q.image = result.image;
        q.draft = false;
        changed = true;
      } catch (err) {
        console.warn("Draft publish failed for question:", q.id, err);
        // keep as draft; move on
      }
    }

    // try replies drafts too (mark parent q.draft true if any reply fails)
    if (q.responses && q.responses.length) {
      for (const r of q.responses) {
        if (r.id === null || (r.id && r.id.toString().startsWith('temp'))) {
          // assume not published (we used timestamp ids for drafts)
          try {
            let imageFile = null;
            if (r._file) imageFile = r._file;
            else if (r.image && r.image.startsWith('data:')) imageFile = dataURLtoBlob(r.image);

            const result = await postResponseToServer({
              questionId: q.id,
              user_id: currentUser.id,
              body: r.text,
              imageFile: imageFile instanceof Blob ? imageFile : null,
              imageDataUrl: (r.image && r.image.startsWith('data:')) ? r.image : null
            });

            r.id = result.id;
            if (result.image) r.image = result.image;
            changed = true;
          } catch (err) {
            console.warn("Draft response publish failed", err);
            q.draft = true;
          }
        }
      }
    }
  }

  if (changed) {
    saveQuestions();
    renderQuestions();
  }
}

// Export initial render if you loaded local cache before backend
renderQuestions();
