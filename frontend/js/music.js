// Enhanced Music Player with Expanded Library and Hymnbook

document.addEventListener('DOMContentLoaded', () => {
  const categories = [
    { id: 'worship', title: 'Worship', subtitle: 'Encounter God', img: 'backgrounds/worship.png' },
    { id: 'praise', title: 'Praise', subtitle: 'Lift praise high', img: 'backgrounds/praise.png' },
    { id: 'thanksgiving', title: 'Thanksgiving', subtitle: 'Give thanks', img: 'backgrounds/thanksgiving.png' },
    { id: 'gospel', title: 'Gospel', subtitle: 'Gospel classics', img: 'backgrounds/gospel.png' },
    { id: 'contemporary', title: 'Contemporary', subtitle: 'Modern worship', img: 'backgrounds/contemporary.png' },
    { id: 'prayer', title: 'Prayer & Devotion', subtitle: 'Intimate moments', img: 'backgrounds/prayer.png' },
    { id: 'spiritual', title: 'Spiritual', subtitle: 'Deep connection', img: 'backgrounds/spiritual.png' },
    { id: 'hymnbook', title: '📖 Hymnbook', subtitle: 'Classic hymns', img: 'backgrounds/hymnbook.png', isHymnBook: true }
  ];

  // Extended hymn collection for hymnbook
  // NOTE: SoundHelix URLs are just placeholder demo audio files (free, but not actual hymns)
  // Replace with real hymn recordings or direct MP3 links from:
  // - Archive.org (public domain hymns)
  // - Licensed music services
  const hymnbook = [
    { number: 1, title: 'It Is Well With My Soul', author: 'Horatio Spafford', year: 1876, tune: 'Ville du Havre', 
      youtube: 'NwXAhcVQZps', 
      soundcloud: 'https://soundcloud.com/jonathanogdenmusic/it-is-well-with-my-soul',
      lyrics: `When peace like a river attendeth my way\nWhen sorrows like sea billows roll\nWhatever my lot Thou hast taught me to say\nIt is well it is well with my soul\n\nIt is well with my soul\nIt is well it is well with my soul\n\nThough Satan should buffet though trials should come\nLet this blest assurance control\nThat Christ has regarded my helpless estate\nAnd hath shed His own blood for my soul\n\nIt is well with my soul\nIt is well it is well with my soul\n\nMy sin oh the bliss of this glorious thought\nMy sin not in part but the whole\nIs nailed to the cross and I bear it no more\nPraise the Lord praise the Lord O my soul\n\nIt is well with my soul\nIt is well it is well with my soul\n\nAnd Lord haste the day when my faith shall be sight\nThe clouds be rolled back as a scroll\nThe trump shall resound and the Lord shall descend\nEven so it is well with my soul\n\nIt is well with my soul\nIt is well it is well with my soul` },

    { number: 2, title: 'Great Is Thy Faithfulness', author: 'Thomas Chisholm', year: 1923, tune: 'Faithfulness', 
      youtube: 'ErwiBz1QA4o',
      soundcloud: 'https://soundcloud.com/nycypcd/great-is-thy-faithfulness',
      lyrics: `Great is Thy faithfulness O God my Father\nThere is no shadow of turning with Thee\nThou changest not Thy compassions they fail not\nAs Thou hast been Thou forever will be\n\nGreat is Thy faithfulness great is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness Lord unto me\n\nSummer and winter and springtime and harvest\nSun moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness mercy and love\n\nGreat is Thy faithfulness great is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness Lord unto me\n\nPardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine with ten thousand beside\n\nGreat is Thy faithfulness great is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness Lord unto me` },
    { number: 3, title: 'Holy Holy Holy', author: 'Reginald Heber', year: 1826, tune: 'Nicaea', youtube: 'JwuDSw-9cUQ', soundcloud: 'https://soundcloud.com/rania-maher-15/holy-holy-holy-lord-god-almighty-agnus-dei-youtubevia-torchbrowsercom', lyrics: `Holy holy holy Lord God Almighty\nEarly in the morning our song shall rise to Thee\nHoly holy holy merciful and mighty\nGod in three persons blessed Trinity\n\nHoly holy holy all the saints adore Thee\nCasting down their golden crowns around the glassy sea\nCherubim and seraphim falling down before Thee\nWhich wert and art and evermore shalt be\n\nHoly holy holy though the darkness hide Thee\nThough the eye of sinful man Thy glory may not see\nOnly Thou art holy there is none beside Thee\nPerfect in power in love and purity\n\nHoly holy holy Lord God Almighty\nAll Thy works shall praise Thy name in earth and sky and sea\nHoly holy holy merciful and mighty\nGod in three persons blessed Trinity` },
    { number: 4, title: 'Be Thou My Vision', author: 'Irish Hymn', year: 800, tune: 'Slane', youtube: 'Optrm7lF16s', soundcloud: 'https://soundcloud.com/nycypcd/be-thou-my-vision', lyrics: `Be Thou my vision O Lord of my heart\nNaught be all else to me save that Thou art\nThou my best thought by day or by night\nWaking or sleeping Thy presence my light\n\nBe Thou my wisdom and Thou my true Word\nI ever with Thee and Thou with me Lord\nThou my great Father I Thy true son\nThou in me dwelling and I with Thee one\n\nRiches I heed not nor man's empty praise\nThou mine inheritance now and always\nThou and Thou only first in my heart\nHigh King of heaven my treasure Thou art\n\nHigh King of heaven my victory won\nMay I reach heaven's joys O bright heaven's Sun\nHeart of my own heart whatever befall\nStill be my vision O Ruler of all` },
    { number: 5, title: 'Amazing Grace', author: 'John Newton', year: 1779, tune: 'New Britain', youtube: 'Tvt6E9N7AQw', soundcloud: 'https://soundcloud.com/iayzeofficial/amazing-grace-prod-mista', lyrics: `Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see\n\nTwas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed\n\nThrough many dangers toils and snares\nI have already come\nTis grace has brought me safe thus far\nAnd grace will lead me home\n\nWhen we've been there ten thousand years\nBright shining as the sun\nWe've no less days to sing God's praise\nThan when we'd first begun` },
    { number: 6, title: 'Jesus Loves Me', author: 'Anna Bartlett Warner', year: 1862, tune: 'Jesus Loves Me', youtube: 'LD1_CPqJusg', soundcloud: 'https://soundcloud.com/singhosanna/jesus-loves-me-this-i-know', lyrics: `Jesus loves me this I know\nFor the Bible tells me so\nLittle ones to Him belong\nThey are weak but He is strong\n\nYes Jesus loves me\nYes Jesus loves me\nYes Jesus loves me\nThe Bible tells me so\n\nJesus loves me He who died\nHeaven's gate to open wide\nHe will wash away my sin\nLet His little child come in` },
    { number: 7, title: 'O Come All Ye Faithful', author: 'John Francis Wade', year: 1751, tune: 'Adeste Fideles', youtube: '1tM5pwvUGMI', soundcloud: 'https://soundcloud.com/soothingrelaxation/o-come-all-ye-faithful', lyrics: `O come all ye faithful\nJoyful and triumphant\nO come ye O come ye to Bethlehem\nCome and behold Him\nBorn the King of Angels\n\nO come let us adore Him\nO come let us adore Him\nO come let us adore Him\nChrist the Lord\n\nSing choirs of angels\nSing in exultation\nSing all ye citizens of heaven above\nGlory to God\nGlory in the highest` },
    { number: 8, title: 'Rock of Ages',  author: 'Augustus Toplady', year: 1776, tune: 'Toplady', youtube: 'gM7gt_cSxjw', soundcloud: 'https://soundcloud.com/hymnstream/rock-of-ages-hymn-1058', lyrics: `Rock of ages cleft for me\nLet me hide myself in Thee\nLet the water and the blood\nFrom Thy riven side which flowed\nBe of sin the double cure\nSave from wrath and make me pure\n\nNot the labors of my hands\nCan fulfill Thy law's demands\nCould my zeal no respite know\nCould my tears forever flow\nAll for sin could not atone\nThou must save and Thou alone` },
    { number: 9, title: 'Abide With Me', author: 'Henry Francis Lyte', year: 1847, tune: 'Eventide', youtube: 'PzmvagnGTYY', soundcloud: 'https://soundcloud.com/theoxfordtrinitychoir/abide-with-me', lyrics: `Abide with me fast falls the eventide\nThe darkness deepens Lord with me abide\nWhen other helpers fail and comforts flee\nHelp of the helpless O abide with me\n\nSwift to its close ebbs out lifes little day\nEarth joys grow dim its glories pass away\nChange and decay in all around I see\nO Thou who changest not abide with me\n\nI need Thy presence every passing hour\nWhat but Thy grace can foil the tempter's power\nWho like Thyself my guide and stay can be\nThrough cloud and sunshine Lord abide with me` },
    { number: 10, title: 'What A Friend We Have In Jesus', author: 'Joseph Scriven', year: 1855, tune: 'Converse', youtube: 'TAyaXdvvbGU', soundcloud: 'https://soundcloud.com/gouri/what-a-friend-we-have-in-jesus', lyrics: `What a friend we have in Jesus\nAll our sins and griefs to bear\nWhat a privilege to carry\nEverything to God in prayer\n\nO what peace we often forfeit\nO what needless pain we bear\nAll because we do not carry\nEverything to God in prayer\n\nHave we trials and temptations\nIs there trouble anywhere\nWe should never be discouraged\nTake it to the Lord in prayer` },
    { number: 11, title: 'Just As I Am', author: 'Charlotte Elliott', year: 1835, tune: 'Woodworth', youtube: '7lxqhPC1mNA', soundcloud: 'https://soundcloud.com/hymnstream/just-as-i-am', lyrics: `Just as I am without one plea\nBut that Thy blood was shed for me\nAnd that Thou bidst me come to Thee\nO Lamb of God I come I come\n\nJust as I am and waiting not\nTo rid my soul of one dark blot\nTo Thee whose blood can cleanse each spot\nO Lamb of God I come I come\n\nJust as I am though tossed about\nWith many a conflict many a doubt\nFightings and fears within without\nO Lamb of God I come I come` },
    { number: 12, title: 'Nearer My God To Thee', author: 'Sarah Flower Adams', year: 1841, tune: 'Bethel', youtube: 'gWz4feHp0ko', soundcloud: 'https://soundcloud.com/hannes-valur/nearer-my-god-to-thee', lyrics: `Nearer my God to Thee nearer to Thee\nE'en though it be a cross that raiseth me\nStill all my song shall be\nNearer my God to Thee\nNearer my God to Thee nearer to Thee\n\nThough like the wanderer the sun gone down\nDarkness be over me my rest a stone\nYet in my dreams I'd be\nNearer my God to Thee\nNearer my God to Thee nearer to Thee` },
    { number: 13, title: 'Jesus Christ Is Risen Today', author: 'Lyra Davidica', year: 1708, tune: 'Easter Hymn', youtube: 'PcTP3Pj6Smo', soundcloud: 'https://soundcloud.com/ekwemnachukwuenespanol/christ-the-lord-is-risen-today', lyrics: `Jesus Christ is risen today Alleluia\nOur triumphant holy day Alleluia\nWho did once upon the cross Alleluia\nSuffer to redeem our loss Alleluia\n\nHymns of praise then let us sing Alleluia\nUnto Christ our heavenly King Alleluia\nWho endured the cross and grave Alleluia\nSinners to redeem and save Alleluia` },
    { number: 14, title: 'Joy To The World', author: 'Isaac Watts', year: 1719, tune: 'Antioch', youtube: '30OaM6b48k8', soundcloud: 'https://soundcloud.com/cafemusicbgmofficial/joy-to-the-world-6', lyrics: `Joy to the world the Lord is come\nLet earth receive her King\nLet every heart prepare Him room\nAnd heaven and nature sing\nAnd heaven and nature sing\nAnd heaven and heaven and nature sing\n\nJoy to the earth the Savior reigns\nLet men their songs employ\nWhile fields and floods rocks hills and plains\nRepeat the sounding joy\nRepeat the sounding joy\nRepeat repeat the sounding joy` },
    { number: 15, title: 'The Old Rugged Cross', author: 'George Bennard', year: 1913, tune: 'The Old Rugged Cross', youtube: 'CltrLsjsQl0', soundcloud: 'https://soundcloud.com/syntaxcreative/jason-crabb-the-old-rugged-cross', lyrics: `On a hill far away stood an old rugged cross\nThe emblem of suffering and shame\nAnd I love that old cross where the dearest and best\nFor a world of lost sinners was slain\n\nSo I'll cherish the old rugged cross\nTill my trophies at last I lay down\nI will cling to the old rugged cross\nAnd exchange it some day for a crown` },
    { number: 16, title: 'When The Roll Is Called Up Yonder', author: 'James Milton Black', year: 1893, tune: 'Roll Call', youtube: '_LjZfjuOASs', soundcloud: 'https://soundcloud.com/rebamcentireofficial/when-the-roll-is-called-up', lyrics: `When the trumpet of the Lord shall sound\nAnd time shall be no more\nAnd the morning breaks eternal bright and fair\nWhen the saved of earth shall gather\nOver on the other shore\nAnd the roll is called up yonder I'll be there\n\nWhen the roll is called up yonder\nWhen the roll is called up yonder\nWhen the roll is called up yonder\nWhen the roll is called up yonder I'll be there` },
    { number: 17, title: 'His Eye Is On The Sparrow', author: 'Civilla D. Martin', year: 1905, tune: 'His Eye Is On The Sparrow', youtube: 'qn0mWsG7-q4', soundcloud: 'https://soundcloud.com/la-parole-inspiree/his-eye-is-on-the-sparrow-by', lyrics: `Why should I feel discouraged\nWhy should the shadows come\nWhy should my heart be lonely\nAnd long for heaven and home\n\nWhen Jesus is my portion\nMy constant Friend is He\nHis eye is on the sparrow\nAnd I know He watches me\n\nI sing because I'm happy\nI sing because I'm free\nFor His eye is on the sparrow\nAnd I know He watches me` },
    { number: 18, title: 'O Love That Wilt Not Let Me Go', author: 'George Matheson', year: 1882, tune: 'St. Margaret', youtube: 'biHQVoAUTtU', soundcloud: 'https://soundcloud.com/nycypcd/o-love-that-wilt-not-let-me-go', lyrics: `O Love that wilt not let me go\nI rest my weary soul in Thee\nI give Thee back the life I owe\nThat in Thine ocean depths its flow\nMay richer fuller be\n\nO Light that followest all my way\nI yield my flickering torch to Thee\nMy heart restores its borrowed ray\nThat in Thy sunshine's blaze its day\nMay brighter fairer be` },
    { number: 19, title: 'A Mighty Fortress Is Our God', author: 'Martin Luther', year: 1529, tune: 'Ein Feste Burg', youtube: '8XUYZoguhEQ', soundcloud: 'https://soundcloud.com/grace-and-truth-records/a-mighty-fortress-is-our-god-1', lyrics: `A mighty fortress is our God\nA bulwark never failing\nOur helper He amid the flood\nOf mortal ills prevailing\n\nFor still our ancient foe\nDoth seek to work us woe\nHis craft and power are great\nAnd armed with cruel hate\nOn earth is not his equal` },
    { number: 20, title: 'Crown Him With Many Crowns', author: 'Matthew Bridges', year: 1851, tune: 'Diademata', youtube: 'If-svStcvS8', soundcloud: 'https://soundcloud.com/oralia-hernandez-501143941/crown_him_with_many_crowns', lyrics: `Crown Him with many crowns\nThe Lamb upon His throne\nHark how the heavenly anthem drowns\nAll music but its own\n\nAwake my soul and sing\nOf Him who died for thee\nAnd hail Him as thy matchless King\nThrough all eternity` },
    { number: 21, title: 'This Is My Father\'s World', author: 'Maltbie Babcock', year: 1901, tune: 'Terra Beata', youtube: '-y93uhtTibM', soundcloud: 'https://soundcloud.com/lullabyprenatalband/this-is-my-fathers-world-9', lyrics: `This is my Father's world\nAnd to my listening ears\nAll nature sings and round me rings\nThe music of the spheres\n\nThis is my Father's world\nI rest me in the thought\nOf rocks and trees of skies and seas\nHis hand the wonders wrought` },
    { number: 22, title: 'Blessed Assurance', author: 'Fanny Crosby', year: 1873, tune: 'Assurance', youtube: 'H1VMHEMOMZY', soundcloud: 'https://soundcloud.com/user-663489486/blessed-assurance', lyrics: `Blessed assurance Jesus is mine\nO what a foretaste of glory divine\nHeir of salvation purchase of God\nBorn of His Spirit washed in His blood\n\nThis is my story this is my song\nPraising my Savior all the day long\nThis is my story this is my song\nPraising my Savior all the day long` },
    { number: 23, title: 'All Hail The Power Of Jesus Name', author: 'Edward Perronet', year: 1779, tune: 'Coronation', youtube: '_hmtxrFgrEA', soundcloud: 'https://soundcloud.com/rejoicehymns/all-hail-the-power-of-jesus-name', lyrics: `All hail the power of Jesus' name\nLet angels prostrate fall\nBring forth the royal diadem\nAnd crown Him Lord of all\n\nYe chosen seed of Israel's race\nYe ransomed from the fall\nHail Him who saves you by His grace\nAnd crown Him Lord of all` },
    { number: 24, title: 'Come Thou Fount Of Every Blessing', author: 'Robert Robinson', year: 1758, tune: 'Nettleton', youtube: '4xJXzgonLdQ', soundcloud: 'https://soundcloud.com/user-928533294/come-thou-fount-of-every-blessing', lyrics: `Come Thou fount of every blessing\nTune my heart to sing Thy grace\nStreams of mercy never ceasing\nCall for songs of loudest praise\n\nTeach me some melodious sonnet\nSung by flaming tongues above\nPraise the mount I'm fixed upon it\nMount of Thy redeeming love` },
    { number: 25, title: 'Praise To The Lord The Almighty', author: 'Joachim Neander', year: 1680, tune: 'Lobe Den Herren', youtube: 'BNq0WtMSmIY', soundcloud: 'https://soundcloud.com/gibcmusic/praise-to-the-lord-the-almighty', lyrics: `Praise to the Lord the Almighty\nThe King of creation\nO my soul praise Him\nFor He is thy health and salvation\n\nAll ye who hear\nNow to His temple draw near\nJoin me in glad adoration` },
    { number: 26, title: 'How Firm A Foundation', author: 'John Rippon', year: 1787, tune: 'Foundation', youtube: 'ZXjk9l-M9uU', soundcloud: 'https://soundcloud.com/daniel-teng-572542072/hymn-339-how-firm-a-foundation', lyrics: `How firm a foundation ye saints of the Lord\nIs laid for your faith in His excellent Word\nWhat more can He say than to you He hath said\nTo you who for refuge to Jesus have fled\n\nFear not I am with thee O be not dismayed\nFor I am thy God and will still give thee aid\nI'll strengthen thee help thee and cause thee to stand\nUpheld by My righteous omnipotent hand` },
    { number: 27, title: 'I Surrender All', author: 'Judson Van DeVenter', year: 1896, tune: 'Surrender', youtube: 'SW8EA7DEQ2M', soundcloud: 'https://soundcloud.com/sermons-gospel-songs/all-to-jesus-i-surrender', lyrics: `All to Jesus I surrender\nAll to Him I freely give\nI will ever love and trust Him\nIn His presence daily live\n\nI surrender all I surrender all\nAll to Thee my blessed Savior\nI surrender all` },
    { number: 28, title: 'Immortal Invisible God Only Wise', author: 'Walter Chalmers Smith', year: 1867, tune: 'St. Denio', youtube: '4oGuGzCFEWI', soundcloud: 'https://soundcloud.com/bayleafbaptistchurch/immortal-invisible-god-only-wise', lyrics: `Immortal invisible God only wise\nIn light inaccessible hid from our eyes\nMost blessed most glorious the Ancient of Days\nAlmighty victorious Thy great name we praise\n\nUnresting unhasting and silent as light\nNor wanting nor wasting Thou rulest in might\nThy justice like mountains high soaring above\nThy clouds which are fountains of goodness and love` },
    { number: 29, title: 'Stand Up Stand Up For Jesus', author: 'George Duffield', year: 1858, tune: 'Webb', youtube: 'TbnhUlj2PZ4', soundcloud: '', lyrics: `Stand up stand up for Jesus\nYe soldiers of the cross\nLift high His royal banner\nIt must not suffer loss\nFrom victory unto victory\nHis army shall He lead\nTill every foe is vanquished\nAnd Christ is Lord indeed` },
    { number: 30, title: 'Leaning On The Everlasting Arms', author: 'Elisha Hoffman', year: 1887, tune: 'Everlasting Arms', youtube: 'EJ5cLiCCOao', soundcloud: 'https://soundcloud.com/user-193602056/leaning-on-the-everlasting-arms-4', lyrics: `What a fellowship what a joy divine\nLeaning on the everlasting arms\nWhat a blessedness what a peace is mine\nLeaning on the everlasting arms\n\nLeaning leaning\nSafe and secure from all alarms\nLeaning leaning\nLeaning on the everlasting arms` },
    { number: 31, title: 'Guide Me O Thou Great Jehovah', author: 'William Williams', year: 1745, tune: 'Cwm Rhondda', youtube: 'K_U4v--Bc30', soundcloud: 'https://soundcloud.com/rachel-jarrett-878695061/guide-me-o-thou-great-jehovah', lyrics: `Guide me O Thou great Jehovah\nPilgrim through this barren land\nI am weak but Thou art mighty\nHold me with Thy powerful hand\nBread of heaven Bread of heaven\nFeed me till I want no more\nFeed me till I want no more` },
    { number: 32, title: 'Fairest Lord Jesus', author: 'Anonymous', year: 1677, tune: 'Crusaders Hymn', youtube: '8o_2A94jsEA', soundcloud: 'https://soundcloud.com/soothingrelaxation/fairest-lord-jesus', lyrics: `Fairest Lord Jesus\nRuler of all nature\nO Thou of God and man the Son\nThee will I cherish\nThee will I honor\nThou my soul's glory joy and crown\n\nFair are the meadows\nFairer still the woodlands\nRobed in the blooming garb of spring\nJesus is fairer\nJesus is purer\nWho makes the woeful heart to sing` },
    { number: 33, title: 'For The Beauty Of The Earth', author: 'Folliot Pierpoint', year: 1864, tune: 'Dix', youtube: 'Zy7t2Uasqe8', soundcloud: 'https://soundcloud.com/user-835626066-736009175/for-the-beauty-of-the-earth', lyrics: `For the beauty of the earth\nFor the glory of the skies\nFor the love which from our birth\nOver and around us lies\nLord of all to Thee we raise\nThis our hymn of grateful praise` },
    { number: 34, title: 'I Love To Tell The Story', author: 'Katherine Hankey', year: 1866, tune: 'Hankey', youtube: 'argPRVkbcdg', soundcloud: 'https://soundcloud.com/zhi-han-2/i-love-to-tell-the-story', lyrics: `I love to tell the story\nOf unseen things above\nOf Jesus and His glory\nOf Jesus and His love\nI love to tell the story\nBecause I know tis true\nIt satisfies my longings\nAs nothing else can do\n\nI love to tell the story\nTwill be my theme in glory\nTo tell the old old story\nOf Jesus and His love` },
    { number: 35, title: 'Love Divine All Loves Excelling', author: 'Charles Wesley', year: 1747, tune: 'Beecher', youtube: '8q3jmXn6HTQ', soundcloud: 'https://soundcloud.com/modgschool/love-divine-all-loves', lyrics: `Love divine all loves excelling\nJoy of heaven to earth come down\nFix in us Thy humble dwelling\nAll Thy faithful mercies crown\nJesus Thou art all compassion\nPure unbounded love Thou art\nVisit us with Thy salvation\nEnter every trembling heart` },
    { number: 36, title: 'There Is A Fountain', author: 'William Cowper', year: 1772, tune: 'Cleansing Fountain', youtube: 'QF8sPZmP8fU', soundcloud: 'https://soundcloud.com/hymnstream/there-is-a-fountain-hymn-1006', lyrics: `There is a fountain filled with blood\nDrawn from Immanuel's veins\nAnd sinners plunged beneath that flood\nLose all their guilty stains\n\nThe dying thief rejoiced to see\nThat fountain in his day\nAnd there may I though vile as he\nWash all my sins away` },
    { number: 37, title: 'Rejoice The Lord Is King', author: 'Charles Wesley', year: 1746, tune: 'Darwall', youtube: 'AhEUCSzaU8M', soundcloud: 'https://soundcloud.com/francis-frazier1954/rejoice-the-lord-is-king', lyrics: `Rejoice the Lord is King\nYour Lord and King adore\nMortals give thanks and sing\nAnd triumph evermore\nLift up your heart lift up your voice\nRejoice again I say rejoice` },
    { number: 38, title: 'When I Survey The Wondrous Cross', author: 'Isaac Watts', year: 1707, tune: 'Hamburg', youtube: '4_fvFfPqjO4', soundcloud: 'https://soundcloud.com/andrewjmartin/when-i-survey-the-wondrous-cross-arr-jeremy-scott-1', lyrics: `When I survey the wondrous cross\nOn which the Prince of glory died\nMy richest gain I count but loss\nAnd pour contempt on all my pride\n\nForbid it Lord that I should boast\nSave in the death of Christ my God\nAll the vain things that charm me most\nI sacrifice them to His blood` }
  ];

  const songs = [
    // WORSHIP - Expanded
    { id: 's1', category: 'worship', title: 'Way Maker', artist: 'Sinach', youtube: 'k28qCBwww0E', soundcloud: 'https://soundcloud.com/leeland-sc/way-maker-single-version', lyrics: null },
    { id: 's66', category: 'worship', title: 'How Great Thou Art', artist: 'Carl Boberg', youtube: 'v_rWMQp2Hho', soundcloud: 'https://soundcloud.com/carrieunderwoodofficial/how-great-thou-art-1', lyrics: null },
    { id: 's2', category: 'worship', title: 'Goodness of God', artist: 'Bethel Music', youtube: 'n0FBb6hnwTo', soundcloud: 'https://soundcloud.com/none-reyes/goodness-of-god', lyrics: null },
    { id: 's3', category: 'worship', title: 'Reckless Love', artist: 'Cory Asbury', youtube: 'Sc6SSHuZvQE', soundcloud: 'https://soundcloud.com/coryasbury/reckless-love', lyrics: null },
    { id: 's4', category: 'worship', title: 'Here I Am To Worship', artist: 'Tim Hughes', youtube: '6CKCThJB5w0', soundcloud: 'https://soundcloud.com/forestcityworship/here-i-am-to-worship-live', lyrics: null },
    { id: 's5', category: 'worship', title: 'How Great Is Our God', artist: 'Chris Tomlin', youtube: 'XV4nOVmWW2A', soundcloud: 'https://soundcloud.com/skyangel-1/hillsong-how-great-is-our-god', lyrics: null },
    { id: 's31', category: 'worship', title: 'We Believe', artist: 'Newsboys', youtube: 'WjZ01FcK0yk', soundcloud: 'https://soundcloud.com/brocknessmonster12/newsboys-we-believe', lyrics: null },
    { id: 's32', category: 'worship', title: 'Your Name', artist: 'Natalie Grant', youtube: 'PasbQx0VilQ', soundcloud: 'https://soundcloud.com/berorecords/natalie-grant-your-great-name', lyrics: null },
    { id: 's33', category: 'worship', title: 'Mighty To Save', artist: 'Hillsong United', youtube: 'GEAcs2B-kNc', soundcloud: 'https://soundcloud.com/keishinta/hillsong-mighty-to-save', lyrics: null },
    { id: 's34', category: 'worship', title: 'Blessed Assurance', artist: 'Twila Paris', youtube: 'H1VMHEMOMZY', soundcloud: 'https://soundcloud.com/user-663489486/blessed-assurance', lyrics: null },
    { id: 's35', category: 'worship', title: 'Holy Forever', artist: 'Chris Tomlin', youtube: 'nIkHgxKemCRk', soundcloud: 'https://soundcloud.com/chris-tomlin-official/holy-forever', lyrics: null },

    // PRAISE - Expanded
    { id: 's6', category: 'praise', title: 'Joyful Joyful', artist: 'Brenton Brown', youtube: 'G8PqSiRQeBI', soundcloud: 'https://soundcloud.com/brenton-brown-official/joyful-2', lyrics: null },
    { id: 's7', category: 'praise', title: 'This Is Amazing Grace', artist: 'Phil Wickham', youtube: 'XFRjr_x-yxU', soundcloud: 'https://soundcloud.com/philwickham/this-is-amazing-grace', lyrics: null },
    { id: 's8', category: 'praise', title: 'Break Every Chain', artist: 'Tasha Cobbs Leonard', youtube: 'ucY6NwQTI3M', soundcloud: 'https://soundcloud.com/amara-johnson-602879994/tasha-cobbs-break-every-chain', lyrics: null },
    { id: 's9', category: 'praise', title: 'Shout to the Lord', artist: 'Darlene Zschech', youtube: '5_aIauL2xKA', soundcloud: 'https://soundcloud.com/seventh-day-adventist-sja/shout-to-the-lord', lyrics: null },
    { id: 's10', category: 'praise', title: 'Living Hope', artist: 'Phil Wickham', youtube: 'u-1fwZtKJSM', soundcloud: 'https://soundcloud.com/seekintreasure/jesus-christ-my-living-hope', lyrics: null },
    { id: 's36', category: 'praise', title: 'Raise A Hallelujah', artist: 'Bethel Music', youtube: 'G2XtRuPfaAU', soundcloud: 'https://soundcloud.com/user-44596855/bethel-music-raise-a-hallelujah', lyrics: null },
    { id: 's37', category: 'praise', title: 'Thats how you change the world', artist: 'Newsboys', youtube: 'WtkTXBTTcAw', soundcloud: 'https://soundcloud.com/ajrdvceeo9ks/thats-how-you-change-the-world', lyrics: null },
    { id: 's38', category: 'praise', title: 'Nothing But The Blood', artist: 'TheIslandSing', youtube: 'BYjhGeAIG6k', soundcloud: 'https://soundcloud.com/grace-and-truth-records/nothing-but-the-blood-12', lyrics: null },
    { id: 's39', category: 'praise', title: 'Blessed', artist: 'Hillsong', youtube: 'I0NPps2VpY0', soundcloud: '', lyrics: null },

    // THANKSGIVING - Expanded
    { id: 's11', category: 'thanksgiving', title: 'Give Thanks', artist: 'Don Moen', youtube: 'blbslHDgceY', soundcloud: 'https://soundcloud.com/don-moen-official/give-thanks', lyrics: null },
    { id: 's12', category: 'thanksgiving', title: 'Thank You Lord', artist: 'Don Moen', youtube: 'sax4aTgZ9dw', soundcloud: 'https://soundcloud.com/bugle69093/thank-you-lord', lyrics: null },
    { id: 's13', category: 'thanksgiving', title: 'Forever Grateful', artist: 'Elevation Worship', youtube: 'oh2goMABFPc', soundcloud: 'https://soundcloud.com/andygofficial/elevation-worship-god-im-just-grateful-andyg-remix-radio-edit', lyrics: null },
    { id: 's14', category: 'thanksgiving', title: 'Count Your Blessings', artist: 'Traditional', youtube: 'Hb4JBNDWhOA', soundcloud: 'https://soundcloud.com/user-danigreat/count-your-blessings', lyrics: null },
    { id: 's40', category: 'thanksgiving', title: 'Goodness Goodness Goodness', artist: 'Jenn Johnson', youtube: 'n0FBb6hnwTo', soundcloud: 'https://soundcloud.com/familylyricschannel/goodness-of-god-radio-version-bethel-music-jenn-johnson', lyrics: null },
    { id: 's41', category: 'thanksgiving', title: 'Grateful', artist: 'Brandon Lake', youtube: 'dQdfs5S6jyA', soundcloud: 'https://soundcloud.com/beatdown0088/gratitude-brandon-lake', lyrics: null },
    { id: 's42', category: 'thanksgiving', title: 'Thank You', artist: 'Hillsong Worship', youtube: 'BSMuZFUL-0g', soundcloud: 'https://soundcloud.com/s2choi/thank-you-jesus-hillsong-worship-sonia-choi-cover', lyrics: null },

    // GOSPEL - Expanded
    { id: 's15', category: 'gospel', title: 'Oh Happy Day', artist: 'Edwin Hawkins Singers', youtube: 'KJohGa66FJM', soundcloud: 'https://soundcloud.com/edwinhawkinssingers-music/oh-happy-day', lyrics: `Oh happy day oh happy day\nWhen Jesus washed when Jesus washed\nWhen Jesus washed washed my sins away` },
    { id: 's16', category: 'gospel', title: 'Amazing Grace', artist: 'Hillsong Worship', youtube: 'RLfOHwI6hcw', soundcloud: 'https://soundcloud.com/anthonyjohntunes/broken-vessels-amazing-grace-hillsong-live-cover', lyrics: `Amazing grace how sweet the sound\nThat saved a wretch like me` },
    { id: 's17', category: 'gospel', title: 'Total Praise', artist: 'Richard Smallwood', youtube: 'jCjaUwEsMdQ', soundcloud: 'https://soundcloud.com/sisdeecompany/total-praise-richard-smallwood', lyrics: null },
    { id: 's18', category: 'gospel', title: 'I Smile', artist: 'Kirk Franklin', youtube: 'Z8SPwT3nQZ8', soundcloud: 'https://soundcloud.com/ksusha-kondrashova/kirk-franklin-i-smile', lyrics: null },
    { id: 's19', category: 'gospel', title: 'Take Me To The King', artist: 'Tamela Mann', youtube: 'wU3qgPn3bGA', soundcloud: 'https://soundcloud.com/syntaxcreative/tamela-mann-take-me-to-the-king', lyrics: null },
    { id: 's43', category: 'gospel', title: 'Going Up Yonder', artist: 'Walter Hawkins', youtube: 'gYN3gltK2mg', soundcloud: 'https://soundcloud.com/ehoward40/going-up-yonder-by-walter-hawkins-cover-by-eddie-howard', lyrics: null },
    { id: 's44', category: 'gospel', title: 'Walk Around Heaven', artist: 'Mahalia Jackson', youtube: 'nAnW_fpils0', soundcloud: 'https://soundcloud.com/theseason-1/01-walk-around-heaven-all-day', lyrics: null },
    { id: 's45', category: 'gospel', title: 'Swing Low Sweet Chariot', artist: 'Traditional', youtube: 'x5DBfU9_I4I', soundcloud: 'https://soundcloud.com/geoff-gilroy-993855126/swing-low-sweet-chariot', lyrics: null },
    { id: 's46', category: 'gospel', title: 'He Touched Me', artist: 'Bill Gaither', youtube: '5m--ptwd_iI', soundcloud: 'https://soundcloud.com/mdpmm/he-touched-me-bill-gather-cover-01', lyrics: null },
    { id: 's47', category: 'gospel', title: 'Glory Glory Hallelujah', artist: 'Traditional', youtube: 'Vuznp5-mTps', soundcloud: 'https://soundcloud.com/tipeijok-pun-epwe-ne-ina/glory-hallelujah-ozeky', lyrics: null },

    // CONTEMPORARY - Expanded
    { id: 's25', category: 'contemporary', title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong United', youtube: 'OP-00EwLdiU', soundcloud: 'https://soundcloud.com/jwardmusic/oceans-hillsong-united', lyrics: null },
    { id: 's26', category: 'contemporary', title: 'What A Beautiful Name', artist: 'Hillsong Worship', youtube: 'nQWFzMvCfLE', soundcloud: 'https://soundcloud.com/janneh-felix/sets/what-a-beautiful-name-it-is', lyrics: null },
    { id: 's27', category: 'contemporary', title: 'King of Kings', artist: 'Hillsong Worship', youtube: 'dQl4izxPeNU', soundcloud: 'https://soundcloud.com/mega-puspadewi-situmorang/king-of-kings-hillsong', lyrics: null },
    { id: 's28', category: 'contemporary', title: '10,000 Reasons', artist: 'Matt Redman', youtube: 'XtwIT8JjddM', soundcloud: 'https://soundcloud.com/charles-morrow-673366446/10000-reasons-matt-redman-with-lyrics-for-praise-and-worship', lyrics: null },
    { id: 's29', category: 'contemporary', title: 'Build My Life', artist: 'Pat Barrett', youtube: 'Z32HiCoFzlU', soundcloud: 'https://soundcloud.com/derekfields/build-my-life', lyrics: null },
    { id: 's30', category: 'contemporary', title: 'Yes I Will', artist: 'Vertical Worship', youtube: 'NrTv39-lG4M', soundcloud: 'https://soundcloud.com/windsorparkworshipnz/yes-i-will-vertical-worship', lyrics: null },
    { id: 's48', category: 'contemporary', title: 'Worthy', artist: 'Elevation Worship', youtube: 'Ak5WTb-mgeA', soundcloud: 'https://soundcloud.com/user-578578463/worthy-elevation-worship', lyrics: null },
    { id: 's49', category: 'contemporary', title: 'Way Maker', artist: 'Leeland', youtube: 'iJCV_2H9xD0', soundcloud: 'https://soundcloud.com/leeland-sc/way-maker-single-version', lyrics: null },
    { id: 's50', category: 'contemporary', title: 'Unending Love', artist: 'Hillsong', youtube: 'Db-CF_rfZWs', soundcloud: 'https://soundcloud.com/abravemix/unending-love-hillsong-youth', lyrics: null },
    { id: 's67', category: 'contemporary', title: 'In Christ Alone', artist: 'Keith Getty & Stuart Townend', youtube: 'rn9-UNer6MQ', soundcloud: 'https://soundcloud.com/geoffmooremusic/in-christ-alone', lyrics: null },

    // PRAYER & DEVOTION - New Category
    { id: 's51', category: 'prayer', title: 'Jesus I Come', artist: 'Elevation Worship', youtube: '_8Fx06jskfY', soundcloud: 'https://soundcloud.com/essentialsongs/jesus-i-come-elevation-worship', lyrics: null },
    { id: 's52', category: 'prayer', title: 'I Surrender', artist: 'Hillsong Worship', youtube: 's7jXASBWwwI', soundcloud: 'https://soundcloud.com/venkicse527/hillsong-i-surrender', lyrics: null },
    { id: 's53', category: 'prayer', title: 'Breathe', artist: 'Hillsong worship', youtube: 'k5w7MgTgVVs', soundcloud: 'https://soundcloud.com/user-203263091-633144307/breathe-hillsong-worship', lyrics: null },
    { id: 's54', category: 'prayer', title: 'Our God', artist: 'Chris Tomlin', youtube: 'NJpt1hSYf2o', soundcloud: 'https://soundcloud.com/idd_quininde/our-god-chris-tomlin', lyrics: null },
    { id: 's55', category: 'prayer', title: 'I Need Thee Every Hour', artist: 'Traditional', youtube: 'pTg86guC5GE', soundcloud: 'https://soundcloud.com/jill-baylon/i-need-the-every-hour', lyrics: null },
    { id: 's56', category: 'prayer', title: 'Come As You Are', artist: 'Nirvana', youtube: 'vabnZ9-ex7o', soundcloud: 'https://soundcloud.com/david-alejandro-105/nirvana-come-as-you-are-cover', lyrics: null },
    { id: 's57', category: 'prayer', title: 'Lord I Need You', artist: 'Matt Maher', youtube: 'LuvfMDhTyMA', soundcloud: 'https://soundcloud.com/wplg-radio/matt-maher-lord-i-need-you', lyrics: null },
    { id: 's58', category: 'prayer', title: 'I Will Rise', artist: 'Chris Tomlin', youtube: 'l6paJbntGpU', soundcloud: 'https://soundcloud.com/just-be-inspired/chris-tomlin-i-will-rise', lyrics: null },

    // SPIRITUAL - New Category
    { id: 's59', category: 'spiritual', title: 'Spirit Of The Living God', artist: 'Heather Small', youtube: 'ogGOlGswStA', soundcloud: 'https://soundcloud.com/summit-worship/spirit-of-the-living-god', lyrics: null },
    { id: 's60', category: 'spiritual', title: 'Immanuel', artist: 'Tye Tribbett', youtube: 'Oak6YQqggQY', soundcloud: 'https://soundcloud.com/23violins/immanuel', lyrics: null },
    { id: 's61', category: 'spiritual', title: 'He Reigns', artist: 'Newsboys', youtube: 'Y8R9ZPT2T-I', soundcloud: 'https://soundcloud.com/fairviewchurch/he-reigns-newsboys', lyrics: null },
    { id: 's62', category: 'spiritual', title: 'Set A Fire', artist: 'Will Reagan', youtube: 'lZiqgrtNT6s', soundcloud: 'https://soundcloud.com/justinreidmusic/set-a-fire-will-reagan-justin', lyrics: null },
    { id: 's63', category: 'spiritual', title: 'Holy Spirit', artist: 'Francesca Battistelli', youtube: 'qNwnOfZ5N8A', soundcloud: 'https://soundcloud.com/user-371901451/sinach-holy-spirit-you-are-welcome-here', lyrics: null },
    { id: 's64', category: 'spiritual', title: 'Refiner\'s Fire', artist: 'Brian Doerksen', youtube: 'BLyQAx8DpBI', soundcloud: 'https://soundcloud.com/briandoerksen/refiners-fire-422778628', lyrics: null },
    { id: 's65', category: 'spiritual', title: 'Consuming Fire', artist: 'Tim Hughes', youtube: '6XOBBUu_23M', soundcloud: 'https://soundcloud.com/chekomusicforchrist/consuming-fire-tim-hughes-cover', lyrics: null }
  ];

  // DOM references
  const categoriesWrap = document.getElementById('categoriesWrap');
  const playlistView = document.getElementById('playlistView');
  const playlistTitle = document.getElementById('playlistTitle');
  const songList = document.getElementById('songList');
  const backToCats = document.getElementById('backToCats');
  const playerOverlay = document.getElementById('playerOverlay');
  const overlayLyrics = document.getElementById('overlayLyrics');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const closePlayer = document.getElementById('closePlayer');
  const overlayVideo = document.getElementById('overlayVideo');

  let currentCategory = null;
  let currentSong = null;
  let currentHymnPage = 0;
  let isHymnbookMode = false;
  let currentPlaylist = [];
  let currentSongIndex = -1;
  let currentMode = 'audio';

  // Render categories
  function renderCategories() {
    categoriesWrap.innerHTML = '';
    categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'cat-card';
      card.dataset.cat = cat.id;
      card.innerHTML = `
        <div class="cat-img"><img src="${cat.img}" alt="${cat.title}" style="width:100%;height:100%;object-fit:cover;border-radius:10px" /></div>
        <div class="cat-meta">
          <div class="cat-title">${cat.title}</div>
          <div class="cat-sub">${cat.subtitle}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (cat.isHymnBook) {
          openHymnbook();
        } else {
          openCategory(cat.id);
        }
      });
      categoriesWrap.appendChild(card);
    });
  }

  // Open regular category
  function openCategory(catId) {
    isHymnbookMode = false;
    currentCategory = catId;
    categoriesWrap.style.display = 'none';
    
    const cat = categories.find(c => c.id === catId);
    playlistTitle.textContent = cat ? cat.title : 'Playlist';
    
    const filtered = songs.filter(s => s.category === catId);
    currentPlaylist = filtered;
    songList.innerHTML = '';
    
    // Add search bar at the top
    const searchBar = document.createElement('div');
    searchBar.style.cssText = 'margin-bottom:20px; position:sticky; top:0; background:var(--bg-color); padding:10px 0; z-index:10;';
    searchBar.innerHTML = `
      <input type="text" id="songSearch" placeholder="🔍 Search songs..." 
        style="width:95%; padding:10px 15px; border:2px solid var(--accent); border-radius:8px; font-size:0.95rem; font-family:var(--font); color:var(--text-color); background:var(--button-bg);">
    `;
    songList.appendChild(searchBar);
    
    const songsContainer = document.createElement('div');
    songsContainer.id = 'songsContainer';
    
    filtered.forEach(s => {
      const item = document.createElement('div');
      item.className = 'song-item';
      item.setAttribute('data-song-id', s.id);
      item.setAttribute('data-song-title', s.title.toLowerCase());
      item.setAttribute('data-song-artist', (s.artist || '').toLowerCase());
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:var(--border-radius); background:var(--button-bg); border:1px solid var(--accent); margin-bottom:8px;';
      
      const songInfo = document.createElement('div');
      songInfo.className = 'song-info';
      songInfo.style.cssText = 'flex:1; min-width:0;';
      songInfo.innerHTML = `
        <div class="song-title" style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-color);">${s.title}</div>
        <div class="song-artist" style="font-size:0.82rem; color:var(--text-color); opacity:0.7;">${s.artist || ''}</div>
      `;
      
      // Right side buttons container
      const rightButtons = document.createElement('div');
      rightButtons.style.cssText = 'display:flex; gap:6px; align-items:center;';
      
      // Audio/Video buttons
      const audioBtn = document.createElement('button');
      audioBtn.className = 'badge audio';
      audioBtn.textContent = 'Audio';
      audioBtn.style.cssText = 'min-width:48px; padding:6px 8px; border-radius:8px; font-size:0.8rem; text-transform:uppercase; font-weight:700; border:none; cursor:pointer; background:linear-gradient(180deg,var(--accent1), var(--accent6)); color:var(--button-text);';
      audioBtn.onclick = () => playSong(s.id, 'audio');
      
      const videoBtn = document.createElement('button');
      videoBtn.className = 'badge video';
      videoBtn.textContent = 'Video';
      videoBtn.style.cssText = 'min-width:48px; padding:6px 8px; border-radius:8px; font-size:0.8rem; text-transform:uppercase; font-weight:700; border:none; cursor:pointer; background:linear-gradient(180deg,var(--accent13), var(--accent2)); color:var(--button-text);';
      videoBtn.onclick = () => playSong(s.id, 'video');
      
      // Small + button for playlist
      const addBtn = document.createElement('button');
      addBtn.textContent = '+';
      addBtn.title = 'Add to Playlist';
      addBtn.style.cssText = 'width:32px; height:32px; background:var(--accent); color:var(--button-text); border:none; border-radius:50%; cursor:pointer; font-size:1.2rem; font-weight:bold; display:flex; align-items:center; justify-content:center; position:relative; transition:transform 0.2s;';
      addBtn.onmouseover = () => addBtn.style.transform = 'scale(1.1)';
      addBtn.onmouseout = () => addBtn.style.transform = 'scale(1)';
      
      const menu = document.createElement('div');
      menu.style.cssText = 'position:absolute; background:var(--button-bg); border:1px solid var(--accent); border-radius:6px; z-index:9999; min-width:200px; top:calc(100% + 5px); right:0; box-shadow: 0 4px 6px rgba(0,0,0,0.3);';
      menu.style.display = 'none';
      
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.innerHTML = '';
        const playlists = loadPlaylists();
        const playlistNames = Object.keys(playlists);
        if (playlistNames.length === 0) {
          // Create a new playlist and add the song
          const newName = 'New Playlist';
          playlists[newName] = [s];
          savePlaylists(playlists);
          showModal('✅ Created "New Playlist" and added song!');
          renderPlaylistsSidebar();
          menu.style.display = 'none';
        } else {
          for (const playlistName of playlistNames) {
            const option = document.createElement('div');
            option.textContent = playlistName;
            option.style.cssText = 'padding:8px 12px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.2); color:var(--text-color);';
            option.addEventListener('mouseenter', () => option.style.background = 'var(--accent)');
            option.addEventListener('mouseenter', () => option.style.color = 'var(--button-bg)');
            option.addEventListener('mouseleave', () => option.style.background = 'transparent');
            option.addEventListener('mouseleave', () => option.style.color = 'var(--text-color)');
            option.addEventListener('click', () => {
              addToPlaylist(playlistName, s);
              menu.style.display = 'none';
              renderPlaylistsSidebar();
            });
            menu.appendChild(option);
          }
          menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
      });
      
      // Position menu relative to button
      addBtn.style.position = 'relative';
      addBtn.appendChild(menu);
      
      rightButtons.appendChild(audioBtn);
      rightButtons.appendChild(videoBtn);
      rightButtons.appendChild(addBtn);
      
      item.appendChild(songInfo);
      item.appendChild(rightButtons);
      songsContainer.appendChild(item);
    });
    
    songList.appendChild(songsContainer);
    
    // Add search functionality
    document.getElementById('songSearch').addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const songItems = songsContainer.querySelectorAll('.song-item');
      
      songItems.forEach(item => {
        const title = item.getAttribute('data-song-title');
        const artist = item.getAttribute('data-song-artist');
        
        if (title.includes(searchTerm) || artist.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });

    playlistView.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Open Hymnbook with hymn selection
  function openHymnbook() {
    isHymnbookMode = true;
    currentCategory = 'hymnbook';
    categoriesWrap.style.display = 'none';
    
    playlistTitle.textContent = '📖 Hymnbook';
    songList.innerHTML = '';
    
    // Create search bar
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = 'width:100%;max-width:600px;margin:0 auto 20px;padding:0 10px;';
    searchContainer.innerHTML = `
      <input type="text" id="hymnSearch" placeholder="🔍 Search hymns by title, author, or number..." 
        style="width:100%;padding:12px 15px;border-radius:25px;border:1px solid var(--accent);
        background:var(--card-bg);color:var(--text-color);font-size:0.95rem;outline:none;">
    `;
    
    // Create hymn selection grid
    const hymnGrid = document.createElement('div');
    hymnGrid.className = 'hymn-selection-grid';
    hymnGrid.id = 'hymnGrid';
    hymnGrid.innerHTML = '<h3 style="width:100%;text-align:center;color:var(--text-color);opacity:0.7;margin-bottom:20px;">Select a Hymn</h3>';
    
    function renderHymns(filteredHymns) {
      hymnGrid.innerHTML = '<h3 style="width:100%;text-align:center;color:var(--text-color);opacity:0.7;margin-bottom:20px;">Select a Hymn</h3>';
      
      if (filteredHymns.length === 0) {
        hymnGrid.innerHTML += '<p style="width:100%;text-align:center;color:var(--text-color);opacity:0.5;">No hymns found</p>';
        return;
      }
      
      filteredHymns.forEach(hymn => {
        const card = document.createElement('div');
        card.className = 'hymn-card';
        card.innerHTML = `
          <div class="hymn-card-number">${hymn.number}</div>
          <div class="hymn-card-title">${hymn.title}</div>
          <div class="hymn-card-author">${hymn.author}</div>
        `;
        card.addEventListener('click', () => openHymnReader(hymn.number - 1));
        hymnGrid.appendChild(card);
      });
    }
    
    renderHymns(hymnbook);
    
    songList.appendChild(searchContainer);
    songList.appendChild(hymnGrid);
    playlistView.style.display = 'flex';
    
    // Add search functionality
    const searchInput = document.getElementById('hymnSearch');
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (!searchTerm) {
        renderHymns(hymnbook);
        return;
      }
      
      const filtered = hymnbook.filter(hymn => 
        hymn.title.toLowerCase().includes(searchTerm) ||
        hymn.author.toLowerCase().includes(searchTerm) ||
        hymn.number.toString().includes(searchTerm)
      );
      
      renderHymns(filtered);
    });
  }

  // Open hymn reader with traditional hymnal styling
  function openHymnReader(startIndex = 0) {
    currentHymnPage = startIndex;
    songList.innerHTML = '';
    
    const reader = document.createElement('div');
    reader.className = 'hymnal-reader';
    reader.innerHTML = `
      <div class="hymn-book-open" id="hymnBook">
        <div class="hymn-book-right" id="hymnPageRight" style="width:100%; max-width:600px; margin:0 auto;">
          <div class="hymnal-page">
            <div class="hymnal-header">HYMNS OF FAITH</div>
            <div class="hymnal-content" id="hymnalContent">
              <div class="hymn-display">
                <div class="hymn-num"></div>
                <div class="hymn-name"></div>
                <div class="hymn-meta"></div>
                <div class="hymn-text"></div>
              </div>
            </div>
            <div class="hymnal-footer">Page <span id="pageNum"></span></div>
          </div>
        </div>
      </div>
      <div class="hymnbook-controls">
        <button id="hymnBack" class="hymn-btn">← Back to Index</button>
        <button id="hymnPrev" class="hymn-btn">← Previous</button>
        <span id="hymnPageNumber" class="hymn-page-number"></span>
        <button id="hymnNext" class="hymn-btn">Next →</button>
      </div>
      <div class="hymn-actions" style="display:flex; justify-content:center; gap:1rem; margin-top:1rem; flex-wrap:wrap;">
        <button id="hymnPlayAudio" class="hymn-btn" style="background:var(--accent);">🎵 Play Audio</button>
        <button id="hymnPlayVideo" class="hymn-btn" style="background:var(--accent);">📹 Watch Video</button>
      </div>
    `;
    
    songList.appendChild(reader);
    displayCurrentHymn();
    displayCurrentHymnOnRight();
    
    // Add click handler to page for navigation
    document.getElementById('hymnPageRight').addEventListener('click', () => {
      if (currentHymnPage < hymnbook.length - 1) flipHymnForward();
    });
    
    document.getElementById('hymnBack').addEventListener('click', openHymnbook);
    document.getElementById('hymnPlayAudio').addEventListener('click', () => {
      const hymn = hymnbook[currentHymnPage];
      if (hymn.youtube || hymn.audio) {
        playHymn(hymn, 'audio');
      } else {
        showModal('Audio not available for this hymn yet');
      }
    });
    document.getElementById('hymnPlayVideo').addEventListener('click', () => {
      const hymn = hymnbook[currentHymnPage];
      if (hymn.youtube) {
        playHymn(hymn, 'video');
      } else {
        showModal('Video not available for this hymn');
      }
    });
    document.getElementById('hymnPrev').addEventListener('click', () => {
      if (currentHymnPage > 0) {
        flipHymnBackward();
      }
    });
    document.getElementById('hymnNext').addEventListener('click', () => {
      if (currentHymnPage < hymnbook.length - 1) {
        flipHymnForward();
      }
    });
  }

  // Display current hymn in traditional hymnal style
  function displayCurrentHymn() {
    const hymn = hymnbook[currentHymnPage];
    const content = document.getElementById('hymnalContent');
    
    content.querySelector('.hymn-num').textContent = hymn.number;
    content.querySelector('.hymn-name').textContent = hymn.title;
    content.querySelector('.hymn-meta').textContent = `${hymn.author}, ${hymn.year}`;
    content.querySelector('.hymn-text').textContent = hymn.lyrics;
    
    document.getElementById('pageNum').textContent = hymn.number;
    document.getElementById('hymnPageNumber').textContent = `Hymn ${hymn.number} of ${hymnbook.length}`;
    document.getElementById('hymnPrev').disabled = currentHymnPage === 0;
    document.getElementById('hymnNext').disabled = currentHymnPage >= hymnbook.length - 1;
  }

  // Display current hymn only on right page (for open book)
  function displayCurrentHymnOnRight() {
    const hymn = hymnbook[currentHymnPage];
    const rightPage = document.getElementById('hymnPageRight');
    
    rightPage.innerHTML = `
      <div class="hymnal-page">
        <div class="hymnal-header">HYMNS OF FAITH</div>
        <div class="hymnal-content">
          <div class="hymn-display">
            <div class="hymn-num">${hymn.number}</div>
            <div class="hymn-name">${hymn.title}</div>
            <div class="hymn-meta">${hymn.author}, ${hymn.year}</div>
            <div class="hymn-text">${hymn.lyrics}</div>
          </div>
        </div>
        <div class="hymnal-footer">Page <span id="pageNum">${hymn.number}</span></div>
      </div>
    `;
    const thickness = Math.min(currentHymnPage * 0.6, 18);
rightPage.style.boxShadow = `inset ${thickness}px 0 15px rgba(0,0,0,0.25)`;

    
    document.getElementById('hymnPageNumber').textContent = `Hymn ${hymn.number} of ${hymnbook.length}`;
    document.getElementById('hymnPrev').disabled = currentHymnPage === 0;
    document.getElementById('hymnNext').disabled = currentHymnPage >= hymnbook.length - 1;
  }

  // Simple fade navigation for hymns
  function flipHymnForward() {
    if (currentHymnPage >= hymnbook.length - 1) return;
    
    const right = hymnPageRight;
    right.style.opacity = '0';
    right.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
      currentHymnPage++;
      displayCurrentHymnOnRight();
      document.getElementById('hymnPageNumber').textContent = `Hymn ${currentHymnPage + 1} of ${hymnbook.length}`;
      document.getElementById('hymnPrev').disabled = currentHymnPage === 0;
      document.getElementById('hymnNext').disabled = currentHymnPage >= hymnbook.length - 1;
      right.style.opacity = '1';
    }, 200);
  }

  function flipHymnBackward() {
    if (currentHymnPage <= 0) return;
    
    const right = hymnPageRight;
    right.style.opacity = '0';
    right.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
      currentHymnPage--;
      displayCurrentHymnOnRight();
      document.getElementById('hymnPageNumber').textContent = `Hymn ${currentHymnPage + 1} of ${hymnbook.length}`;
      document.getElementById('hymnPrev').disabled = currentHymnPage === 0;
      document.getElementById('hymnNext').disabled = currentHymnPage >= hymnbook.length - 1;
      right.style.opacity = '1';
    }, 200);
  }


  


  // Play hymn from hymnbook
  function playHymn(hymn, mode) {
    currentSong = {
      id: `hymn${hymn.number}`,
      title: hymn.title,
      artist: hymn.author || '',
      youtube: hymn.youtube,
      soundcloud: hymn.soundcloud,
      lyrics: hymn.lyrics
    };
    currentMode = mode;
    
    playerTitle.textContent = hymn.title;
    playerArtist.textContent = hymn.author || '';
    overlayLyrics.textContent = hymn.lyrics || 'Lyrics not available.';
    
    const overlayVideo = document.getElementById('overlayVideo');
    const overlayAudio = document.getElementById('overlayAudio');
    overlayVideo.style.display = 'none';
    overlayAudio.style.display = 'none';
    overlayVideo.innerHTML = '';
    overlayAudio.innerHTML = '';
    
    playerOverlay.style.display = 'flex';
    
    if (mode === 'video' && hymn.youtube) {
      overlayVideo.style.display = 'block';
      overlayVideo.innerHTML = `<iframe id="yt-player" width="100%" height="360" src="https://www.youtube.com/embed/${hymn.youtube}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (mode === 'audio') {
      overlayAudio.style.display = 'block';
      // Prioritize SoundCloud for audio with full controls
      if (hymn.soundcloud) {
        overlayAudio.innerHTML = `<iframe id="sc-widget" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(hymn.soundcloud)}&color=%2300a6f0&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>`;
      } else if (hymn.youtube) {
        overlayAudio.innerHTML = `<iframe id="yt-player" width="100%" height="166" src="https://www.youtube.com/embed/${hymn.youtube}?autoplay=1&rel=0&enablejsapi=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
      }
    }
  }

  // Play song
  window.playSong = function(songId, mode, youtubeId) {
    // Handle YouTube video without song object
    if (!songId && youtubeId) {
      currentSong = currentSong || {};
      currentMode = mode;
      playerOverlay.style.display = 'flex';
      
      const overlayVideo = document.getElementById('overlayVideo');
      const overlayAudio = document.getElementById('overlayAudio');
      overlayVideo.style.display = 'none';
      overlayAudio.style.display = 'none';
      overlayVideo.innerHTML = '';
      overlayAudio.innerHTML = '';
      
      if (mode === 'video') {
        overlayVideo.style.display = 'block';
        overlayVideo.innerHTML = `<iframe id="yt-player" width="100%" height="360" src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
      return;
    }
    
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    currentSong = song;
    currentMode = mode;
    currentSongIndex = currentPlaylist.findIndex(s => s.id === songId);
    
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist || '';
    
    // Show lyrics immediately if available, or show placeholder
    if (song.lyrics) {
      overlayLyrics.textContent = song.lyrics;
    } else {
      overlayLyrics.textContent = 'Lyrics loading...';
      // Fetch lyrics in background without blocking playback
      fetchLyrics(song.title, song.artist).then(lyrics => {
        if (currentSong && currentSong.id === song.id) {
          overlayLyrics.innerHTML = lyrics || 'Lyrics not available.';
        }
      });
    }
    
    // Reset player areas
    const overlayVideo = document.getElementById('overlayVideo');
    const overlayAudio = document.getElementById('overlayAudio');
    overlayVideo.style.display = 'none';
    overlayAudio.style.display = 'none';
    overlayVideo.innerHTML = '';
    overlayAudio.innerHTML = '';
    
    // Show/update next button
    updateNextButton();
    
    playerOverlay.style.display = 'flex';
    
    if (mode === 'video') {
      overlayVideo.style.display = 'block';
      if (song.youtube) {
        overlayVideo.innerHTML = `<iframe id="yt-player" width="100%" height="360" src="https://www.youtube.com/embed/${song.youtube}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        // Auto-next after ~4 minutes (YouTube doesn't provide ended event easily)
        setTimeout(() => playNextSong(), 240000);
      } else if (song.soundcloud) {
        overlayVideo.innerHTML = `<iframe id="sc-widget" width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(song.soundcloud)}&color=%2300a6f0&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"></iframe>`;
      }
    } else if (mode === 'audio') {
      overlayAudio.style.display = 'block';
      // Prioritize SoundCloud for audio with full controls
      if (song.soundcloud) {
        overlayAudio.innerHTML = `<iframe id="sc-widget" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(song.soundcloud)}&color=%2300a6f0&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>`;
      } else if (song.youtube) {
        overlayAudio.innerHTML = `<iframe id="yt-player" width="100%" height="166" src="https://www.youtube.com/embed/${song.youtube}?autoplay=1&rel=0&enablejsapi=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
        setTimeout(() => playNextSong(), 240000);
      } else if (song.audio) {
        const audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.autoplay = true;
        audioEl.style.width = '100%';
        audioEl.innerHTML = `<source src="${song.audio}" type="audio/mpeg">`;
        audioEl.onended = () => playNextSong();
        overlayAudio.innerHTML = '';
        overlayAudio.appendChild(audioEl);
      }
    }
  };

  // Play next song in playlist
  function playNextSong() {
    if (currentSongIndex >= 0 && currentSongIndex < currentPlaylist.length - 1) {
      const nextSong = currentPlaylist[currentSongIndex + 1];
      playSong(nextSong.id, currentMode);
    }
  }

  // Update next button visibility
  function updateNextButton() {
    let nextBtn = document.getElementById('nextSongBtn');
    if (!nextBtn) {
      nextBtn = document.createElement('button');
      nextBtn.id = 'nextSongBtn';
      nextBtn.className = 'close-player';
      nextBtn.textContent = 'Next →';
      nextBtn.style.marginLeft = '8px';
      nextBtn.onclick = playNextSong;
      document.getElementById('closePlayer').parentElement.appendChild(nextBtn);
    }
    nextBtn.style.display = (currentSongIndex >= 0 && currentSongIndex < currentPlaylist.length - 1) ? 'inline-block' : 'none';
  }

  // Lyrics API disabled to avoid copyright issues
  // To enable: Get a proper license (e.g., CCLI) or use a licensed API
  function fetchLyrics(title, artist) {
    // Disabled for copyright compliance
    return Promise.resolve(null);
    
    /* Original implementation (disabled):
    if (!title || !artist) return Promise.resolve(null);
    
    return fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => data && data.lyrics ? `<pre style="white-space:pre-wrap;font-family:inherit;">${data.lyrics}</pre>` : null)
      .catch(error => {
        console.log('Lyrics fetch error:', error);
        return null;
      });
    */
  }

  // ============================================
  // PLAYLIST MANAGEMENT SYSTEM
  // ============================================
  
  function loadPlaylists() {
    const stored = localStorage.getItem('userPlaylists');
    return stored ? JSON.parse(stored) : {};
  }

  function savePlaylists(playlists) {
    localStorage.setItem('userPlaylists', JSON.stringify(playlists));
  }

  function renderPlaylistsSidebar() {
    const playlistsSidebar = document.getElementById('playlistsSidebar');
    const playlistsList = document.getElementById('playlistsList');
    const playlists = loadPlaylists();

    // Always show sidebar
    playlistsSidebar.style.display = 'block';
    playlistsList.innerHTML = '';

    for (const [name, songs] of Object.entries(playlists)) {
      const div = document.createElement('div');
      div.style.cssText = 'padding:12px; background:var(--button-bg); border-radius:8px; border-left:4px solid var(--accent); display:flex; justify-content:space-between; align-items:center;';
      
      const info = document.createElement('div');
      info.innerHTML = `<strong>${name}</strong><br><small>${songs.length} song${songs.length !== 1 ? 's' : ''}</small>`;
      info.style.cursor = 'pointer';
      info.addEventListener('click', () => viewPlaylist(name));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.style.cssText = 'background:none; border:none; cursor:pointer; font-size:1.2rem;';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirm(`Delete "${name}"?`, () => {
          delete playlists[name];
          savePlaylists(playlists);
          renderPlaylistsSidebar();
        });
      });

      div.appendChild(info);
      div.appendChild(deleteBtn);
      playlistsList.appendChild(div);
    }
  }

  function addToPlaylist(playlistName, song) {
    const playlists = loadPlaylists();
    if (!playlists[playlistName]) playlists[playlistName] = [];
    
    // Avoid duplicates
    if (!playlists[playlistName].some(s => s.id === song.id)) {
      playlists[playlistName].push(song);
      savePlaylists(playlists);
      showModal(`✅ Added to "${playlistName}"`);
    } else {
      showModal(`⚠️ Already in "${playlistName}"`);
    }
  }

  function viewPlaylist(name) {
    const playlists = loadPlaylists();
    const modal = document.getElementById('viewPlaylistModal');
    const title = document.getElementById('viewPlaylistTitle');
    const songsDiv = document.getElementById('viewPlaylistSongs');

    title.textContent = `📚 ${name}`;
    songsDiv.innerHTML = '';

    const playlistSongs = playlists[name] || [];
    if (playlistSongs.length === 0) {
      songsDiv.innerHTML = '<p style="color:var(--text-color);opacity:0.6;">No songs yet</p>';
    } else {
      playlistSongs.forEach(song => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px; background:var(--button-bg); border-radius:6px; border-left:3px solid var(--accent); display:flex; justify-content:space-between; align-items:center;';
        
        const info = document.createElement('div');
        info.style.cssText = 'flex:1; cursor:pointer;';
        const isPlaying = currentSong && currentSong.id === song.id;
        info.innerHTML = `<strong>${song.title}</strong> ${isPlaying ? '<span style="color:var(--accent);">▶ Playing</span>' : ''}<br><small>${song.artist || 'Unknown'}</small>`;
        info.addEventListener('click', () => {
          // Set currentPlaylist to this playlist's songs so next/previous work
          currentPlaylist = playlistSongs;
          playSong(song.id, 'audio');
          viewPlaylist(name); // Refresh to show playing status
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display:flex; gap:8px; align-items:center;';
        
        const playBtn = document.createElement('button');
        playBtn.textContent = '▶';
        playBtn.style.cssText = 'background:var(--accent); border:none; border-radius:4px; cursor:pointer; color:white; padding:6px 10px; font-size:0.9rem;';
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Set currentPlaylist to this playlist's songs so next/previous work
          currentPlaylist = playlistSongs;
          playSong(song.id, 'audio');
          viewPlaylist(name); // Refresh to show playing status
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.style.cssText = 'background:none; border:none; cursor:pointer; color:var(--accent1); font-weight:bold; font-size:1.2rem;';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playlists[name] = playlistSongs.filter(s => s.id !== song.id);
          savePlaylists(playlists);
          viewPlaylist(name);
        });

        buttonContainer.appendChild(playBtn);
        buttonContainer.appendChild(removeBtn);
        div.appendChild(info);
        div.appendChild(buttonContainer);
        songsDiv.appendChild(div);
      });
    }

    modal.style.display = 'block';
  }

  // Playlist creation
  document.getElementById('createPlaylistBtn').addEventListener('click', () => {
    const input = document.getElementById('newPlaylistName');
    const name = input.value.trim();

    if (!name) {
      showModal('Enter a playlist name');
      return;
    }

    const playlists = loadPlaylists();
    if (playlists[name]) {
      showModal('Playlist already exists');
      return;
    }

    playlists[name] = [];
    savePlaylists(playlists);
    input.value = '';
    renderPlaylistsSidebar();
    showModal(`✅ Playlist "${name}" created!`);
  });

  // Close playlist modal
  document.getElementById('closeViewPlaylist').addEventListener('click', () => {
    document.getElementById('viewPlaylistModal').style.display = 'none';
  });

  // Back button
  backToCats.addEventListener('click', () => {
    playlistView.style.display = 'none';
    categoriesWrap.style.display = 'grid';
    isHymnbookMode = false;
    if (playerOverlay.style.display === 'flex') {
      closePlayer.click();
    }
  });

  // Close player
  closePlayer.addEventListener('click', () => {
    playerOverlay.style.display = 'none';
    const overlayVideo = document.getElementById('overlayVideo');
    const overlayAudio = document.getElementById('overlayAudio');
    overlayVideo.innerHTML = '';
    overlayAudio.innerHTML = '';
    overlayVideo.style.display = 'none';
    overlayAudio.style.display = 'none';
  });

  // Init
  renderCategories();
  renderPlaylistsSidebar();
  categoriesWrap.style.display = 'grid';
  playlistView.style.display = 'none';
  playerOverlay.style.display = 'none';

  // ===== YOUTUBE SEARCH FUNCTIONALITY =====
  const API_BASE = window.API_BASE || (window.location.hostname === "localhost" ? "" : "https://holyverse-s5s1.onrender.com");
  
  const youtubeSearchInput = document.getElementById('youtubeSearchInput');
  const youtubeSearchBtn = document.getElementById('youtubeSearchBtn');
  const youtubeResults = document.getElementById('youtubeResults');
  const youtubeResultsList = document.getElementById('youtubeResultsList');
  const youtubeLoading = document.getElementById('youtubeLoading');

  async function searchYouTube(query) {
    if (!query.trim()) return;

    youtubeLoading.style.display = 'block';
    youtubeResults.style.display = 'none';

    try {
      const response = await fetch(`${API_BASE}/api/youtube/search?q=${encodeURIComponent(query)}&max=15`);
      const data = await response.json();

      youtubeLoading.style.display = 'none';

      if (data.error) {
        showModal('Search failed: ' + data.error);
        return;
      }

      if (!data.results || data.results.length === 0) {
        youtubeResultsList.innerHTML = '<p style="color:var(--text-color);opacity:0.6;">No results found</p>';
        youtubeResults.style.display = 'block';
        return;
      }

      renderYouTubeResults(data.results);
      youtubeResults.style.display = 'block';
    } catch (err) {
      youtubeLoading.style.display = 'none';
      console.error('YouTube search error:', err);
      showModal('Search failed. Please try again later.');
    }
  }

  function renderYouTubeResults(results) {
    youtubeResultsList.innerHTML = '';

    results.forEach(result => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex; gap:12px; padding:12px; background:var(--button-bg); border:1px solid var(--accent); border-radius:8px; cursor:pointer; transition:transform 0.2s;';
      div.onmouseenter = () => div.style.transform = 'translateY(-2px)';
      div.onmouseleave = () => div.style.transform = 'translateY(0)';

      const img = document.createElement('img');
      img.src = result.thumbnail;
      img.style.cssText = 'width:120px; height:68px; object-fit:cover; border-radius:6px; flex-shrink:0;';

      const info = document.createElement('div');
      info.style.cssText = 'flex:1; min-width:0;';
      info.innerHTML = `
        <div style="font-weight:700; margin-bottom:4px; color:var(--text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${result.title}</div>
        <div style="font-size:0.85rem; color:var(--text-color); opacity:0.7; margin-bottom:4px;">${result.channel}</div>
      `;

      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = 'display:flex; gap:6px; align-items:center;';

      const playBtn = document.createElement('button');
      playBtn.textContent = '▶ Play';
      playBtn.style.cssText = 'padding:6px 12px; background:var(--accent); color:var(--button-text); border:none; border-radius:6px; cursor:pointer; font-weight:600; white-space:nowrap;';
      playBtn.onclick = (e) => {
        e.stopPropagation();
        playYouTubeVideo(result);
      };

      const addBtn = document.createElement('button');
      addBtn.textContent = '+';
      addBtn.title = 'Add to Playlist';
      addBtn.style.cssText = 'width:32px; height:32px; background:var(--accent); color:var(--button-text); border:none; border-radius:50%; cursor:pointer; font-size:1.2rem; font-weight:bold; display:flex; align-items:center; justify-content:center;';
      addBtn.onclick = (e) => {
        e.stopPropagation();
        showPlaylistMenu(result, addBtn);
      };

      buttonsContainer.appendChild(playBtn);
      buttonsContainer.appendChild(addBtn);

      div.appendChild(img);
      div.appendChild(info);
      div.appendChild(buttonsContainer);
      youtubeResultsList.appendChild(div);
    });
  }

  function playYouTubeVideo(video) {
    currentSong = {
      title: video.title,
      artist: video.channel,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      soundcloudUrl: null
    };
    playSong(null, 'video', video.videoId);
  }

  function showPlaylistMenu(video, buttonElement) {
    const menu = document.createElement('div');
    menu.style.cssText = 'position:absolute; background:var(--button-bg); border:1px solid var(--accent); border-radius:6px; z-index:9999; min-width:200px; box-shadow:0 4px 6px rgba(0,0,0,0.3);';

    const playlists = loadPlaylists();
    const playlistNames = Object.keys(playlists);

    if (playlistNames.length === 0) {
      const noMsg = document.createElement('div');
      noMsg.textContent = 'Create a playlist first';
      noMsg.style.cssText = 'padding:12px; color:var(--text-color); font-style:italic; text-align:center; opacity:0.6;';
      menu.appendChild(noMsg);
    } else {
      playlistNames.forEach(playlistName => {
        const option = document.createElement('div');
        option.textContent = playlistName;
        option.style.cssText = 'padding:8px 12px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.2); color:var(--text-color);';
        option.addEventListener('mouseenter', () => {
          option.style.background = 'var(--accent)';
          option.style.color = 'var(--button-bg)';
        });
        option.addEventListener('mouseleave', () => {
          option.style.background = 'transparent';
          option.style.color = 'var(--text-color)';
        });
        option.addEventListener('click', () => {
          const song = {
            id: video.videoId,
            title: video.title,
            artist: video.channel,
            youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
            soundcloudUrl: null
          };
          addToPlaylist(playlistName, song);
          document.body.removeChild(menu);
          renderPlaylistsSidebar();
        });
        menu.appendChild(option);
      });
    }

    // Position menu near button
    const rect = buttonElement.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left}px`;

    document.body.appendChild(menu);

    // Close menu on click outside
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== buttonElement) {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  // Search button click
  youtubeSearchBtn.addEventListener('click', () => {
    const query = youtubeSearchInput.value;
    searchYouTube(query);
  });

  // Search on Enter key
  youtubeSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = youtubeSearchInput.value;
      searchYouTube(query);
    }
  });
});
