
// chat.js

const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
let userName = null;
let conversationMemory = []; // Track verses shared in this session
let questionMap = null; // Will load the main verse database

// Load questionMap data
async function loadQuestionMap() {
  try {
    const response = await fetch('../backend/models/questionMap.js');
    const script = await response.text();

    // Extract the questionMap object from the script
    const questionMapMatch = script.match(/let questionMap = ({[\s\S]*?});/);
    if (questionMapMatch) {
      questionMap = eval('(' + questionMapMatch[1] + ')');
      console.log('✅ Loaded questionMap for AI chat');
    }
  } catch (err) {
    console.warn('Could not load questionMap:', err);
    // Fallback to aiMemory
  }
}

// Add message to chat with optional verse suggestion buttons
function addMessage(content, type = 'user', verseData = null) {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble', type === 'user' ? 'user-bubble' : 'ai-bubble');

  // Add main content
  const contentDiv = document.createElement('div');
  contentDiv.textContent = content;
  bubble.appendChild(contentDiv);

  // Add verse suggestion buttons if verse data provided
  if (verseData && type === 'ai') {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'verse-buttons';
    buttonContainer.style.marginTop = '8px';

    const moreBtn = document.createElement('button');
    moreBtn.className = 'verse-btn';
    moreBtn.textContent = 'More like this';
    moreBtn.onclick = () => suggestMoreVerses(verseData.theme);

    const differentBtn = document.createElement('button');
    differentBtn.className = 'verse-btn';
    differentBtn.textContent = 'Different verse';
    differentBtn.onclick = () => suggestDifferentVerse(verseData.theme);

    buttonContainer.appendChild(moreBtn);
    buttonContainer.appendChild(differentBtn);
    bubble.appendChild(buttonContainer);
  }

  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

const replyTemplates = [
  (verse) => `Here's something that you might like: "${verse.text}" – ${verse.ref}`,
  (verse) => `God's Word says: "${verse.text}" – ${verse.ref}. Hold on to that.`,
  (verse) => `That's interesting 💭 But listen to this: ${verse.ref} says "${verse.text}"`,
  (verse) => `Let me remind you of this truth: "${verse.text}" (${verse.ref})`,
  (verse) => `Look at what God says: ${verse.ref} – "${verse.text}"`,
  (verse) => `"${verse.text}" – That’s straight from ${verse.ref}. Let that sink in 💙`,
  (verse) => `Vale's favorite verse for that is: "${verse.text}" – ${verse.ref}`,
  (verse) => `Here’s a light for your heart: ${verse.ref} – "${verse.text}"`,
];

// Verse suggestion functions
function suggestMoreVerses(theme) {
  if (!questionMap) {
    addMessage("I'd love to share more verses, but I'm still loading my knowledge base. Try again in a moment!", 'ai');
    return;
  }

  // Find all verses with this theme from questionMap
  const themeVerses = [];
  for (const [questionKey, questionData] of Object.entries(questionMap)) {
    for (const [answerKey, answerData] of Object.entries(questionData)) {
      if (answerData.theme === theme) {
        for (const [verseRef, verseData] of Object.entries(answerData)) {
          if (verseData.text && verseData.ref) {
            themeVerses.push({
              ref: verseRef,
              text: verseData.text,
              theme: theme,
              tags: verseData.tags || []
            });
          }
        }
      }
    }
  }

  if (themeVerses.length === 0) {
    addMessage(`I don't have more verses on ${theme} right now, but I can suggest something related!`, 'ai');
    return;
  }

  // Filter out verses already shared in this conversation
  const newVerses = themeVerses.filter(v => !conversationMemory.includes(v.ref));
  const verse = newVerses.length > 0 ?
    newVerses[Math.floor(Math.random() * newVerses.length)] :
    themeVerses[Math.floor(Math.random() * themeVerses.length)];

  conversationMemory.push(verse.ref);
  const template = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
  const response = template(verse);

  addMessage(response, 'ai', verse);
}

function suggestDifferentVerse(theme) {
  suggestMoreVerses(theme); // Same function, just different button text
}

// Enhanced AI response function
function getAIResponse(message) {
  const lowerMsg = message.toLowerCase();

  // Check chatMemory first
  for (let memory of chatMemory) {
    for (let tag of memory.tags) {
      if (lowerMsg.includes(tag)) {
        const reply = memory.replies[Math.floor(Math.random() * memory.replies.length)];
        return userName ? `${reply} ${userName}!` : reply;
      }
    }
  }

  // 1. Catch when user says their name
  const nameMatch = lowerMsg.match(/my name is (\w+)/i) || lowerMsg.match(/i am (\w+)/i) || lowerMsg.match(/i'm (\w+)/i);
  if (nameMatch) {
    userName = nameMatch[1];
    return `Nice to meet you, ${userName}! 😊`;
  }

  // 2. If they ask "what's my name?" and it's stored
  if (lowerMsg.includes("what's my name") || lowerMsg.includes("do you remember my name")) {
    return userName
      ? `Of course! You're ${userName} 💫`
      : "Hmm, I don’t think you’ve told me your name yet.";
  }

  // 💬 Handle greetings and casual talk
  if (["what should I call you", "your name", "who are you", "what are you"].some(g => lowerMsg.includes(g))) {
    const greetings = [
      "Hey there! I'm Vale, here to help you however I can.",
      "Hi! I'm Vale — here to listen and encourage you 💙",
      "Hello! My name is Vale, what's yours?💫",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lowerMsg.includes("how are you")) {
    const moods = [
      "I'm feeling peaceful today ☁️",
      "Grateful, as always 🙏 You?",
      "Just excited to be here with you 😊",
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  if (lowerMsg.includes("your name")) {
    return "My name is Vale! I learn through verses and conversations 🧠💡";
  }

  if (lowerMsg.includes("good morning")) {
    return "Good morning sunshine ☀️ I hope your heart feels light today!";
  }

  if (lowerMsg.includes("good night")) {
    return "Good night 🌙 Rest well. You’re held in love tonight.";
  }
  
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("good morning")) {
    const greetings = [
      `Hey${userName ? ' ' + userName : ''}! How can I help today? 😊`,
      `Hello${userName ? ', ' + userName : ''}! Ready for some thoughts?`,
      `Hi there${userName ? ' ' + userName : ''} 👋 Let’s chat.`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 📖 Search for verses by tags (enhanced with questionMap integration)
  let matched = aiMemory.filter(memory =>
    memory.tags.some(tag => lowerMsg.includes(tag))
  );

  // Also search questionMap if loaded
  if (questionMap) {
    for (const [questionKey, questionData] of Object.entries(questionMap)) {
      for (const [answerKey, answerData] of Object.entries(questionData)) {
        if (answerData.tags && answerData.tags.some(tag => lowerMsg.includes(tag))) {
          // Convert questionMap format to aiMemory format
          for (const [verseRef, verseData] of Object.entries(answerData)) {
            if (verseData.text && verseData.ref) {
              matched.push({
                theme: answerData.theme,
                tags: answerData.tags,
                verse: {
                  ref: verseRef,
                  text: verseData.text
                }
              });
            }
          }
        }
      }
    }
  }

  if (matched.length > 0) {
    const memory = matched[Math.floor(Math.random() * matched.length)];
    const verse = memory.verse || memory; // Handle both formats
    const template = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

    // Track this verse in conversation memory
    const verseRef = verse.ref || `${verse.book} ${verse.chapter}:${verse.verse}`;
    conversationMemory.push(verseRef);

    const mixedReplies = [
      `${template(verse)} Also... do you want to talk more about that?`,
      `${template(verse)} 💭 Want to add more verses about this later?`,
      `${template(verse)} I'm here if you want to just chat too.`,
    ];

    const chance = Math.random();

    if (chance < 0.3) {
      // Return verse with button data for suggestions
      const verseData = {
        ref: verseRef,
        text: verse.text,
        theme: memory.theme
      };
      return { text: template(verse), verseData };
    }
    if (chance < 0.6) return mixedReplies[Math.floor(Math.random() * mixedReplies.length)]; // Mix
    return `That sounds nice. Want to talk about it more ${userName ? ' ' + userName : ''}? 💬`; // No verse
  }

  // 🤖 Fallback
  const fallbackReplies = [
  "That's interesting. Want to tell me more?",
  "Hmm... I don’t have a verse for that yet, but I’m listening 👂",
  "I'm not sure how to answer that right now, but I’m learning!",
  "Want to try saying that another way?",
];

return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

// Send message handler
function handleSend() {
  const userInput = chatInput.value.trim();
  if (!userInput) return;

  addMessage(userInput, 'user');
  chatInput.value = '';

  const aiReply = getAIResponse(userInput);

  setTimeout(() => {
    if (typeof aiReply === 'object' && aiReply.text && aiReply.verseData) {
      // Handle verse response with buttons
      addMessage(aiReply.text, 'ai', aiReply.verseData);
    } else {
      // Handle regular text response
      addMessage(aiReply, 'ai');
    }
  }, 600); // slight delay for realism
}

// Initialize the chat
document.addEventListener('DOMContentLoaded', () => {
  loadQuestionMap(); // Load the main verse database
});

// Event listeners
sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});
