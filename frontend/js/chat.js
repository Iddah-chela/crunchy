
// chat.js

const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
let userName = null;

// Add message to chat
function addMessage(content, type = 'user') {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble', type === 'user' ? 'user-bubble' : 'ai-bubble');
  bubble.textContent = content;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

const replyTemplates = [
  (verse) => `Here's something that you might like: "${verse.text}" – ${verse.book} ${verse.chapter}:${verse.verse}`,
  (verse) => `God's Word says: "${verse.text}" – ${verse.book} ${verse.chapter}:${verse.verse}. Hold on to that.`,
  (verse) => `That's interesting 💭 But listen to this: ${verse.book} ${verse.chapter}:${verse.verse} says "${verse.text}"`,
  (verse) => `Let me remind you of this truth: "${verse.text}" (${verse.book} ${verse.chapter}:${verse.verse})`,
  (verse) => `Look at what God says: "${verse.text}" – ${verse.book} ${verse.chapter}:${verse.verse}`,
  (verse) => `"${verse.text}" – That’s straight from ${verse.book} ${verse.chapter}:${verse.verse}. Let that sink in 💙`,
  (verse) => `Vale's favorite verse for that is: "${verse.text}" – ${verse.book} ${verse.chapter}:${verse.verse}`,
  (verse) => `Here’s a light for your heart: ${verse.book} ${verse.chapter}:${verse.verse} – "${verse.text}"`,
];

// Search for response
let lastEmotion = null;


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

  // 📖 Search for verses by tags
  const matched = aiMemory.filter(memory =>
    memory.tags.some(tag => lowerMsg.includes(tag))
  );

  if (matched.length > 0) {
    const memory = matched[Math.floor(Math.random() * matched.length)];
    const template = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

    const mixedReplies = [
      `${template(memory)} Also... do you want to talk more about that?`,
      `${template(memory)} 💭 Want to add more verses about this later?`,
      `${template(memory)} I'm here if you want to just chat too.`,
    ];

    const chance = Math.random();
    lastEmotion = memory.theme;

    if (chance < 0.3) return template(memory); // Verse only
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
  setTimeout(() => addMessage(aiReply, 'ai'), 600); // slight delay for realism
}

// Event listeners
sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});