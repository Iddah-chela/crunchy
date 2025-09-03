
// ai-memory.js

const aiMemory = [
  {
    theme: 'fear',
    tags: ['fear', 'scared', 'afraid', 'terrified'],
    verse: {
      book: 'Isaiah',
      chapter: 41,
      verse: 10,
      text: "Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.",
    },
  },
  {
    theme: 'sadness',
    tags: ['sad', 'depressed', 'crying', 'down'],
    verse: {
      book: 'Psalm',
      chapter: 34,
      verse: 18,
      text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    },
  },
  {
    theme: 'love',
    tags: ['love', 'loved', 'loving', 'loves'],
    verse: {
      book: '1 John',
      chapter: 4,
      verse: 8,
      text: "Whoever does not love does not know God, because God is love.",
    },
  },
  {
    theme: 'guilt',
    tags: ['guilt', 'shame', 'guilty'],
    verse: {
      book: 'Romans',
      chapter: 8,
      verse: 1,
      text: "There is now no condemnation for those who are in Christ Jesus.",
    },
  },
  {
    theme: 'anxiety',
    tags: ['anxious', 'anxiety', 'worry', 'stress'],
    verse: {
      book: 'Philippians',
      chapter: 4,
      verse: 6,
      text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    },
  },
  {
    theme: 'rest',
    tags: ['tired', 'weary', 'exhausted'],
    verse: {
      book: 'Matthew',
      chapter: 11,
      verse: 28,
      text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    },
  },
  {
    theme: 'hopeless',
    tags: ['hope', 'hopeless'],
    verse: {
      book: 'John',
      chapter: 1,
      verse: 5,
      text: "The light shines in the darkness, and the darkness has not overcome it.",
    },
  },
  {
    theme: 'grief',
    tags: ['grief', 'loss', 'mourning'],
    verse: {
      book: 'Matthew',
      chapter: 5,
      verse: 4,
      text: "Blessed are those who mourn, for they will be comforted.",
    },
  },
  {
    theme: 'envy',
    tags: ['jealous', 'envy'],
    verse: {
      book: 'Galatians',
      chapter: 6,
      verse: 4,
      text: "Each one should test their own actions. Then they can take pride in themselves alone, without comparing themselves to someone else.",
    },
  },
  {
    theme: 'guidance',
    tags: ['future', 'what’s next'],
    verse: {
      book: 'Proverbs',
      chapter: 3,
      verse: 5,
      text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    },
  },
  {
    theme: 'happy',
    tags: ['happy', 'glad', 'hopeful'],
    verse: {
      book: 'Phillipians',
      chapter: 4,
      verse: 4,
      text: "Rejoice in the Lord for he is good and again I say rejoice.",
    },
  },
];

const chatMemory = [
  {
    tags: ['hello', 'hi', 'hey'],
    replies: ["Hey there!", "Hi 👋 how are you doing", "Hello! 😊 what's on your mind?", "Yooo what's good?", "Hey hey!"],
  },
  {
    tags: ['how are you', 'how are you doing'],
    replies: ["I'm doing great, thanks for asking! How about you?", "Chillin', just thinking about stuff 💭", "Feeling blessed 😌 you?"],
  },
  {
    tags: ['thank you', 'thanks'],
    replies: ["You're welcome!", "Always here for you 💙", "Glad I could help 😊"],
  },
  {
    tags: ['good morning', 'morning'],
    replies: ["Good morning ☀️ How'd you sleep?", "Rise and shine! How was your rest?", "Sending you light and love this fine morning 🌻"],
  },
  {
    tags: ['im good', 'feeling good', 'had a good day', 'good too'],
    replies: ["That's great! Happy to hear that. What's on your mind today?", "Fantastic, anything you wanna talk about today?", "Good to hear that! Anything on your mind today?"],
  },
  {
    tags: ['who are you?', 'what should i call you', 'your name', 'who are you', 'what are you'],
    replies: [  "Hey there! I'm Vale, here to help you however I can?", "Hi! I'm Vale — here to listen and encourage you 💙", "Hello! My name is Vale, what's yours?💫"],
  },
  
  
];