
// You can move this into a separate file later
const prayerPool = {
  love: {
    prayers: [
      "Dear God, help me to love others the way You love me — patiently, unconditionally, and without keeping score. When my heart grows cold or guarded, fill me with Your warmth so I can reflect Your love in everything I do. Amen.",
      "Father, You are love itself. Teach me to love when it’s easy and when it’s hard. Soften my heart when it’s been hardened by pain. Let Your perfect love cast out my fear and fill me with compassion for others. Amen.",
      "Lord, I want to be known for love — not bitterness, not judgment. Teach me to choose love even when I’ve been hurt. Heal my wounds so I don’t pass on pain. Let me see others the way You see them. Amen."
    ],
    bg: "backgrounds/aky.jpeg"
  },
  peace: {
    prayers: [
      "Jesus, my heart is restless and anxious. I’m overwhelmed by thoughts I can’t quiet. Please speak peace over my soul. Remind me that You are near, even when life feels out of control. Let me rest in You. Amen.",
      "God, I long for peace that goes deeper than circumstances. Replace my worry with stillness, my fear with faith. Help me breathe in Your presence and exhale all that weighs me down. You are my peace. Amen.",
      "Lord, in the middle of the noise, be my quiet place. Calm my racing heart and troubled mind. Help me slow down and hear Your whisper — telling me You’re here, and everything will be okay. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  },
  strength: {
    prayers: [
      "Lord, I feel so tired and weak. I’ve tried to do things in my own strength, and I’m worn out. Please carry me today. Be the power I don’t have. When I fall, lift me. When I doubt, remind me I’m not alone. Amen.",
      "God, You said Your strength is made perfect in weakness — so here I am. I don’t have it all together. I need You to hold me up and help me move forward when I feel like giving up. Amen.",
      "Heavenly Father, when I face things I cannot handle, help me lean on You. Let me remember that I don’t need to be strong alone. You are my rock, my refuge, and my strength. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  gratitude: {
    prayers: [
      "God, thank You for today. Thank You for breath in my lungs, a roof over my head, and people who care about me. Even when life isn’t easy, I see Your hand in the little things. You are so good. Amen.",
      "Lord, it’s easy to focus on what I don’t have — but today, I choose to thank You for all that You’ve already done. You’ve been faithful, even when I didn’t notice. I’m grateful. Amen.",
      "Father, help me develop a heart of gratitude, not just when things go right, but even in the storms. Remind me that thankfulness opens my eyes to see You more clearly. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  guidance: {
    prayers: [
      "Lord, I don’t always know which way to go. Please guide me. Light the path ahead — even if it’s just one step at a time. I trust that You’ll lead me where I need to be. Amen.",
      "God, help me not lean on my own understanding. I want to honor You in my decisions. Close the doors I shouldn’t walk through and open the ones that lead me closer to You. Amen.",
      "Father, when I feel confused or lost, be my compass. Let Your Word be the lamp to my feet. Give me wisdom, patience, and clarity as I wait for Your direction. Amen."
    ],
    bg: "backgrounds/help.jpeg"
  },
  forgiveness: {
    prayers: [
      "God, I’ve messed up. I’ve hurt others and made choices I’m not proud of. Please forgive me. Wash me clean and help me walk in freedom — not shame. Thank You for mercy I don’t deserve. Amen.",
      "Lord, help me forgive those who’ve hurt me. I don’t want to carry bitterness anymore. Just as You forgive me over and over, teach me to extend grace. Heal the parts of me that still feel broken. Amen.",
      "Father, thank You that Your forgiveness never runs out. You don’t hold my sins against me. Help me receive that truth and live like someone who’s truly free. Amen."
    ],
    bg: "backgrounds/everlasting.jpeg"
  },
  healing: {
    prayers: [
      "Lord, my body, my heart, and even my mind feel wounded. You are the God who heals. I invite You into my pain. Please bring comfort, restoration, and strength. Heal me, and make me whole. Amen.",
      "Jesus, I lift up those who are suffering right now — in hospitals, homes, or silently in their souls. Surround them with Your presence and touch their lives with Your healing power. Amen.",
      "Father, healing takes time, but I know You’re patient. Walk with me through this journey. Whether You heal me instantly or slowly, I choose to trust You. Amen."
    ],
    bg: "backgrounds/submission.jpeg"
  },
  courage: {
    prayers: [
      "God, I’m afraid. There are things ahead of me that feel too big. Give me courage not because I’m strong — but because You are. Let faith rise in me and fear lose its grip. Amen.",
      "Lord, help me stand for what’s right, even when I stand alone. Fill me with boldness to speak truth, to love well, and to walk in Your purpose. Amen.",
      "Jesus, when I feel small, remind me that You go with me. Like David with Goliath, help me believe that no fear is greater than Your power in me. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  desire: {
    prayers: [
      "God, sometimes I want things that won’t bring life. I’m drawn to things that don’t satisfy. Please purify my desires. Help me want what You want, and crave what brings me closer to You. Amen.",
      "Lord, You see every longing in my heart — the good and the confusing. Teach me to bring my desires to You, not hide them. If something isn’t good for me, change my heart. Amen.",
      "Father, when desire feels overwhelming, remind me that You are enough. Fill every empty space so I don’t look for love or happiness in the wrong places. You’re all I need. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  hope: {
    prayers: [
      "God, when life feels heavy and uncertain, remind me that hope is not gone. Your promises still stand. Let me hold onto You, even when I don’t see the way forward. Amen.",
      "Lord, help me believe that better days are coming — not because life is easy, but because You are faithful. You are my hope when I have none. Amen.",
      "Father, hope feels far right now. But I know You are near. Speak life into the dry places of my soul and renew my strength as I wait for Your goodness. Amen."
    ],
    bg: "backgrounds/sunrise.jpeg"
  },
  emotion: {
    prayers: [
      "God, my emotions are a mess right now. I feel too much and not enough. Please help me bring every feeling to You. Don’t let my emotions control me — let Your Spirit lead me. Amen.",
      "Lord, thank You that You made me emotional. But when my feelings get too loud, please help me quiet them with Your truth. Let peace be louder than panic. Amen.",
      "Father, some days I cry and don’t even know why. You see me. You understand. Thank You for being a safe place for every feeling I have. Teach me to process them with You, not alone. Amen."
    ],
    bg: "backgrounds/creator.jpg"
  },
  purpose: {
    prayers: [
      "God, sometimes I wonder if I matter. What am I here for? Please show me that my life has meaning in You. Use my gifts, my story, and even my pain for something good. Amen.",
      "Lord, I want to live a life that honors You. Guide me to the places and people where I can make a difference. Don’t let fear keep me from the purpose You’ve planned. Amen.",
      "Father, when I feel lost or stuck, remind me that You haven’t forgotten me. You’re still working. You’re still writing my story. Help me trust the process and follow Your lead. Amen."
    ],
    bg: "backgrounds/grass.jpeg"
  },
  serenity: {
    prayers: [
      "God give me the serenity to accept the things I cannot change, the courage to change the things I can and the wisdom to know the difference"
    ],
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  Lord: {
    prayers: [
      "Our Father who art in heaven, hallowed be thy name. Thy kingdom come. Thy will be done on Earth as it is in heaven, give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. Lead us not to temptation, but deliver us from evil. For thine is the kingdom, the power and the glory. Forever and ever. Amen."
    ],
    bg: "backgrounds/sky.jpeg"
  },
  
  // ==================== MORE CLASSIC PRAYERS ====================
  jabez: {
    prayers: [
      "Oh, that You would bless me indeed, and enlarge my territory, that Your hand would be with me, and that You would keep me from evil, that I may not cause pain! Amen. (1 Chronicles 4:10)"
    ],
    bg: "backgrounds/good.jpeg"
  },
  stfrancis: {
    prayers: [
      "Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; where there is sadness, joy. O Divine Master, grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love. For it is in giving that we receive; it is in pardoning that we are pardoned; and it is in dying that we are born to eternal life. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  },
  aaronblessing: {
    prayers: [
      "The Lord bless you and keep you; the Lord make His face shine upon you and be gracious to you; the Lord turn His face toward you and give you peace. Amen. (Numbers 6:24-26)"
    ],
    bg: "backgrounds/sunrise.jpeg"
  },
  psalm23: {
    prayers: [
      "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for His name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me. You prepare a table before me in the presence of my enemies; You anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever. Amen."
    ],
    bg: "backgrounds/grass.jpeg"
  },
  
  // ==================== EMOTIONAL & MENTAL HEALTH ====================
  anxiety: {
    prayers: [
      "Lord, my mind won't stop racing. Anxious thoughts keep me up at night and steal my peace during the day. Please quiet my soul. Remind me that You hold tomorrow, so I don't have to carry it today. Amen.",
      "God, I cast all my anxiety on You because You care for me. Help me release the 'what ifs' and trust in Your 'I am.' Replace my worry with worship, my fear with faith. Amen.",
      "Father, when panic rises in my chest, be my calm. When my thoughts spiral, anchor me in Your truth. I choose to trust You even when my feelings scream otherwise. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  },
  depression: {
    prayers: [
      "Lord, I feel so low. Some days it's hard to get out of bed. The darkness feels heavy. Please sit with me in this valley. Remind me that You're close to the brokenhearted. Don't let me lose hope. Amen.",
      "God, I don't have the words to explain how I feel. But You know. You see me struggling. Please lift this heaviness, even just a little. Help me take one step at a time toward the light. Amen.",
      "Father, depression lies to me. It tells me I'm worthless, that things will never get better. Speak Your truth over me. Remind me that I am loved, I am seen, and this season will pass. Amen."
    ],
    bg: "backgrounds/aky.jpeg"
  },
  loneliness: {
    prayers: [
      "God, I feel so alone. Even in a room full of people, I feel invisible. Please remind me that You are always with me. You see me. You know me. You will never leave me. Amen.",
      "Lord, loneliness aches in ways I can't always explain. Bring people into my life who truly care. Help me be vulnerable and let others in. And in the waiting, be my closest companion. Amen.",
      "Father, You said it's not good for man to be alone. I feel that deeply. Comfort me in this season. Use this time to draw me closer to You and prepare me for the relationships You have for me. Amen."
    ],
    bg: "backgrounds/everlasting.jpeg"
  },
  anger: {
    prayers: [
      "Lord, I'm angry. I don't even know what to do with this feeling. Help me not to sin in my anger. Give me self-control. Teach me to process this in a healthy way and not hurt others. Amen.",
      "God, I'm so frustrated. Things feel unfair. But I know holding onto anger will only poison me. Help me let go. Teach me to trust Your justice and leave room for Your work. Amen.",
      "Father, when anger rises in me, remind me to pause. Help me respond, not react. Let Your peace be stronger than my frustration. Guard my words and protect my relationships. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  fear: {
    prayers: [
      "God, fear has a grip on me that I can't shake. I'm scared of what's ahead, what could go wrong, what I can't control. Please replace my fear with faith. Remind me that You are bigger than anything I face. Amen.",
      "Lord, You have not given me a spirit of fear, but of power, love, and a sound mind. Help me walk in that truth. When fear whispers lies, let Your voice be louder. Amen.",
      "Father, I'm afraid of failing, of being rejected, of not being enough. But You call me Yours. Help me find my identity in You and not in my fears. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  
  // ==================== DAILY LIFE ====================
  morning: {
    prayers: [
      "Good morning, Lord. Thank You for waking me up today. I don't know what this day holds, but You do. Please guide my steps, guard my heart, and help me honor You in everything I do. Amen.",
      "Father, as I start this day, fill me with Your Spirit. Give me energy, focus, and peace. Help me see opportunities to love others and reflect Your light wherever I go. Amen.",
      "Lord, before the busyness begins, I pause to acknowledge You. Be first in my thoughts today. Help me prioritize what matters and let go of what doesn't. This day is Yours. Amen."
    ],
    bg: "backgrounds/sunrise.jpeg"
  },
  night: {
    prayers: [
      "Lord, thank You for today. As I lay down to sleep, I release every worry into Your hands. Guard my mind and give me peaceful rest. Tomorrow is in Your hands. Amen.",
      "Father, I confess the ways I fell short today. Thank You for Your grace that covers me. Help me sleep well and wake refreshed, ready to try again. Amen.",
      "God, as the day ends, I'm grateful for Your presence. Watch over me and my loved ones through the night. Let me rest in the knowledge that You never sleep. Amen."
    ],
    bg: "backgrounds/sky.jpeg"
  },
  work: {
    prayers: [
      "Lord, I commit my work to You today. Help me do my job with excellence and integrity. Give me patience with coworkers, wisdom in decisions, and purpose in every task. Amen.",
      "God, work can be stressful and draining. Please give me strength for today's challenges. Help me be a light in my workplace and honor You through my attitude and effort. Amen.",
      "Father, I want my work to be worship. Whether I'm seen or overlooked, help me work as unto You. Let my work ethic reflect Your character. Amen."
    ],
    bg: "backgrounds/help.jpeg"
  },
  job: {
    prayers: [
      "Lord, I need a job. The waiting is hard and the rejection hurts. Please open doors that no one can shut. Lead me to the right opportunity in Your perfect timing. I trust You. Amen.",
      "God, You know my skills, my passions, and my needs. Please connect me with the right job — one where I can grow, provide for my family, and make a difference. Amen.",
      "Father, job searching is exhausting. Give me hope when I feel discouraged. Help me prepare well, interview with confidence, and trust that You are working behind the scenes. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  finances: {
    prayers: [
      "Lord, I'm stressed about money. Bills are piling up and income feels short. Please provide for my needs. Help me be wise with what I have and trust You as my provider. Amen.",
      "God, teach me to be a good steward of my finances. Help me budget wisely, give generously, and not let money control my peace. You own it all — I'm just managing what You've entrusted to me. Amen.",
      "Father, break the grip of financial anxiety over my life. Whether I have little or much, help me be content. Provide for my needs and give me a heart of gratitude. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  exam: {
    prayers: [
      "Lord, I have an exam coming up and I'm nervous. Please calm my mind and help me remember what I've studied. Give me focus, clarity, and confidence. I trust the outcome to You. Amen.",
      "God, help me not to panic. I've prepared as best as I can. Now I ask for Your peace and wisdom as I take this test. Let me do my best and leave the rest to You. Amen.",
      "Father, exams can feel overwhelming. But You are with me. Help me think clearly, manage my time well, and not be paralyzed by fear. Thank You for being with me in the exam room. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  school: {
    prayers: [
      "Lord, bless my time in school today. Help me focus, learn, and grow. Give me patience with difficult subjects and kindness toward classmates and teachers. Amen.",
      "God, school can be hard — not just academically, but socially too. Help me navigate friendships, handle pressure, and stay true to who I am in You. Amen.",
      "Father, thank You for the opportunity to learn. Help me not take education for granted. Give me curiosity, discipline, and a love for growing in knowledge. Amen."
    ],
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  travel: {
    prayers: [
      "Lord, I'm about to travel. Please protect me on the road, in the air, or wherever I go. Keep me and my loved ones safe. Guide the drivers, pilots, and all involved. Amen.",
      "God, go before me on this journey. Remove any dangers and obstacles. Let me arrive safely and in peace. Thank You for being with me every mile. Amen.",
      "Father, I commit this trip to You. Whether for work, family, or rest, let it be blessed. Protect my luggage, my health, and my plans. Amen."
    ],
    bg: "backgrounds/grass.jpeg"
  },
  
  // ==================== RELATIONSHIPS ====================
  marriage: {
    prayers: [
      "Lord, bless my marriage. Help us love each other with patience and grace. When we disagree, help us communicate with kindness. Keep our bond strong and our hearts united. Amen.",
      "God, marriage is hard sometimes. Help me be the spouse my partner needs. Give me humility to apologize, patience to listen, and love that doesn't give up. Amen.",
      "Father, protect our marriage from anything that would tear us apart. Help us grow together, pray together, and build a home filled with Your presence. Amen."
    ],
    bg: "backgrounds/everlasting.jpeg"
  },
  relationship: {
    prayers: [
      "Lord, I lift my relationship to You. Help us build something that honors You. Give us wisdom, patience, and discernment. If this is right, bless it. If not, lead us gently. Amen.",
      "God, relationships are complicated. Help me communicate well, love selflessly, and set healthy boundaries. Guard my heart and guide my steps. Amen.",
      "Father, I pray for clarity in this relationship. Help me see it through Your eyes. Give me courage to have hard conversations and peace to trust Your plan. Amen."
    ],
    bg: "backgrounds/aky.jpeg"
  },
  singleness: {
    prayers: [
      "Lord, I'm single, and sometimes it's lonely. Help me embrace this season and not rush ahead of Your timing. Use this time to prepare me for what's next. Amen.",
      "God, I trust that You know the desires of my heart. While I wait, help me grow in You. Make me the person my future spouse will need. And if marriage isn't Your plan, give me peace. Amen.",
      "Father, contentment feels hard when everyone around me is in relationships. But I choose to find my completeness in You. Help me live fully in this season. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  children: {
    prayers: [
      "Lord, I lift my children to You. Protect them from harm, guide their steps, and help them know You. Give me wisdom to parent them well and patience when it's hard. Amen.",
      "God, I can't always be there for my kids. But You can. Watch over them at school, with friends, and online. Shield them from evil and draw their hearts to You. Amen.",
      "Father, help me raise my children in Your ways. Let our home be filled with love, truth, and grace. Give them a strong foundation that will carry them through life. Amen."
    ],
    bg: "backgrounds/creator.jpg"
  },
  parents: {
    prayers: [
      "Lord, bless my parents. Thank You for all they've done for me. Give them health, peace, and joy. Help me honor them well and show gratitude for their sacrifice. Amen.",
      "God, my relationship with my parents is complicated. Heal what's broken. Help me forgive where needed and extend grace. Bring restoration and understanding. Amen.",
      "Father, as my parents age, give me patience and compassion. Help me care for them the way they cared for me. Let our remaining time together be meaningful. Amen."
    ],
    bg: "backgrounds/everlasting.jpeg"
  },
  family: {
    prayers: [
      "Lord, I lift my family to You. Protect us, unite us, and help us love each other well. Heal any brokenness and bring peace to our home. Amen.",
      "God, family can be messy. Help us forgive past hurts, communicate better, and support one another. Let our home be a place of safety and love. Amen.",
      "Father, bless my family with health, provision, and Your presence. Draw each member closer to You. Make our bond stronger than any conflict we face. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  friends: {
    prayers: [
      "Lord, thank You for the friends You've placed in my life. Help me be a good friend — loyal, honest, and encouraging. Bless my friendships and help them grow. Amen.",
      "God, I need good friends. Bring people into my life who love You and will walk with me in faith. Help me be open and not isolate myself. Amen.",
      "Father, some friendships have hurt me. Help me heal and know which relationships to invest in. Give me wisdom to set boundaries and grace to let go when needed. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  },
  enemy: {
    prayers: [
      "Lord, You tell me to love my enemies and pray for those who hurt me. That's hard. But I choose to obey. Bless them, soften their hearts, and free me from bitterness. Amen.",
      "God, I don't understand why some people seem set against me. Help me not retaliate or hold grudges. Let Your love flow through me, even when it hurts. Amen.",
      "Father, protect me from those who wish me harm. But also change my heart so I don't become like them. Let forgiveness and grace be my weapons. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  
  // ==================== CRISIS & DIFFICULT TIMES ====================
  grief: {
    prayers: [
      "Lord, my heart is broken. I've lost someone dear to me and the pain is overwhelming. Please be close to me in this grief. Comfort me in ways only You can. Amen.",
      "God, I don't understand why this happened. I'm angry, sad, and confused. But I bring my grief to You. Hold me together when I feel like falling apart. Amen.",
      "Father, grief comes in waves. Some days I'm okay, other days I can barely breathe. Walk with me through this valley. Remind me that one day, You will wipe away every tear. Amen."
    ],
    bg: "backgrounds/aky.jpeg"
  },
  sickness: {
    prayers: [
      "Lord, I'm sick and I feel weak. Please bring healing to my body. Give doctors wisdom, medicine effectiveness, and my body strength to recover. I trust You with my health. Amen.",
      "God, sickness reminds me how fragile life is. Thank You for every healthy day I've had. Please restore my health and use this time to draw me closer to You. Amen.",
      "Father, I lift up everyone who is sick today. Bring comfort to the suffering, hope to the hopeless, and healing to those in need. You are the Great Physician. Amen."
    ],
    bg: "backgrounds/submission.jpeg"
  },
  addiction: {
    prayers: [
      "Lord, I'm struggling with addiction and I feel powerless. Please break these chains that bind me. Give me strength to resist temptation and people who will support my recovery. Amen.",
      "God, I've tried to quit on my own and failed. I need Your supernatural help. Renew my mind, heal my wounds, and set me free from this bondage. Amen.",
      "Father, addiction has stolen so much from me. But I believe You can restore what's been lost. One day at a time, help me walk in freedom and never look back. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  temptation: {
    prayers: [
      "Lord, I'm being tempted and it feels so strong. Help me resist. Give me an escape route and the strength to take it. I don't want to sin against You. Amen.",
      "God, temptation is everywhere. Guard my eyes, my heart, and my mind. Fill me with Your Spirit so there's no room for compromise. Amen.",
      "Father, when temptation comes, remind me of the consequences. Help me flee, not flirt with sin. Give me victory through Your power, not my willpower. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  disaster: {
    prayers: [
      "Lord, disaster has struck and everything feels chaotic. Please protect lives, provide for needs, and bring order out of this chaos. Be with first responders and those affected. Amen.",
      "God, in the face of earthquakes, floods, fires, or storms — You are still in control. Comfort the hurting, shelter the displaced, and bring communities together to rebuild. Amen.",
      "Father, natural disasters remind us how small we are. But You are mighty. Use this tragedy to draw people to You. Bring hope out of destruction. Amen."
    ],
    bg: "backgrounds/sky.jpeg"
  },
  injustice: {
    prayers: [
      "Lord, there's so much injustice in this world. People are suffering because of greed, hatred, and evil. Please bring justice. Defend the oppressed and expose wrongdoing. Amen.",
      "God, when I see injustice, it makes me angry. Show me what I can do to make a difference. Give me courage to speak up and compassion to help those who are hurting. Amen.",
      "Father, You are a God of justice. Even when the wicked seem to prosper, I trust that You see everything. One day, every wrong will be made right. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  persecution: {
    prayers: [
      "Lord, I pray for Christians around the world who are persecuted for their faith. Give them courage, protection, and supernatural peace. Don't let their faith waver. Amen.",
      "God, some believers face prison, violence, or death because of You. Strengthen them. Be their defender and refuge. Turn the hearts of their persecutors. Amen.",
      "Father, if I ever face persecution, help me stand firm. Give me words to speak and grace to endure. Let my life point others to You, no matter the cost. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  war: {
    prayers: [
      "Lord, there is war in our world. Innocent lives are being lost, families torn apart, and nations devastated. Please bring peace. Soften the hearts of leaders and protect the vulnerable. Amen.",
      "God, war brings out the worst in humanity. But You are the Prince of Peace. Intervene in conflict zones. Comfort refugees. Heal the trauma of those who've seen too much. Amen.",
      "Father, I pray for soldiers on all sides — many who don't want to fight. Protect them and bring them home safely. Use even this tragedy to draw people to You. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  
  // ==================== SPIRITUAL GROWTH ====================
  faith: {
    prayers: [
      "Lord, I want my faith to grow. Help me trust You more — not just when things are good, but when life is hard. Increase my faith where doubt creeps in. Amen.",
      "God, faith the size of a mustard seed can move mountains. I feel like mine is small, but I give it to You. Grow it into something mighty for Your glory. Amen.",
      "Father, help me walk by faith, not by sight. When I can't see the way forward, let me trust that You're leading me. My faith is in You, not circumstances. Amen."
    ],
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  wisdom: {
    prayers: [
      "Lord, I need wisdom — not just knowledge, but understanding. Help me make decisions that honor You. Give me discernment to see clearly and choose wisely. Amen.",
      "God, Your Word says if anyone lacks wisdom, they should ask You. So I'm asking. Guide my thoughts and actions. Help me avoid foolish mistakes. Amen.",
      "Father, wisdom is more valuable than gold. Help me seek it daily in Your Word, in prayer, and in godly counsel. Make me wise, not just smart. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  patience: {
    prayers: [
      "Lord, I'm not a patient person. Waiting frustrates me. Slow progress discourages me. Please teach me patience. Help me trust Your timing and find peace in the process. Amen.",
      "God, patience is a fruit of the Spirit. Grow it in me. When things don't happen on my schedule, help me surrender to Yours. Amen.",
      "Father, help me be patient with others, especially when they annoy me. Remind me how patient You've been with me. Let me extend the same grace. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  },
  humility: {
    prayers: [
      "Lord, pride is sneaky. It creeps into my heart before I realize it. Humble me. Help me think of others more than myself and give You credit for everything good in my life. Amen.",
      "God, You resist the proud but give grace to the humble. I want Your grace, not resistance. Break my pride and cultivate humility in me. Amen.",
      "Father, help me serve without recognition, love without applause, and work without needing praise. Let my life point to You, not me. Amen."
    ],
    bg: "backgrounds/submission.jpeg"
  },
  obedience: {
    prayers: [
      "Lord, I want to obey You, but it's not always easy. Help me follow Your commands even when they're hard. Give me a heart that delights in doing Your will. Amen.",
      "God, obedience is better than sacrifice. Help me listen to Your voice and act on what You say. Don't let me just hear the Word but never do it. Amen.",
      "Father, when obedience costs me something, remind me that it's always worth it. You know what's best. Help me trust and obey. Amen."
    ],
    bg: "backgrounds/help.jpeg"
  },
  holiness: {
    prayers: [
      "Lord, I want to be holy as You are holy. Cleanse me from sin and set me apart for Your purposes. Help me pursue purity in thought, word, and deed. Amen.",
      "God, holiness isn't popular in today's world. But I don't want to blend in — I want to stand out for You. Give me strength to live differently. Amen.",
      "Father, I can't be holy on my own. It's only by Your Spirit that I can live a life that honors You. Fill me and transform me from the inside out. Amen."
    ],
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  salvation: {
    prayers: [
      "Lord, I confess that I am a sinner in need of a Savior. I believe Jesus died for my sins and rose again. I invite You into my heart. Save me and make me new. Amen.",
      "God, thank You for the gift of salvation — free, unearned, and eternal. Help me never take it for granted. Let me live in gratitude for what Jesus did for me. Amen.",
      "Father, I pray for those who don't know You yet. Open their eyes to the truth. Use me to share the good news. Let many come to salvation through Your love. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  revival: {
    prayers: [
      "Lord, we need revival — in our hearts, our churches, and our nations. Pour out Your Spirit afresh. Awaken believers and draw the lost to You. Let revival start with me. Amen.",
      "God, I'm hungry for more of You. Revive my passion for prayer, Your Word, and worship. Don't let me settle for lukewarm faith. Set my heart on fire. Amen.",
      "Father, history shows what happens when You move in power. Do it again. Break through apathy and religion. Bring true revival that transforms lives and communities. Amen."
    ],
    bg: "backgrounds/sunrise.jpeg"
  },
  church: {
    prayers: [
      "Lord, I pray for my church. Unite us in love, truth, and mission. Raise up leaders who follow You wholeheartedly. Let our church be a light in our community. Amen.",
      "God, help the global church to be one — not divided by denominations or politics, but united by our love for You and each other. Amen.",
      "Father, protect churches from false teaching, scandal, and division. Make us places of healing, hope, and true worship. Let people encounter You when they walk through our doors. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  
  // ==================== WORLD & NATION ====================
  nation: {
    prayers: [
      "Lord, I pray for my nation. Bless our leaders with wisdom and integrity. Heal divisions, bring justice, and let righteousness prevail. May we turn back to You. Amen.",
      "God, our country has many problems — politically, socially, and spiritually. Only You can bring true change. Move in the hearts of people. Bring revival and transformation. Amen.",
      "Father, I pray for peace in our nation. Calm tensions, stop violence, and help us treat each other with dignity and respect. May we be 'one nation under God' in more than just words. Amen."
    ],
    bg: "backgrounds/sky.jpeg"
  },
  leaders: {
    prayers: [
      "Lord, I pray for those in authority — presidents, prime ministers, governors, mayors. Give them wisdom to lead justly. Surround them with godly counsel. Amen.",
      "God, You establish leaders and remove them. I trust You're in control. Help our leaders make decisions that honor You and benefit the people they serve. Amen.",
      "Father, whether I agree with my leaders or not, You tell me to pray for them. So I do. Bless them, guide them, and draw their hearts toward You. Amen."
    ],
    bg: "backgrounds/wisdom.jpeg"
  },
  world: {
    prayers: [
      "Lord, I pray for the whole world — every nation, every people group. Bring Your kingdom on earth as it is in heaven. Let Your name be known from east to west. Amen.",
      "God, there's so much pain in this world — hunger, disease, war, injustice. Move Your church to action. Use us to bring Your love and relief to those who suffer. Amen.",
      "Father, You so loved the world that You gave Your Son. Help us love the world the same way — not with judgment, but with compassion and the message of hope. Amen."
    ],
    bg: "backgrounds/grass.jpeg"
  },
  missionaries: {
    prayers: [
      "Lord, I pray for missionaries around the world. Protect them, provide for them, and give them fruit for their labor. Encourage them when they feel alone. Amen.",
      "God, bless those who've left comfort to share Your gospel in hard places. Open doors for the Word to spread. Bring many to faith through their sacrifice. Amen.",
      "Father, raise up more workers for the harvest. Call young people to the mission field. Equip and send them to the nations that have never heard Your name. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  
  // ==================== PROTECTION ====================
  protection: {
    prayers: [
      "Lord, I ask for Your protection over my life. Guard me from harm, danger, and evil. Cover me with Your wings and keep me safe in Your presence. Amen.",
      "God, You are my refuge and fortress. I trust in You. Protect my family, my home, and my health. Let no weapon formed against us prosper. Amen.",
      "Father, I face spiritual battles I can't see. Protect my mind from lies, my heart from deception, and my soul from the enemy's schemes. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  spiritual_warfare: {
    prayers: [
      "Lord, I put on the full armor of God. The belt of truth, breastplate of righteousness, shoes of peace, shield of faith, helmet of salvation, and sword of the Spirit. I stand firm against the enemy. Amen.",
      "God, I resist the devil and he must flee. I plead the blood of Jesus over my life and declare that no weapon formed against me will prosper. Amen.",
      "Father, open my eyes to see the spiritual battles around me. Give me discernment, wisdom, and courage to fight in Your power, not mine. Victory belongs to You. Amen."
    ],
    bg: "backgrounds/protects.jpeg"
  },
  nightmares: {
    prayers: [
      "Lord, I've been troubled by bad dreams. Please guard my sleep tonight. Let Your peace surround my mind and give me restful, undisturbed sleep. Amen.",
      "God, I rebuke any nightmares or spiritual attacks while I sleep. Fill my dreams with Your presence and protect my subconscious from fear. Amen.",
      "Father, when I lay down, help me release the day's worries. Let Your angels watch over me through the night. I trust my rest to You. Amen."
    ],
    bg: "backgrounds/sky.jpeg"
  },
  
  // ==================== SPECIAL OCCASIONS ====================
  birthday: {
    prayers: [
      "Lord, thank You for another year of life. I'm grateful for every experience — the good, the hard, and everything in between. Bless this new year with Your presence and purpose. Amen.",
      "God, on my birthday I reflect on Your faithfulness. You've brought me this far. Guide me in the year ahead. Help me live each day for Your glory. Amen.",
      "Father, I don't know what this new year holds, but You do. Fill it with growth, joy, and meaningful moments. Thank You for the gift of life. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  newyear: {
    prayers: [
      "Lord, as a new year begins, I commit it to You. Be my guide, my strength, and my hope. Help me leave behind what needs to stay in the past and embrace what's ahead. Amen.",
      "God, I don't make resolutions — I make surrenders. I give You this year. Do with it what You will. Surprise me with Your goodness and grow me through challenges. Amen.",
      "Father, thank You for fresh starts. As the calendar turns, turn my heart more toward You. Make this year count for eternity. Amen."
    ],
    bg: "backgrounds/sunrise.jpeg"
  },
  thanksgiving: {
    prayers: [
      "Lord, today I pause to give thanks. Not just for blessings I can see, but for answered prayers, protection I wasn't aware of, and grace I didn't deserve. You are good. Amen.",
      "God, in a world focused on more, help me be thankful for enough. For food, shelter, health, and people who love me — I am truly blessed. Amen.",
      "Father, gratitude changes my perspective. Help me cultivate a thankful heart all year, not just today. Let praise be on my lips always. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  easter: {
    prayers: [
      "Lord, on this Easter, I celebrate the resurrection of Jesus. Death could not hold Him. The grave is empty. Because He lives, I can face tomorrow. Thank You for victory! Amen.",
      "God, Easter reminds me that the cross wasn't the end — it was the beginning. Thank You for new life, new hope, and the promise of eternity. Amen.",
      "Father, help me live in resurrection power every day, not just on Easter. The same power that raised Jesus lives in me. Let me walk in that truth. Amen."
    ],
    bg: "backgrounds/eternal.jpeg"
  },
  christmas: {
    prayers: [
      "Lord, on this Christmas, I celebrate the birth of Jesus — Emmanuel, God with us. Thank You for leaving heaven to save us. You are the greatest gift. Amen.",
      "God, amid the presents and celebrations, help me keep my focus on You. Let this season be about worship, not just tradition. Amen.",
      "Father, bless families gathering today. Comfort those who are lonely or grieving. Let the hope of Christmas touch every heart. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  
  // ==================== MEALS ====================
  meal: {
    prayers: [
      "Lord, thank You for this food before us. Bless it to nourish our bodies. Thank You for providing for our needs. We don't take it for granted. Amen.",
      "God, as I eat this meal, I'm grateful for Your provision. Bless the hands that prepared it. Use this food to give me strength for Your work. Amen.",
      "Father, many in this world are hungry. While I enjoy this meal, help me remember those who have less. Show me how I can share what I have. Amen."
    ],
    bg: "backgrounds/good.jpeg"
  },
  
  // ==================== QUICK PRAYERS ====================
  quick: {
    prayers: [
      "Jesus, I need You right now. Amen.",
      "Lord, be with me today. Amen.",
      "God, I trust You. Amen.",
      "Father, give me strength. Amen.",
      "Holy Spirit, guide me. Amen.",
      "Lord, help me. Amen.",
      "God, I'm grateful. Amen.",
      "Jesus, I love You. Amen."
    ],
    bg: "backgrounds/peace.jpeg"
  }
};

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

function generatePrayerByTopic(topic) {
  const category = prayerPool[topic];
  if (!category) return;

  const prayers = category.prayers;
  const display = document.getElementById("prayerdisplay");
  const overlay = document.getElementById("overlay");
  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }

  if (prayers.length === 0) {
    display.textContent = "No prayers available for this topic yet.";
    display.style.display = "block";
    return;
  }

  const randomPrayer = prayers[Math.floor(Math.random() * prayers.length)];
  display.textContent = randomPrayer;
  display.style.display = "block";

  // ✅ Only change display background, not overlay
  display.style.backgroundImage = `url(${category.bg})`;
  display.style.backgroundSize = "cover";
  display.style.backgroundPosition = "center";
  display.style.backgroundRepeat = "no-repeat";
  display.style.padding = "20px";
  display.style.color = "black"; // improves contrast
  display.style.borderRadius = "10px";

  overlay.style.display = "block";

  // Add Amen button with confetti
  const amenBtn = document.createElement("button");
  amenBtn.innerText = "🙏 Amen";
  amenBtn.classList.add("innerbtn");
  amenBtn.style.marginRight = "10px";
  amenBtn.onclick = () => {
    
    // Throw confetti celebration
    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      confetti({ particleCount: 50, spread: 100, origin: { y: 0.7 }, startVelocity: 30 });
    }
    // Close modal after 1.2s delay so user sees confetti
    setTimeout(() => {
      overlay.style.display = "none";
      display.style.display = "none";
      display.innerHTML = "";
      display.style.backgroundImage = "";
    }, 1200);
    // Show toast notification
    if (typeof showPrayerToast === 'function') {
      showPrayerToast('🙏 Amen');
    }
  };

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  closeBtn.classList.add("innerbtn");
  closeBtn.onclick = () => {
    overlay.style.display = "none";
    display.style.display = "none";
    display.innerHTML = "";
    display.style.backgroundImage = ""; // Reset background
  };

  display.appendChild(document.createElement("br"));
  display.appendChild(amenBtn);
  display.appendChild(closeBtn);
}

let currentCategory = null;

function toggleCategory(id) {
  const selected = document.getElementById(id);
  if (!selected) return;

  const isVisible = selected.style.display === 'block';

  // Hide all question groups
  const allGroups = document.querySelectorAll('.question-group');
  allGroups.forEach(group => group.style.display = 'none');

  if (!isVisible) {
    selected.style.display = 'block';
    currentCategory = id;
    
    // Load prayer requests when opening the pray-for-others category
    if (id === 'category-pray-others') {
      loadPrayerRequests();
    }
  } else {
    currentCategory = null;
  }
}

// Load prayers on page load
  window.addEventListener("load", loadPrayers);

  function incrementPrayerCount() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const uidSuffix = user && user.id ? `:${user.id}` : ":guest";
    const current = parseInt(localStorage.getItem(`prayers_count${uidSuffix}`)) || 0;
    localStorage.setItem(`prayers_count${uidSuffix}`, current + 1);
    console.log(`🙏 Prayer count increased to ${current + 1}`);
  }

  function saveCustomPrayer() {
    const text = document.getElementById("customPrayer").value.trim();
    if (text) {
      const prayers = JSON.parse(localStorage.getItem("customPrayers")) || [];
      prayers.push(text);
      localStorage.setItem("customPrayers", JSON.stringify(prayers));
      incrementPrayerCount();

      addPrayerToList(text);
      document.getElementById("customPrayer").value = "";
      document.getElementById("customPrayer").style.display = "none";
      document.getElementById("savePrayer").style.display = "none";
    }
  }

  function addPrayerToList(text) {
    const li = document.createElement("li");
    li.className = "saved-prayer-item";
    
    // Prayer text (truncated preview)
    const prayerText = document.createElement("p");
    prayerText.className = "prayer-text";
    prayerText.textContent = text.length > 100 ? text.substring(0, 100) + "..." : text;
    prayerText.setAttribute("data-full-text", text);
    li.appendChild(prayerText);
    
    // Action buttons container
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "prayer-actions";
    
    // Pray button - opens the prayer in full view
    const prayBtn = document.createElement("button");
    prayBtn.innerHTML = "🙏 Pray";
    prayBtn.classList.add("innerbtn", "pray-action-btn");
    prayBtn.onclick = function() {
      openPrayerView(text);
    };
    
    // Edit button
    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️ Edit";
    editBtn.classList.add("innerbtn", "edit-action-btn");
    editBtn.onclick = function() {
      editPrayer(li, text);
    };
    
    // Share button
    const shareBtn = document.createElement("button");
    shareBtn.innerHTML = "📤 Share";
    shareBtn.classList.add("innerbtn", "share-action-btn");
    shareBtn.onclick = function() {
      sharePrayer(text);
    };
    
    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.classList.add("innerbtn", "delete-action-btn");
    deleteBtn.onclick = function() {
      if (confirm("Delete this prayer?")) {
        li.remove();
        removePrayerFromStorage(text);
      }
    };

    actionsDiv.appendChild(prayBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(shareBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(actionsDiv);
    
    document.getElementById("savedPrayers").appendChild(li);
  }
  
  // Open prayer in a beautiful full-screen view for praying
  function openPrayerView(text) {
    const display = document.getElementById("prayerdisplay");
    const overlay = document.getElementById("overlay");
    
    display.innerHTML = "";
    display.textContent = text;
    display.style.display = "block";
    display.style.backgroundImage = "url('backgrounds/spiritualgrowth.jpg')";
    display.style.backgroundSize = "cover";
    display.style.backgroundPosition = "center";
    display.style.padding = "20px";
    display.style.color = "black";
    display.style.borderRadius = "10px";
    
    overlay.style.display = "block";
    
    // Add Amen button
    const amenBtn = document.createElement("button");
    amenBtn.innerText = "🙏 Amen";
    amenBtn.classList.add("innerbtn");
    amenBtn.style.marginRight = "10px";
    amenBtn.onclick = () => {
      // Show toast instead of keeping modal open
      if (typeof showPrayerToast === 'function') {
        showPrayerToast('🙏 Amen');
      }
      // Throw confetti celebration
      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        confetti({ particleCount: 50, spread: 100, origin: { y: 0.7 }, startVelocity: 30 });
      }
      incrementPrayerCount();
      // Close modal after a short delay so user sees confetti
      setTimeout(() => {
        overlay.style.display = "none";
        display.style.display = "none";
        display.innerHTML = "";
        display.style.backgroundImage = "";
      }, 1200);
    };
    
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    closeBtn.classList.add("innerbtn");
    closeBtn.onclick = () => {
      overlay.style.display = "none";
      display.style.display = "none";
      display.innerHTML = "";
      display.style.backgroundImage = "";
    };
    
    display.appendChild(document.createElement("br"));
    display.appendChild(document.createElement("br"));
    display.appendChild(amenBtn);
    display.appendChild(closeBtn);
  }
  
  // Edit an existing prayer
  function editPrayer(li, oldText) {
    const textarea = document.getElementById("customPrayer");
    textarea.value = oldText;
    textarea.style.display = "block";
    document.getElementById("savePrayer").style.display = "block";
    
    // Scroll to textarea
    textarea.scrollIntoView({ behavior: "smooth" });
    textarea.focus();
    
    // Remove old prayer
    li.remove();
    removePrayerFromStorage(oldText);
  }
  
  // Share prayer
  function sharePrayer(text) {
    const prayerLink = "https://holy-verse.web.app/prayer.html";
    const shareText = text + `\n\n🙏 Pray with me: ${prayerLink}\n\nShared via HolyVerse`;
    
    if (navigator.share) {
      navigator.share({
        title: "My Prayer",
        text: shareText,
        url: prayerLink
      }).catch(err => console.log("Share cancelled"));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        showModal("Prayer copied to clipboard! You can now paste and share it.");
      }).catch(() => {
        showModal("Could not share. Please copy the prayer manually.");
      });
    }
  }


  function loadPrayers() {
    const prayers = JSON.parse(localStorage.getItem("customPrayers")) || [];
    prayers.forEach(prayer => addPrayerToList(prayer));
  }

  function removePrayerFromStorage(text) {
    let prayers = JSON.parse(localStorage.getItem("customPrayers")) || [];
    prayers = prayers.filter(p => p !== text);
    localStorage.setItem("customPrayers", JSON.stringify(prayers));
  }

  function showSpace() {
    document.getElementById("customPrayer").style.display = "block";
    document.getElementById("savePrayer").style.display = "block";
  }

const slides = [
  {
    text: `Hi there! Let’s learn how to pray for the first time.\n\n
Prayer is simply talking to God. You don’t need special words, a perfect voice, or a quiet church. God already knows your thoughts, but He loves when you speak to Him with your own words.`,
    bg: "backgrounds/spiritualgrowth.jpg"
  },
  {
    text: `Why do we pray?\n\n
We pray to build a relationship with God. Just like a friend, God wants to hear from you. In prayer, we thank Him, ask for help, confess our mistakes, and worship who He is. It's not about performance—it's about connection.`,
    bg: "backgrounds/eternal.jpg"
  },
  {
    text: `Let’s remember the ACTS model to help us:\n\n
A = Adoration: Start by telling God how great He is. He is loving, holy, powerful, kind. Just praise Him.\n
C = Confession: Be honest. Tell Him about your sins or things you're struggling with.`,
    bg: "backgrounds/aky.jpeg"
  },
  {
    text: `Next:\n\n
T = Thanksgiving: Thank God for what He’s done—your life, today, your family, even small joys.\n
S = Supplication: This is where you ask. Ask for help, wisdom, healing, peace, courage, or anything on your heart.`,
    bg: "backgrounds/grass.jpeg"
  },
  {
    text: `That’s it. You don’t need to be perfect. God just wants *you*.\n\n
Now let’s pray together. You can say this out loud, quietly, or in your heart.\n
When you're ready, press “Next” to begin.`,
    bg: "backgrounds/sunrise.jpeg"
  },
  {"": ""}
];

const finalPrayerLines = [
  "Dear God...", 
  "Thank You for loving me.",
  "I praise You for being good and kind.",
  "I’m sorry for the wrong things I’ve done.",
  "Thank You for forgiving me.",
  "Please help me love You more each day.",
  "In Jesus’ name, Amen."
];

function playFinalPrayer() {
  let i = 0;

  // Make sure the speech API exists
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported in this browser.");
    return;
  }
  
  
  const synth = window.speechSynthesis;

  function speakNext() {
    if (i >= finalPrayerLines.length) return;

    const utter = new SpeechSynthesisUtterance(finalPrayerLines[i]);
    utter.onend = () => {
      setTimeout(() => {
        i++;
        speakNext();
      }, 1500);
    };

    synth.speak(utter);
  }

  try {
    // Sometimes voices aren't ready right away
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => {
        speakNext();
      };
    } else {
      speakNext();
    }
  } catch (err) {
    console.error("Error using speech synthesis:", err);
  }
}

let currentSlide = 0;

function speak(text) {
  const synth = window.speechSynthesis;

  if (!synth) {
    console.warn("SpeechSynthesis not supported.");
    return;
  }

  const speakNow = () => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    synth.cancel(); // stop any current speech
    synth.speak(utter);
  };

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => speakNow();
  } else {
    speakNow();
  }
}

function showSlideshow() {
  currentSlide = 0;
  const nextBtn = document.getElementById("nextBtn");
if (nextBtn) nextBtn.style.display = "inline-block";
  const backBtn = document.getElementById("backBtnp");
if (backBtn) backBtn.style.display = "inline-block";
  document.getElementById("slideshow").classList.remove("hidden");
  updateSlide();
}

function updateSlide() {
  const slideBox = document.getElementById("slideContent");
  const slideShow = document.getElementById("slideshow");
  const { text, bg } = slides[currentSlide];

  slideBox.innerHTML = "";
  slideShow.style.backgroundImage = bg ? `url(${bg})` : "none";
  slideShow.style.backgroundPosition = "center";
  slideShow.style.backgroundSize = "cover";
  slideShow.style.backgroundRepeat = "no-repeat";
  slideShow.style.backgroundColor = bg ? "transparent" : "#cccccc"; // fallback color when no image
  slideBox.innerText = text;

  if (currentSlide === slides.length - 1) {
  // Hide the Next button during final prayer
const nextBtn = document.getElementById("nextBtn");
if (nextBtn) nextBtn.style.display = "none";
// Hide the Back button during final prayer
const backBtn = document.getElementById("backBtn");
if (backBtn) backBtn.style.display = "none";
  const slideBox = document.getElementById("slideContent");
  const slideShow = document.getElementById("slideshow");
  slideBox.innerHTML = ""; // Clear existing content
  slideShow.style.backgroundImage = `url(${slides[currentSlide].bg})`;

  let i = 0;

  function fadeInOutLine(lineText, onDone) {
    document.getElementById("slideshow").style.backgroundImage = "url(backgrounds/peace.jpeg)";
    const line = document.createElement("p");
    line.textContent = lineText;
    line.style.opacity = 0;
    line.style.transition = "opacity 1s";
    line.style.fontSize = "1.4em";
    line.style.margin = "10px 0";

    slideBox.appendChild(line);

    // Fade in
    setTimeout(() => {
      line.style.opacity = 1;

      // Speak if supported
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(lineText);
        utter.onend = () => {
          // Fade out (unless it’s the last line)
          if (i < finalPrayerLines.length - 1) {
            setTimeout(() => {
              line.style.opacity = 0;
              setTimeout(() => {
                line.remove();
                onDone();
              }, 1000); // after fade out
            }, 1000);
          } else {
            // Last line: keep it and show Try button
            showTryNow();
          }
        };
        window.speechSynthesis.speak(utter);
      } else {
        // Fallback: text only
        if (i < finalPrayerLines.length - 1) {
          setTimeout(() => {
            line.style.opacity = 0;
            setTimeout(() => {
              line.remove();
              onDone();
            }, 1000);
          }, 2000);
        } else {
          showTryNow();
        }
      }
    }, 100); // slight delay to trigger CSS transition
  }

  function showNextLine() {
    if (i < finalPrayerLines.length) {
      fadeInOutLine(finalPrayerLines[i], showNextLine);
      i++;
    }
  }

  function showTryNow() {
    const tryBtn = document.createElement("button");
    tryBtn.textContent = "Try Now";
    tryBtn.onclick = () => {
      document.getElementById("slideshow").classList.add("hidden");
      showSpace();
      setTimeout(() => {
        showModal("🎉 You just prayed for the first time!");
      }, 500);
    };
    tryBtn.classList.add("innerbtn");
    tryBtn.style.opacity = 0;
    tryBtn.style.transition = "opacity 1s";
    slideBox.appendChild(tryBtn);

    setTimeout(() => {
      tryBtn.style.opacity = 1;
    }, 500);
  }

  showNextLine();
  return;
}; // Start it
    // Just in case: fallback if speech fails or user has no audio
    setTimeout(showTryNow, 15000);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
  } else if (currentSlide === slides.length - 1) {
    // Already at final slide, make sure it's rendered
    updateSlide();
    document.getElementById("slideshow").style.backgroundImage = `url(backgrounds/pray.jpeg)`
    return;
  }
  updateSlide();
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlide();
  }
}

const prayerKeywords = {
  love: ["love", "lonely", "loving", "relationships", "compassion", "affection"],
  peace: ["peace", "anxious", "anxiety", "calm", "stillness", "panic", "rest"],
  strength: ["strength", "tired", "weak", "can’t go on", "overwhelmed"],
  gratitude: ["thanks", "thank you", "grateful", "gratitude", "appreciate"],
  guidance: ["guidance", "lost", "direction", "path", "decisions", "wisdom"],
  forgiveness: ["forgive", "guilt", "shame", "sorry", "regret"],
  healing: ["heal", "healing", "sick", "pain", "broken", "hurt"],
  courage: ["courage", "afraid", "fear", "boldness", "brave", "scared"],
  desire: ["desire", "crave", "want", "lust", "longing"],
  hope: ["hope", "hopeless", "dark", "future", "promise"],
  emotion: ["emotion", "feeling", "mood", "cry", "sad", "happy", "rollercoaster"],
  purpose: ["purpose", "meaning", "why", "exist", "calling", "destiny"]
};

function searchPrayerTopic() {
  const query = document.getElementById("prayerSearch").value.toLowerCase().trim();
  const resultsBox = document.getElementById("searchResults");
  resultsBox.innerHTML = "";

  if (query === "") {
    resultsBox.style.display = "none";
    return;
  }

  const matchedTopics = [];

  // Match against keywords
  for (const topic in prayerKeywords) {
    const keywords = prayerKeywords[topic];
    for (const word of keywords) {
      if (query.includes(word)) {
        matchedTopics.push(topic);
        break; // avoid duplicates
      }
    }
  }

  // Fallback: also check if query is close to the topic itself
  for (const topic in prayerPool) {
    if (topic.includes(query) && !matchedTopics.includes(topic)) {
      matchedTopics.push(topic);
    }
  }

  if (matchedTopics.length === 0) {
    resultsBox.innerHTML = "<p>No matching topics found. Try using words like 'fear', 'healing', or 'love'.</p>";
    resultsBox.style.display = "block";
    return;
  }

  resultsBox.style.display = "block";

  matchedTopics.forEach(topic => {
    const btn = document.createElement("button");
    btn.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
    btn.classList.add("innerbtn");
    btn.onclick = () => {
      generatePrayerByTopic(topic);
      resultsBox.innerHTML = "";
      resultsBox.style.display = "none";
      document.getElementById("prayerSearch").value = "";
    };
    resultsBox.appendChild(btn);
  });
}

// ========== PRAY FOR OTHERS ==========

// Submit a new prayer request
async function submitPrayerRequest() {
  const textarea = document.getElementById("prayerRequestText");
  const anonymousCheckbox = document.getElementById("anonymousPrayerRequest");
  const requestText = textarea.value.trim();

  if (!requestText) {
    showPrayerToast("Please share what you'd like us to pray for");
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const response = await fetch(`${API_BASE}/api/prayer-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: requestText,
        username: anonymousCheckbox.checked ? "Anonymous" : user.username,
        userId: anonymousCheckbox.checked ? null : user.id
      })
    });

    if (!response.ok) throw new Error("Failed to submit");

    showPrayerToast("🙏 Prayer request submitted. May God hear and answer");
    textarea.value = "";
    anonymousCheckbox.checked = false;
    loadPrayerRequests(); // Refresh the feed
  } catch (err) {
    console.error("Submit prayer request error:", err);
    showPrayerToast("Couldn't submit right now. Please try again");
  }
}

// Load all prayer requests
async function loadPrayerRequests() {
  const feed = document.getElementById("prayerRequestsFeed");
  
  try {
    const response = await fetch(`${API_BASE}/api/prayer-requests`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to load prayer requests:", response.status, errorText);
      throw new Error("Failed to load");
    }
    
    const requests = await response.json();
    
    if (requests.length === 0) {
      feed.innerHTML = `
        <div style="text-align:center; padding:2rem; opacity:0.6;">
          <p>No prayer requests yet</p>
          <p style="font-size:0.9rem; margin-top:0.5rem;">Be the first to share something you need prayer for</p>
        </div>
      `;
      return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    
    feed.innerHTML = requests.map(req => {
      const date = new Date(req.created_at);
      const timeAgo = getTimeAgo(date);
      const prayedText = req.prayed_count === 1 ? "1 person praying" : `${req.prayed_count || 0} people praying`;
      const displayName = req.username === "Anonymous" ? "Anonymous" : "A fellow believer";
      // Check ownership: either by user_id match OR username match (fallback for numeric IDs)
      const isOwner = (req.user_id && currentUser.id && String(req.user_id) === String(currentUser.id)) ||
                      (req.username && currentUser.username && req.username === currentUser.username && req.username !== "Anonymous");
      
      return `
        <div class="prayer-request-card" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px; margin-bottom:1rem; border-left:3px solid var(--accent);">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
            <small style="opacity:0.7; font-size:0.85rem;">${displayName} • ${timeAgo}</small>
            ${isOwner ? `<button class="delete-prayer-btn" data-request-id="${req.id}" style="background:transparent; color:rgba(255,255,255,0.5); border:none; cursor:pointer; font-size:1.2rem; padding:0; line-height:1;" title="Delete prayer request">×</button>` : ''}
          </div>
          <p style="margin:0.5rem 0; line-height:1.6; white-space:pre-wrap;">${escapeHtml(req.text)}</p>
          <div style="display:flex; align-items:center; gap:1rem; margin-top:0.75rem; flex-wrap:wrap;">
            <button class="pray-for-btn" data-request-id="${req.id}" style="background:var(--accent); color:var(--text-color); border:none; padding:0.5rem 1rem; border-radius:6px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
              <span>🙏</span>
              <span>I'm Praying</span>
            </button>
            <small class="prayer-count" style="opacity:0.7; font-size:0.85rem; ${isOwner ? '' : 'display:none;'}">${prayedText}</small>
          </div>
        </div>
      `;
    }).join("");
    
  } catch (err) {
    console.error("Load prayer requests error:", err);
    feed.innerHTML = `<p style="text-align:center; opacity:0.6;">Couldn't load prayer requests. Please refresh.</p>`;
  }
}

// Mark that you've prayed for a request
async function prayForRequest(requestId, button) {
  try {
    const response = await fetch(`${API_BASE}/api/prayer-requests/${requestId}/pray`, {
      method: "POST"
    });

    if (!response.ok) throw new Error("Failed to mark as prayed");

    // Update button visually
    button.style.background = "rgba(255,255,255,0.2)";
    button.innerHTML = `<span>✓</span><span>Prayed</span>`;
    button.disabled = true;
    button.style.cursor = "default";

    // Show encouraging message
    const messages = [
      "Thank you for praying 🙏",
      "Your prayers matter ❤️",
      "God hears every prayer 🕊️",
      "May your faith be strengthened 💪",
      "Praying together is powerful 🔥"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showPrayerToast(randomMessage);

    // Update the prayer count text
    const card = button.closest(".prayer-request-card");
    const countText = card.querySelector("small:last-child");
    if (countText) {
      const currentCount = parseInt(countText.textContent) || 0;
      const newCount = currentCount + 1;
      countText.textContent = newCount === 1 ? "1 person praying" : `${newCount} people praying`;
    }

  } catch (err) {
    console.error("Pray for request error:", err);
    showPrayerToast("Couldn't mark prayer right now");
  }
}

// Helper: Get relative time (e.g., "2 hours ago")
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}



// Event delegation for prayer buttons
document.addEventListener('click', function(e) {
  if (e.target.closest('.pray-for-btn')) {
    const button = e.target.closest('.pray-for-btn');
    const requestId = button.getAttribute('data-request-id');
    if (requestId) {
      prayForRequest(requestId, button);
    }
  }
  
  if (e.target.closest('.delete-prayer-btn')) {
    const button = e.target.closest('.delete-prayer-btn');
    const requestId = button.getAttribute('data-request-id');
    if (requestId) {
      deletePrayerRequest(requestId);
    }
  }
});

// Delete a prayer request
async function deletePrayerRequest(requestId) {
  showConfirm("Are you sure you want to delete this prayer request?", async () => {
    try {
      const res = await fetch(`${API_BASE}/prayer-requests/${requestId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        showPrayerToast("Prayer request deleted");
        loadPrayerRequests();
      } else {
        showPrayerToast("Failed to delete");
      }
    } catch (err) {
      showPrayerToast("Couldn't delete right now");
    }
  });
}

// Auto-load prayer requests if category is already open on page load
window.addEventListener('DOMContentLoaded', function() {
  const category = document.getElementById('category-pray-others');
  if (category && !category.classList.contains('hidden')) {
    loadPrayerRequests();
  }
});