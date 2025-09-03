let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}

//ensure user is signed in
const currentUser = JSON.parse(storage.getItem("user"));
if (!currentUser) {
  alert("You need to sign in to post questions!");
}

document.querySelector('.baby-ai-bubble').addEventListener('click', () => {
  window.location.href = 'chat.html';
});

const askInput = document.querySelector('.ask-input');
const questionFeed = document.querySelector('.question-feed');

const STORAGE_KEY = 'community_questions';
let questions = [];
let openQuestionId = null; // keep which question is open after re-render

const saved = storage.getItem(STORAGE_KEY);
if (saved) {
  try {
    questions = JSON.parse(saved);
    renderQuestions();
  } catch (e) {
    console.warn('Could not parse saved questions:', e);
  }
}

// Save
function saveQuestions() {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Could not save questions:', e);
  }
}

const draft = !currentUser || !navigator.onLine;
// Add Question
function addQuestion(text, image = null) {
  const question = {
    id: Date.now(),
    text,
    author: currentUser ? currentUser.username : "Anonymous",
    image,
    responses: [],
    aiAnswered: false,
    draft
  };
  questions.unshift(question);
  saveQuestions();
  renderQuestions();

  if (draft) {
    console.log("Saved as draft, will retry later");
    return;
  }

  // NEW: push to backend
  fetch("/community/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: currentUser.id,   // must match your users table
      title: text.slice(0, 50),  // simple auto-title
      body: text
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Saved to backend:", data);
    // optional: replace temp local id with backend id
    question.id = data.id;
    saveQuestions();
  })
  .catch(err => console.error("Backend save failed", err));
}


// Add Response to question (nested)
function addResponse(questionId, parentResponse, text, image = null, replyingTo = null) {
  const newResp = {
    id: Date.now(),
    text,
    author: currentUser ? currentUser.username : "Anonymous",
    image,
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
  renderQuestions();
  reopenExpandedIfNeeded();

  if (draft) return;

  // NEW: push to backend
  fetch(`/community/questions/${questionId}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: currentUser.id,
      body: text
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Response saved:", data);
    newResp.id = data.id; // update with backend id
    saveQuestions();
  })
  .catch(err => console.error("Response save failed", err));
}


// count replies recursively
function countAllReplies(responses) {
  let count = responses.length;
  responses.forEach(r => {
    //i gotta say i did not know this was possible!
    count += countAllReplies(r.replies || []);
  });
  return count;
}

// Re-open helper (keeps the question open after render)
function reopenExpandedIfNeeded() {
  if (!openQuestionId) return;
  const card = document.querySelector(`.question-card[data-qid="${openQuestionId}"]`);
  if (!card) return;
  const questionEl = card.querySelector('.question');
  if (questionEl) {
    questionEl.click(); // open it
    // optionally scroll into view without animation
    card.scrollIntoView({ block: 'nearest' });
  }
}

// ... keep everything above as-is ...

// Render responses recursively
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

    // reply link (always visible, Quora-style)
    const replyBtn = document.createElement('button');
    replyBtn.textContent = "Reply";
    replyBtn.className = "reply-link";
    div.appendChild(replyBtn);

    let toggleBtn = null;
    let repliesContainer = null;

    // nested replies toggle with total count
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
      if (div.querySelector('.response-box')) return; // only one editor per response
      if (toggleBtn) toggleBtn.style.display = 'none'; // hide toggle while replying

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
            addResponse(questionId, r, text, reader.result, r.author);
            
          };
          reader.readAsDataURL(file);
        } else {
          addResponse(questionId, r, text, null, r.author);
          
        }
      });
    });

    container.appendChild(div);
  });
}

// ... keep renderQuestions and everything else the same, 
// but replace main file input with className = "file-input"



// Render Questions
function renderQuestions(filter = "") {
  questionFeed.innerHTML = "";

  questions
    .filter(q => q.text.toLowerCase().includes(filter.toLowerCase()))
    .forEach((q) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.dataset.qid = q.id;

      const questionText = document.createElement('p');
      questionText.className = 'question';
      questionText.textContent = `“${q.text}”`;

      const meta = document.createElement('div');
      meta.className = 'meta';

      const info = document.createElement('span');
      const total = countAllReplies(q.responses || []);
      info.textContent = `👤 ${q.author} · ${total} response${total !== 1 ? 's' : ''}`;
      meta.appendChild(info);

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
      

      questionText.addEventListener('click', () => toggleExpanded());
      badge.addEventListener('click', () => toggleExpanded());

      function toggleExpanded() {
        const nowOpening = expanded.classList.contains('hidden');
        expanded.classList.toggle('hidden');
        expanded.innerHTML = "";

        // inside toggleExpanded
        if (nowOpening) {
          openQuestionId = q.id;
          meta.style.display = "none";

          // Close at high right
          const closeBtn = document.createElement('button');
          closeBtn.textContent = "✖";
          closeBtn.className = "close-btn";
          expanded.appendChild(closeBtn);

          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            expanded.classList.add('hidden');
            meta.style.display = "flex";
            openQuestionId = null;
          });

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
          

          // append in order
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
                addResponse(q.id, null, text, reader.result);
                
              };
              reader.readAsDataURL(file);
            } else {
              addResponse(q.id, null, text);
              
            }
          });
        } else {
          meta.style.display = "flex";
          openQuestionId = null;
        }
      }

      questionFeed.appendChild(card);
    });
}

function loadFromBackend() {
  if (!navigator.onLine) return; // stay offline-friendly
  fetch("/community/questions")
    .then(res => res.json())
    .then(data => {
      // map backend → your local structure
      questions = data.map(q => ({
        id: q.id,
        text: q.body,
        author: q.username,
        responses: [],   // load separately below
        aiAnswered: false,
        draft: false
      }));
      saveQuestions();
      renderQuestions();

      // Optionally load responses per question
      questions.forEach(q => {
        fetch(`/community/questions/${q.id}/responses`)
          .then(r => r.json())
          .then(responses => {
            q.responses = responses.map(r => ({
              id: r.id,
              text: r.body,
              author: r.username,
              replies: []
            }));
            saveQuestions();
            renderQuestions();
          });
      });
    })
    .catch(err => console.error("Could not load backend questions", err));
}

window.addEventListener("DOMContentLoaded", loadFromBackend);


// Ask input = search OR post
askInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const text = askInput.value.trim();
    if (text !== '') {
      addQuestion(text);
      askInput.value = '';
    }
  }
});
askInput.addEventListener('input', () => {
  renderQuestions(askInput.value.trim());
});

// Hashtag click → search
document.querySelectorAll('.tags span').forEach(tag => {
  tag.addEventListener('click', () => {
    askInput.value = tag.textContent;
    renderQuestions(tag.textContent);
  });
});

window.addEventListener("online", trySendDrafts);
window.addEventListener("DOMContentLoaded", trySendDrafts);

function trySendDrafts() {
  if (!currentUser) return; // still can’t publish
  questions.forEach(q => {
    if (q.draft) {
      q.author = currentUser.username;
      q.draft = false;
      addQuestion(q.text); // re-run addQuestion normally
    }
  });
  saveQuestions();
  renderQuestions();
}

