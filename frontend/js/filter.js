let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}
 


window.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const storedAge = currentUser.age || 10;
  const ageSelect = document.getElementById("age");

  filterQuestionsByAge(storedAge);
});


let questions = [
  // 💬 General
  { id: "q3", text: "What's my purpose on Earth?", category: "general", ageRange: [12, 99] },
  { id: "q28", text: "What is God's plan for my life?", category: "general", ageRange: [12, 99] },
  { id: "q29", text: "Can I really make a difference?", category: "general", ageRange: [12, 99] },
  { id: "q8", text: "How do I know God is real?", category: "general", ageRange: [10, 99] },
  { id: "q58", text: "Who will make it to heaven?", category: "general", ageRange: [12, 99] },

  // ✨ About God
  { id: "q1", text: "Who is God?", category: "god", ageRange: [10, 99] },
  { id: "q2", text: "How do we know Him?", category: "god", ageRange: [10, 99] },
  { id: "q5", text: "What does God do?", category: "god", ageRange: [10, 99] },
  { id: "q15", text: "What does God want from me?", category: "god", ageRange: [12, 99] },
  { id: "q18", text: "How does God guide us?", category: "god", ageRange: [12, 99] },
  { id: "q44", text: "How does God show His love?", category: "god", ageRange: [10, 99] },
  { id: "q45", text: "Can I really know God personally?", category: "god", ageRange: [12, 99] },
  { id: "q19", text: "Is God still working today?", category: "god", ageRange: [12, 99] },

  // ✝️ About Jesus
  { id: "q4", text: "Who is Jesus?", category: "jesus", ageRange: [10, 99] },
  { id: "q42", text: "Why did Jesus die?", category: "jesus", ageRange: [12, 99] },
  { id: "q43", text: "What does it mean to be saved?", category: "jesus", ageRange: [12, 99] },
  { id: "q23", text: "Did Jesus really rise again?", category: "jesus", ageRange: [12, 99] },
  { id: "q24", text: "What did Jesus teach?", category: "jesus", ageRange: [10, 99] },
  { id: "q25", text: "Why is Jesus called the Lamb?", category: "jesus", ageRange: [12, 99] },
  { id: "q26", text: "Does Jesus understand me?", category: "jesus", ageRange: [10, 99] },
  { id: "q27", text: "How can I follow Jesus?", category: "jesus", ageRange: [10, 99] },

  // 🚫 About Sin
  { id: "q6", text: "What is sin?", category: "sin", ageRange: [12, 99] },
  { id: "q30", text: "What happens when I sin?", category: "sin", ageRange: [12, 99] },
  { id: "q7", text: "Why do I still sin even though I love God?", category: "sin", ageRange: [12, 99] },
  { id: "q31", text: "What if I mess up too much?", category: "sin", ageRange: [12, 99] },
  { id: "q32", text: "Why do people sin?", category: "sin", ageRange: [12, 99] },
  { id: "q33", text: "Can God forgive any sin?", category: "sin", ageRange: [12, 99] },

  // 📖 About the Bible
  { id: "q34", text: "Is the Bible true?", category: "bible", ageRange: [10, 99] },
  { id: "q35", text: "Why should I read the Bible?", category: "bible", ageRange: [10, 99] },
  { id: "q36", text: "How do I read the Bible?", category: "bible", ageRange: [10, 99] },
  { id: "q37", text: "What is the Bible really about?", category: "bible", ageRange: [12, 99] },
  { id: "q141", text: "How can I trust the Bible if people wrote it?", category: "bible", ageRange: [12, 99] },
  { id: "q142", text: "Why are there so many versions of the Bible?", category: "bible", ageRange: [12, 99] },
  { id: "q143", text: "Why are there so many denominations if we all use the Bible?", category: "bible", ageRange: [12, 99] },

  // 💼 Life & Choices
  { id: "q117", text: "What does the Bible say about procrastination, laziness, or lack of motivation?", category: "life", ageRange: [14, 99] },
  { id: "q118", text: "As a Christian, how should I view success?", category: "", ageRange: [14, 99] },
  { id: "q119", text: "How does God use my pain or mistakes for His good purposes?", category: "", ageRange: [15, 99] },
  { id: "q125", text: "What kind of life is God planning for me?", category: "", ageRange: [10, 99] },
  { id: "q126", text: "What are the characters and values that should guide a Christian's choices?", category: "", ageRange: [14, 99] },
  { id: "q38", text: "How do I make wise decisions?", category: "life", ageRange: [13, 99] },
  { id: "q39", text: "Does God care about my career or studies?", category: "life", ageRange: [13, 99] },
  { id: "q40", text: "How do I know what to do next?", category: "life", ageRange: [13, 99] },
  { id: "q41", text: "What if I feel stuck in life?", category: "life", ageRange: [13, 99] },

  // 🙏 Prayer
  { id: "q120", text: "What should I do when God seems to withhold or delay an answer to my prayer?", category: "", ageRange: [14, 99] },
  { id: "q121", text: "Can I pray for things I want or just God's will?", category: "", ageRange: [12, 99] },
  { id: "q122", text: "How do I stay focused when I pray?", category: "", ageRange: [12, 99] },
  { id: "q46", text: "How do I pray?", category: "prayer", ageRange: [10, 99] },
  { id: "q47", text: "Does God hear my prayers?", category: "prayer", ageRange: [10, 99] },
  { id: "q21", text: "Can I talk to God like a friend?", category: "prayer", ageRange: [10, 99] },
  { id: "q48", text: "What if I don't know what to say?", category: "prayer", ageRange: [10, 99] },

  // 💕 Relationships
  { id: "q123", text: "Can I be close to someone who doesn’t believe in God?", category: "", ageRange: [12, 99] },
  { id: "q10", text: "How do I forgive others?", category: "relationships", ageRange: [12, 99] },
  { id: "q49", text: "What does God say about love?", category: "relationships", ageRange: [13, 99] },
  { id: "q50", text: "How do I deal with difficult people?", category: "relationships", ageRange: [13, 99] },
  { id: "q51", text: "Does God care about who I date or marry?", category: "relationships", ageRange: [15, 99] },
  
  //desires
  { id: "q144", text: "What does healthy desire even look like?", category: "", ageRange: [16, 99] },
  { id: "q145", text: "Is it wrong to be horny if I’m not married?", category: "", ageRange: [19, 99] },
  { id: "q146", text: "Why do I feel guilty for wanting love and touch?", category: "", ageRange: [18, 99] },
  { id: "q147", text: "Why does the church act like desire is only a man’s problem?", category: "", ageRange: [17, 99] },
  { id: "q148", text: "If David and Solomon were sexually wild, why did God still use them?", category: "", ageRange: [18, 99] },
  { id: "q149", text: "Why are women judged more harshly than men when they mess up?", category: "", ageRange: [18, 99] },
  { id: "q150", text: "If desire is normal, why does it feel so dangerous?", category: "", ageRange: [16, 99] },
  { id: "q151", text: "Is flirting a sin or am I just curious and human?", category: "", ageRange: [16, 99] },
  { id: "q152", text: "What if I’m scared that obeying God means I’ll be lonely forever?", category: "", ageRange: [16, 99] },
  { id: "q153", text: "Can God still accept me when I struggle with lust?", category: "", ageRange: [17, 99] },
  { id: "q154", text: "Is wanting sex the same as being unholy?", category: "", ageRange: [18, 99] },
  { id: "q155", text: "Does God even care about how I feel? Or just what I do?", category: "", ageRange: [12, 99] },
  { id: "q156", text: "Can I be sexually pure and still express desire?", category: "", ageRange: [18, 99] },
  
  
  //joy and hope
  { id: "q130", text: "What’s something amazing about God I can learn today?", category: "", ageRange: [10, 99] },
  { id: "q131", text: "What promise from God can I hold onto right now?", category: "", ageRange: [12, 99] },
  { id: "q132", text: "How can I grow in thankfulness today?", category: "", ageRange: [11, 99] },
  { id: "q133", text: "What does it look like to live joyfully with God?", category: "", ageRange: [12, 99] },
  { id: "q134", text: "What is a truth from the Bible that will fill me with joy or wonder?", category: "", ageRange: [16, 99] },
  { id: "q135", text: "What’s a surprising thing the Bible says?", category: "", ageRange: [11, 99] },
  { id: "q136", text: "What would I tell my younger self about God now?", category: "", ageRange: [14, 99] },
  { id: "q137", text: "How is God showing up in my everyday life?", category: "", ageRange: [10, 99] },

  // 💭 Struggles & Doubts
  { id: "q14", text: "What should I do when I'm afraid?", category: "struggles", ageRange: [10, 99] },
  { id: "q11", text: "How do I deal with doubt?", category: "struggles", ageRange: [12, 99] },
  { id: "q22", text: "Why do I feel far from God?", category: "struggles", ageRange: [12, 99] },
  { id: "q52", text: "What if I feel broken inside?", category: "struggles", ageRange: [13, 99] },
  { id: "q53", text: "Why doesn't God fix things faster?", category: "struggles", ageRange: [13, 99] },
  { id: "q16", text: "Why does God allow pain?", category: "struggles", ageRange: [13, 99] },

  // 🧠 Wisdom & Decisions
  { id: "q110", text: "What kind of wisdom does God want me to have?", category: "", ageRange: [10, 99] },
  { id: "q114", text: "How can I tell if a decision is from God or just my own desire?", category: "", ageRange: [14, 99] },
  { id: "q111", text: "What does the Bible say about overthinking or being indecisive?", category: "", ageRange: [12, 99] },
  { id: "q112", text: "What if my plans keep failing—is that God saying “no”?", category: "", ageRange: [16, 99] },
  { id: "q113", text: "What should I do while waiting for God’s timing?", category: "", ageRange: [12, 99] },
  { id: "q54", text: "What is God's will?", category: "wisdom", ageRange: [13, 99] },
  { id: "q55", text: "What if I make the wrong choice?", category: "wisdom", ageRange: [13, 99] },

  // 🌱 Growth & Christian Living
  { id: "q109", text: "What kind of person does God want me to become?", category: "", ageRange: [12, 99] },
  { id: "q12", text: "How do I live like a Christian?", category: "growth", ageRange: [12, 99] },
  { id: "q13", text: "How do I resist temptations?", category: "growth", ageRange: [12, 99] },
  { id: "q20", text: "How do I trust God?", category: "growth", ageRange: [12, 99] },
  { id: "q56", text: "What if I don’t feel like growing?", category: "growth", ageRange: [13, 99] },
  { id: "q57", text: "How do I stay close to God?", category: "growth", ageRange: [12, 99] },
  { id: "q17", text: "What makes God happy?", category: "growth", ageRange: [10, 99] },
  
  // 🌧️ Real-Life Struggles & Emotions
{ id: "q59", text: "What if I feel like giving up?", category: "emotions", ageRange: [13, 99] },
{ id: "q60", text: "Does God care when I’m depressed or anxious?", category: "emotions", ageRange: [13, 99] },
{ id: "q61", text: "Why do bad things happen to good people?", category: "emotions", ageRange: [10, 99] },
{ id: "q62", text: "What if I’ve been hurt by the church?", category: "emotions", ageRange: [15, 99] },
{ id: "q63", text: "How do I move on after failure?", category: "emotions", ageRange: [10, 99] },
{ id: "q64", text: "What does the Bible say about mental health?", category: "emotions", ageRange: [13, 99] },
{ id: "q85", text: "What if I feel like I don’t matter?", category: "emotions", ageRange: [10, 99] },
{ id: "q86", text: "Can Christians have anxiety or depression?", category: "emotions", ageRange: [13, 99] },
{ id: "q87", text: "Why does healing take so long?", category: "emotions", ageRange: [10, 99] },
{ id: "q88", text: "What if I keep crying out but God feels silent?", category: "emotions", ageRange: [10, 99] },

// 🎯 Purpose, Identity & Calling
{ id: "q115", text: "How do I hear God's voice more clearly?", category: "", ageRange: [12, 99] },
{ id: "q116", text: "What’s one way I can get to know Jesus better this week?", category: "", ageRange: [10, 99] },
{ id: "q138", text: "What kind of adventure might God be inviting me into?", category: "", ageRange: [10, 99] },
{ id: "q139", text: "How can I grow bold in my faith?", category: "", ageRange: [14, 99] },
{ id: "q140", text: "What passions has God given me to bless others?", category: "", ageRange: [10, 99] },
{ id: "q65", text: "Who am I in God’s eyes?", category: "purpose", ageRange: [10, 99] },
{ id: "q66", text: "How do I discover my spiritual gifts?", category: "purpose", ageRange: [13, 99] },
{ id: "q67", text: "What if I feel like I don’t belong?", category: "purpose", ageRange: [10, 99] },
{ id: "q68", text: "What is God's calling for my life?", category: "purpose", ageRange: [13, 99] },
{ id: "q69", text: "What does it mean to live a meaningful life?", category: "purpose", ageRange: [10, 99] },
{ id: "q89", text: "How do I stop comparing myself to others?", category: "purpose", ageRange: [10, 99] },
{ id: "q90", text: "What if I don’t feel special?", category: "purpose", ageRange: [10, 99] },
{ id: "q91", text: "Can God use someone like me?", category: "purpose", ageRange: [10, 99] },
{ id: "q92", text: "How do I know if I’m on the right path?", category: "purpose", ageRange: [13, 99] },
{ id: "q93", text: "What if I don’t have a big dream?", category: "purpose", ageRange: [10, 99] },

// 💔 Difficult Relationships
{ id: "q70", text: "How do I forgive myself?", category: "boundaries", ageRange: [13, 99] },
{ id: "q71", text: "How do I set boundaries and still be loving?", category: "boundaries", ageRange: [13, 99] },
{ id: "q72", text: "What does God say about toxic relationships?", category: "boundaries", ageRange: [13, 99] },
{ id: "q73", text: "Is it okay to walk away from someone?", category: "boundaries", ageRange: [13, 99] },
{ id: "q74", text: "How do I honor my parents if we don’t get along?", category: "boundaries", ageRange: [10, 99] },
{ id: "q94", text: "What if someone betrayed me?", category: "boundaries", ageRange: [13, 99] },
{ id: "q95", text: "How do I know if a relationship is from God?", category: "boundaries", ageRange: [13, 99] },
{ id: "q96", text: "What if I feel unloved or rejected?", category: "boundaries", ageRange: [10, 99] },
{ id: "q97", text: "How do I deal with loneliness?", category: "boundaries", ageRange: [10, 99] },
{ id: "q98", text: "What if I'm scared to open up again?", category: "boundaries", ageRange: [13, 99] },

// 🔥 Faith in Action
{ id: "q75", text: "What does it look like to live by faith daily?", category: "faith", ageRange: [10, 99] },
{ id: "q76", text: "How do I talk to others about Jesus?", category: "faith", ageRange: [10, 99] },
{ id: "q77", text: "What if I’m scared to share my faith?", category: "faith", ageRange: [10, 99] },
{ id: "q78", text: "How do I live as a Christian in today’s world?", category: "faith", ageRange: [13, 99] },
{ id: "q79", text: "How do I stay strong when others don’t believe?", category: "faith", ageRange: [13, 99] },
{ id: "q99", text: "What if people make fun of my faith?", category: "faith", ageRange: [10, 99] },
{ id: "q100", text: "How can I live out my faith at school or work?", category: "faith", ageRange: [13, 99] },
{ id: "q101", text: "What if I feel like a hypocrite?", category: "faith", ageRange: [13, 99] },
{ id: "q102", text: "How do I balance grace and truth?", category: "faith", ageRange: [13, 99] },
{ id: "q103", text: "What if I fail at being a good example?", category: "faith", ageRange: [13, 99] },

// 🚨 Tough or Controversial Topics
{ id: "q157", text: "Can I follow Jesus and still identify as LGBTQ+?", category: "", ageRange: [18, 99] },
{ id: "q80", text: "What does the Bible say about LGBTQ+?", category: "tough", ageRange: [16, 99] },
{ id: "q81", text: "Can Christians struggle with addiction?", category: "tough", ageRange: [15, 99] },
{ id: "q82", text: "Is it okay to have doubts?", category: "tough", ageRange: [13, 99] },
{ id: "q83", text: "What if I’m angry at God?", category: "tough", ageRange: [13, 99] },
{ id: "q84", text: "What does the Bible say about racism and justice?", category: "tough", ageRange: [13, 99] },
{ id: "q104", text: "What if I messed up sexually?", category: "tough", ageRange: [15, 99] },
{ id: "q105", text: "Can I be saved after abortion?", category: "tough", ageRange: [16, 99] },
{ id: "q106", text: "What does the Bible say about gender roles?", category: "tough", ageRange: [15, 99] },
{ id: "q107", text: "What does God say about suicide?", category: "tough", ageRange: [15, 99] },
{ id: "q108", text: "Why do some Christians act like they’re better than others?", category: "tough", ageRange: [13, 99] },

//spiritual battle
{ id: "q127", text: "What does the Bible say about the devil and how to resist him?", category: "", ageRange: [15, 99] },
{ id: "q128", text: "How can I tell if I’m under spiritual attack?", category: "", ageRange: [15, 99] },
{ id: "q129", text: "Why does God let the devil have any power at all?", category: "", ageRange: [13, 99] },
{ id: "q158", text: "Can a Christian be influenced by demons?", category: "", ageRange: [14, 99] },
{ id: "q159", text: "What lies does the enemy try to tell me?", category: "", ageRange: [12, 99] },
{ id: "q160", text: "What does victory over darkness actually look like in everyday life?", category: "", ageRange: [12, 99] },
{ id: "q161", text: "What weapons has God given me to fight spiritual darkness?", category: "", ageRange: [14, 99] },
{ id: "q162", text: "What’s the difference between conviction and accusation?", category: "", ageRange: [15, 99] },
{ id: "q163", text: "How do I recognize the devil’s voice vs God’s voice?", category: "", ageRange: [13, 99] },
{ id: "q164", text: "As a believer, should I be afraid of hell and demons?", category: "", ageRange: [15, 99] },

//new ones
{ id: "q165", text: "Is alcoholism or smoking a sin?", category: "", ageRange: [18, 99] },
{ id: "q166", text: "What does the Bible say about creativity and art?", category: "", ageRange: [12, 99] },
{ id: "q167", text: "What does God really think about my body or appearance-is it wrong to care how I look?", category: "", ageRange: [13, 99] },
{ id: "q168", text: "If I have a disability or illness, can God still use me—and why would He allow it in the first place?", category: "", ageRange: [15, 99] },
{ id: "q169", text: "What if I secretly don't like God's plan for me or I don't want to surrender my own dreams?", category: "", ageRange: [14, 99] },
{ id: "q170", text: "Is it okay to want more than what I have-or is ambition actually good in God's eyes?", category: "", ageRange: [15, 99] },
{ id: "q171", text: "Is wealth evil-and does God want me to be poor?", category: "", ageRange: [14, 99] },
{ id: "q172", text: "Is it wrong to want to be seen or admired?", category: "", ageRange: [15, 99] },
{ id: "q173", text: "Is hell real-and what does the Bible actually say about it?", category: "", ageRange: [12, 99] },
{ id: "q174", text: "Who lives in hell?", category: "", ageRange: [15, 99] },
{ id: "q175", text: "Why would God send some people to hell if he loves them?", category: "", ageRange: [15, 99] },
{ id: "q176", text: "How do we avoid going to hell?", category: "", ageRange: [12, 99] },
{ id: "q177", text: "Why was hell created in the first place?", category: "", ageRange: [15, 99] },
{ id: "q178", text: "Is it wrong to listen to secular music as a Christian?", category: "", ageRange: [15, 99] },
{ id: "q179", text: "Does eveything I enjoy have to be explicitly Christian?", category: "", ageRange: [16, 99] },
{ id: "q180", text: "If something isn't a big sin, does it still matter to God?", category: "", ageRange: [15, 99] },
{ id: "q181", text: "Can something harmless (like music or fun) actually pull me away from God?", category: "", ageRange: [15, 99] },
{ id: "q182", text: "How do I know if what I'm enjoying is sinful or not?", category: "", ageRange: [15, 99] },
{ id: "q183", text: "How do I know which hobbies or pastimes lead me closer to God or away from him?", category: "", ageRange: [15, 99] },
{ id: "q184", text: "Can a hobby I love be an idol?", category: "", ageRange: [15, 99] },
{ id: "q185", text: "What is idolatry?", category: "", ageRange: [15, 99] },
{ id: "q186", text: "Why should I forgive those who wrong me?", category: "", ageRange: [15, 99] },
{ id: "q187", text: "Why does it seem like those who hurt me live happily while I still suffer? Where's God's justice?", category: "", ageRange: [15, 99] },
{ id: "q188", text: "Why should I keep following God if it only leads to suffering-and what if heaven isn't even real?", category: "", ageRange: [15, 99] },
{ id: "q189", text: "Why should i keep trying to do good when revenge feels good, skills feel useless and life feels unfair?", category: "", ageRange: [15, 99] },
{ id: "q190", text: "What happens after death-will there be a judgement day?", category: "", ageRange: [15, 99] },
{ id: "q191", text: "What does the Bible say about war and violence?", category: "", ageRange: [15, 99] },
{ id: "q192", text: "Where is heaven?", category: "", ageRange: [10, 99] },
{ id: "q193", text: "Where is hell?", category: "", ageRange: [10, 99] },
];

// function filterQuestionsByAge(optionalAge) {
  
//   const allBlocks = document.querySelectorAll(".category-block");
//   const selectedAge = optionalAge;
//    // 👈 this line saves age

//   allBlocks.forEach(block => {
//     const group = block.querySelector(".question-group");
    
//     //if no buttons for that group, then it's an empty array
//     const buttons = group?.querySelectorAll(".question-btn") || [];
//     const categoryBtn = block.querySelector(".category-btn"); // 🔧 Get the toggle button

//     let visibleCount = 0;

//     buttons.forEach(btn => {
//       const qid = btn.id;
//       //each question 
//       const question = questions.find(q => q.id === qid);

//       //sielewi mbona inasema block if button not there or age not there, tueke none
//       if (!question || isNaN(selectedAge)) {
//         btn.style.display = 'none';
//         visibleCount++;
//       } else if (selectedAge >= question.ageRange[0] && selectedAge <= question.ageRange[1]) {
//         btn.style.display = 'block';
//         visibleCount++;
//       } else {
//         btn.style.display = 'none';
//       }
//     });

//     if (visibleCount === 0) {
//       block.style.display = "none";          // 🔧 Hide the whole block (category)
//       if (categoryBtn) categoryBtn.style.display = "none";  // 🔧 Hide the category button too
//     } else {
//       block.style.display = "block";
//       if (categoryBtn) categoryBtn.style.display = "inline-block"; // 🔧 Show the category button
//       if (group) group.style.display = "none";              // Hide group by default
//     }
//   });
// }s
function filterQuestionsByAge(age) {
  // assuming questions is your big array of { question, ageRange, category, ... }
  return questions.filter(q => {
    return age >= q.ageRange[0] && age <= q.ageRange[1];
  });
}


