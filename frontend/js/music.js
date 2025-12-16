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
  // - Your own uploaded audio files
  // - Licensed music services
  const hymnbook = [
    { number: 1, title: 'It Is Well With My Soul', author: 'Horatio Spafford', year: 1876, tune: 'Ville du Havre', 
      youtube: 'zY5o9mP22V0', 
      audio: '', // Remove placeholder or add real hymn audio URL
      lyrics: `When peace like a river attendeth my way\nWhen sorrows like sea billows roll\nWhatever my lot Thou hast taught me to say\nIt is well it is well with my soul\n\nIt is well with my soul\nIt is well it is well with my soul\n\nThough Satan should buffet though trials should come\nLet this blest assurance control\nThat Christ has regarded my helpless estate\nAnd hath shed His own blood for my soul` },
    { number: 2, title: 'How Great Thou Art', author: 'Carl Boberg', year: 1885, tune: 'How Great Thou Art', 
      youtube: 'Cc9t8EHMqVs',
      audio: '',
      lyrics: `O Lord my God when I in awesome wonder\nConsider all the worlds Thy hands have made\nI see the stars I hear the rolling thunder\nThy power throughout the universe displayed\n\nThen sings my soul my Savior God to Thee\nHow great Thou art how great Thou art\nThen sings my soul my Savior God to Thee\nHow great Thou art how great Thou art` },
    { number: 3, title: 'Great Is Thy Faithfulness', author: 'Thomas Chisholm', year: 1923, tune: 'Faithfulness', 
      youtube: 'fJt_CeQcvto',
      audio: '',
      lyrics: `Great is Thy faithfulness O God my Father\nThere is no shadow of turning with Thee\nThou changest not Thy compassions they fail not\nAs Thou hast been Thou forever will be\n\nGreat is Thy faithfulness great is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness Lord unto me` },
    { number: 4, title: 'Holy Holy Holy', author: 'Reginald Heber', year: 1826, tune: 'Nicaea', lyrics: `Holy holy holy Lord God Almighty\nEarly in the morning our song shall rise to Thee\nHoly holy holy merciful and mighty\nGod in three persons blessed Trinity\n\nHoly holy holy all the saints adore Thee\nCasting down their golden crowns around the glassy sea\nCherubim and seraphim falling down before Thee\nWhich wert and art and evermore shalt be` },
    { number: 5, title: 'Be Thou My Vision', author: 'Irish Hymn', year: 800, tune: 'Slane', lyrics: `Be Thou my vision O Lord of my heart\nNaught be all else to me save that Thou art\nThou my best thought by day or by night\nWaking or sleeping Thy presence my light\n\nRiches I heed not nor man's empty praise\nThou mine inheritance now and always\nThou and Thou only first in my heart\nHigh King of heaven my treasure Thou art` },
    { number: 6, title: 'Amazing Grace', author: 'John Newton', year: 1779, tune: 'New Britain', lyrics: `Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see\n\nTwas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed\n\nThrough many dangers toils and snares\nI have already come\nTis grace has brought me safe thus far\nAnd grace will lead me home` },
    { number: 7, title: 'Jesus Loves Me', author: 'Anna Bartlett Warner', year: 1862, tune: 'Jesus Loves Me', lyrics: `Jesus loves me this I know\nFor the Bible tells me so\nLittle ones to Him belong\nThey are weak but He is strong\n\nYes Jesus loves me\nYes Jesus loves me\nYes Jesus loves me\nThe Bible tells me so` },
    { number: 8, title: 'O Come All Ye Faithful', author: 'John Francis Wade', year: 1751, tune: 'Adeste Fideles', lyrics: `O come all ye faithful\nJoyful and triumphant\nO come ye O come ye to Bethlehem\nCome and behold Him\nBorn the King of Angels\nO come let us adore Him\nO come let us adore Him\nO come let us adore Him\nChrist the Lord` },
    { number: 9, title: 'Rock of Ages', author: 'Augustus Toplady', year: 1776, tune: 'Toplady', lyrics: `Rock of ages cleft for me\nLet me hide myself in Thee\nLet the water and the blood\nFrom Thy riven side which flowed\nBe of sin the double cure\nSave from wrath and make me pure` },
    { number: 10, title: 'Abide With Me', author: 'Henry Francis Lyte', year: 1847, tune: 'Eventide', lyrics: `Abide with me fast falls the eventide\nThe darkness deepens Lord with me abide\nWhen other helpers fail and comforts flee\nHelp of the helpless O abide with me\n\nSwift to its close ebbs out lifes little day\nEarth joys grow dim its glories pass away\nChange and decay in all around I see\nO Thou who changest not abide with me` },
    { number: 11, title: 'What A Friend We Have In Jesus', author: 'Joseph Scriven', year: 1855, tune: 'Converse', lyrics: `What a friend we have in Jesus\nAll our sins and griefs to bear\nWhat a privilege to carry\nEverything to God in prayer\nO what peace we often forfeit\nO what needless pain we bear\nAll because we do not carry\nEverything to God in prayer` },
    { number: 12, title: 'Just As I Am', author: 'Charlotte Elliott', year: 1835, tune: 'Woodworth', lyrics: `Just as I am without one plea\nBut that Thy blood was shed for me\nAnd that Thou bidst me come to Thee\nO Lamb of God I come I come` },
    { number: 13, title: 'Nearer My God To Thee', author: 'Sarah Flower Adams', year: 1841, tune: 'Bethel', lyrics: `Nearer my God to Thee nearer to Thee\nE'en though it be a cross that raiseth me\nStill all my song shall be nearer my God to Thee\nNearer my God to Thee nearer to Thee` },
    { number: 14, title: 'Jesus Christ Is Risen Today', author: 'Lyra Davidica', year: 1708, tune: 'Easter Hymn', lyrics: `Jesus Christ is risen today Alleluia\nOur triumphant holy day Alleluia\nWho did once upon the cross Alleluia\nSuffer to redeem our loss Alleluia` },
    { number: 15, title: 'Joy To The World', author: 'Isaac Watts', year: 1719, tune: 'Antioch', lyrics: `Joy to the world the Lord is come\nLet earth receive her King\nLet every heart prepare Him room\nAnd heaven and nature sing\nAnd heaven and nature sing\nAnd heaven and heaven and nature sing` },
    { number: 16, title: 'In Christ Alone', author: 'Keith Getty & Stuart Townend', year: 2001, tune: 'In Christ Alone', lyrics: `In Christ alone my hope is found\nHe is my light my strength my song\nThis cornerstone this solid ground\nFirm through the fiercest drought and storm\nWhat heights of love what depths of peace\nWhen fears are stilled when strivings cease\nMy Comforter my All in All\nHere in the love of Christ I stand` },
    { number: 17, title: 'The Old Rugged Cross', author: 'George Bennard', year: 1913, tune: 'The Old Rugged Cross', lyrics: `On a hill far away stood an old rugged cross\nThe emblem of suffering and shame\nAnd I love that old cross where the dearest and best\nFor a world of lost sinners was slain` },
    { number: 18, title: 'When The Roll Is Called Up Yonder', author: 'James Milton Black', year: 1893, tune: 'Roll Call', lyrics: `When the roll is called up yonder\nWhen the roll is called up yonder\nWhen the roll is called up yonder\nWhen the roll is called up yonder O my name\nWill be there O my name will be there` },
    { number: 19, title: 'His Eye Is On The Sparrow', author: 'Civilla D. Martin', year: 1905, tune: 'His Eye Is On The Sparrow', lyrics: `Why should I feel discouraged\nWhy should the shadows come\nWhy should my heart be lonely\nAnd long for heaven and home\nWhen Jesus is my portion\nMy constant Friend is He\nHis eye is on the sparrow\nAnd I know He watches me` },
    { number: 20, title: 'O Love That Wilt Not Let Me Go', author: 'George Matheson', year: 1882, tune: 'St. Margaret', lyrics: `O Love that wilt not let me go\nI rest my weary soul in Thee\nI give Thee back the life I owe\nThat in Thine ocean depths its flow\nMay richer fuller be` }
  ];

  const songs = [
    // WORSHIP - Expanded
    { id: 's1', category: 'worship', title: 'Way Maker', artist: 'Sinach', youtube: 'k28qCBwww0E', soundcloud: '', lyrics: null },
    { id: 's2', category: 'worship', title: 'Goodness of God', artist: 'Bethel Music', youtube: 'n0FBb6hnwTo', lyrics: null },
    { id: 's3', category: 'worship', title: 'Reckless Love', artist: 'Cory Asbury', youtube: 'Sc6SSHuZvQE', lyrics: null },
    { id: 's4', category: 'worship', title: 'Here I Am To Worship', artist: 'Tim Hughes', youtube: '6CKCThJB5w0', lyrics: null },
    { id: 's5', category: 'worship', title: 'How Great Is Our God', artist: 'Chris Tomlin', youtube: 'XV4nOVmWW2A', lyrics: null },
    { id: 's31', category: 'worship', title: 'We Believe', artist: 'Newsboys', youtube: 'WjZ01FcK0yk', lyrics: null },
    { id: 's32', category: 'worship', title: 'Your Name', artist: 'Natalie Grant', youtube: 'PasbQx0VilQ', lyrics: null },
    { id: 's33', category: 'worship', title: 'Mighty To Save', artist: 'Hillsong United', youtube: 'GEAcs2B-kNc', lyrics: null },
    { id: 's34', category: 'worship', title: 'Blessed Assurance', artist: 'Twila Paris', youtube: 'H1VMHEMOMZY', lyrics: null },
    { id: 's35', category: 'worship', title: 'Holy Forever', artist: 'Chris Tomlin', youtube: 'nIkHgxKemCRk', lyrics: null },

    // PRAISE - Expanded
    { id: 's6', category: 'praise', title: 'Joyful Joyful', artist: 'Brenton Brown', youtube: 'G8PqSiRQeBI', lyrics: null },
    { id: 's7', category: 'praise', title: 'This Is Amazing Grace', artist: 'Phil Wickham', youtube: 'XFRjr_x-yxU', lyrics: null },
    { id: 's8', category: 'praise', title: 'Break Every Chain', artist: 'Tasha Cobbs Leonard', youtube: 'ucY6NwQTI3M', lyrics: null },
    { id: 's9', category: 'praise', title: 'Shout to the Lord', artist: 'Darlene Zschech', youtube: '5_aIauL2xKA', lyrics: null },
    { id: 's10', category: 'praise', title: 'Living Hope', artist: 'Phil Wickham', youtube: 'u-1fwZtKJSM', lyrics: null },
    { id: 's36', category: 'praise', title: 'Raise A Hallelujah', artist: 'Bethel Music', youtube: 'G2XtRuPfaAU', lyrics: null },
    { id: 's37', category: 'praise', title: 'Thats how you change the world', artist: 'Newsboys', youtube: 'WtkTXBTTcAw', lyrics: null },
    { id: 's38', category: 'praise', title: 'Nothing But The Blood', artist: 'TheIslandSing', youtube: 'BYjhGeAIG6k', lyrics: null },
    { id: 's39', category: 'praise', title: 'Blessed', artist: 'Hillsong', youtube: 'I0NPps2VpY0', lyrics: null },

    // THANKSGIVING - Expanded
    { id: 's11', category: 'thanksgiving', title: 'Give Thanks', artist: 'Don Moen', youtube: 'blbslHDgceY', lyrics: null },
    { id: 's12', category: 'thanksgiving', title: 'Thank You Lord', artist: 'Don Moen', youtube: 'sax4aTgZ9dw', lyrics: null },
    { id: 's13', category: 'thanksgiving', title: 'Forever Grateful', artist: 'Elevation Worship', youtube: 'oh2goMABFPc', lyrics: null },
    { id: 's14', category: 'thanksgiving', title: 'Count Your Blessings', artist: 'Traditional', youtube: 'Hb4JBNDWhOA', lyrics: null },
    { id: 's40', category: 'thanksgiving', title: 'Goodness Goodness Goodness', artist: 'Jenn Johnson', youtube: 'n0FBb6hnwTo', lyrics: null },
    { id: 's41', category: 'thanksgiving', title: 'Grateful', artist: 'Brandon Lake', youtube: 'dQdfs5S6jyA', lyrics: null },
    { id: 's42', category: 'thanksgiving', title: 'Thank You', artist: 'Hillsong Worship', youtube: 'BSMuZFUL-0g', lyrics: null },

    // GOSPEL - Expanded
    { id: 's15', category: 'gospel', title: 'Oh Happy Day', artist: 'Edwin Hawkins Singers', youtube: 'KJohGa66FJM', lyrics: `Oh happy day oh happy day\nWhen Jesus washed when Jesus washed\nWhen Jesus washed washed my sins away` },
    { id: 's16', category: 'gospel', title: 'Amazing Grace', artist: 'Hillsong Worship', youtube: 'RLfOHwI6hcw', lyrics: `Amazing grace how sweet the sound\nThat saved a wretch like me` },
    { id: 's17', category: 'gospel', title: 'Total Praise', artist: 'Richard Smallwood', youtube: 'jCjaUwEsMdQ', lyrics: null },
    { id: 's18', category: 'gospel', title: 'I Smile', artist: 'Kirk Franklin', youtube: 'Z8SPwT3nQZ8', lyrics: null },
    { id: 's19', category: 'gospel', title: 'Take Me To The King', artist: 'Tamela Mann', youtube: 'wU3qgPn3bGA', lyrics: null },
    { id: 's43', category: 'gospel', title: 'Going Up Yonder', artist: 'Walter Hawkins', youtube: 'gYN3gltK2mg', lyrics: null },
    { id: 's44', category: 'gospel', title: 'Walk Around Heaven', artist: 'Mahalia Jackson', youtube: 'nAnW_fpils0', lyrics: null },
    { id: 's45', category: 'gospel', title: 'Swing Low Sweet Chariot', artist: 'Traditional', youtube: 'x5DBfU9_I4I', lyrics: null },
    { id: 's46', category: 'gospel', title: 'He Touched Me', artist: 'Bill Gaither', youtube: '5m--ptwd_iI', lyrics: null },
    { id: 's47', category: 'gospel', title: 'Glory Glory Hallelujah', artist: 'Traditional', youtube: 'Vuznp5-mTps', lyrics: null },

    // CONTEMPORARY - Expanded
    { id: 's25', category: 'contemporary', title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong United', youtube: 'OP-00EwLdiU', lyrics: null },
    { id: 's26', category: 'contemporary', title: 'What A Beautiful Name', artist: 'Hillsong Worship', youtube: 'nQWFzMvCfLE', lyrics: null },
    { id: 's27', category: 'contemporary', title: 'King of Kings', artist: 'Hillsong Worship', youtube: 'dQl4izxPeNU', lyrics: null },
    { id: 's28', category: 'contemporary', title: '10,000 Reasons', artist: 'Matt Redman', youtube: 'XtwIT8JjddM', lyrics: null },
    { id: 's29', category: 'contemporary', title: 'Build My Life', artist: 'Pat Barrett', youtube: 'Z32HiCoFzlU', lyrics: null },
    { id: 's30', category: 'contemporary', title: 'Yes I Will', artist: 'Vertical Worship', youtube: 'NrTv39-lG4M', lyrics: null },
    { id: 's48', category: 'contemporary', title: 'Starlight', artist: 'Elevation Worship', youtube: 'enCf0Cy949Q', lyrics: null },
    { id: 's49', category: 'contemporary', title: 'Way Maker', artist: 'Leeland', youtube: 'iJCV_2H9xD0', lyrics: null },
    { id: 's50', category: 'contemporary', title: 'Unending Love', artist: 'Hillsongg', youtube: 'Db-CF_rfZWs', lyrics: null },

    // PRAYER & DEVOTION - New Category
    { id: 's51', category: 'prayer', title: 'Jesus I Come', artist: 'Elevation Worship', youtube: '_8Fx06jskfY', lyrics: null },
    { id: 's52', category: 'prayer', title: 'I Surrender', artist: 'Hillsong Worship', youtube: 's7jXASBWwwI', lyrics: null },
    { id: 's53', category: 'prayer', title: 'Breathe', artist: 'Hillsong worship', youtube: 'k5w7MgTgVVs', lyrics: null },
    { id: 's54', category: 'prayer', title: 'Our God', artist: 'Chris Tomlin', youtube: 'NJpt1hSYf2o', lyrics: null },
    { id: 's55', category: 'prayer', title: 'I Need Thee Every Hour', artist: 'Traditional', youtube: 'pTg86guC5GE', lyrics: null },
    { id: 's56', category: 'prayer', title: 'Come As You Are', artist: 'Nirvana', youtube: 'vabnZ9-ex7o', lyrics: null },
    { id: 's57', category: 'prayer', title: 'Lord I Need You', artist: 'Matt Maher', youtube: 'LuvfMDhTyMA', lyrics: null },
    { id: 's58', category: 'prayer', title: 'I Will Rise', artist: 'Chris Tomlin', youtube: 'l6paJbntGpU', lyrics: null },

    // SPIRITUAL - New Category
    { id: 's59', category: 'spiritual', title: 'Spirit Of The Living God', artist: 'Heather Small', youtube: 'ogGOlGswStA', lyrics: null },
    { id: 's60', category: 'spiritual', title: 'Immanuel', artist: 'Tye Tribbett', youtube: 'Oak6YQqggQY', lyrics: null },
    { id: 's61', category: 'spiritual', title: 'He Reigns', artist: 'Newsboys', youtube: 'Y8R9ZPT2T-I', lyrics: null },
    { id: 's62', category: 'spiritual', title: 'Set A Fire', artist: 'Will Reagan', youtube: 'lZiqgrtNT6s', lyrics: null },
    { id: 's63', category: 'spiritual', title: 'Holy Spirit', artist: 'Francesca Battistelli', youtube: 'qNwnOfZ5N8A', lyrics: null },
    { id: 's64', category: 'spiritual', title: 'Refiner\'s Fire', artist: 'Brian Doerksen', youtube: 'BLyQAx8DpBI', lyrics: null },
    { id: 's65', category: 'spiritual', title: 'Consuming Fire', artist: 'Tim Hughes', youtube: '6XOBBUu_23M', lyrics: null }
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
        style="width:100%; padding:10px 15px; border:2px solid var(--accent); border-radius:8px; font-size:0.95rem; font-family:var(--font); color:var(--text-color); background:var(--button-bg);">
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
          const noMsg = document.createElement('div');
          noMsg.textContent = 'Create a playlist first';
          noMsg.style.cssText = 'padding:12px; color:var(--text-color); font-style:italic; text-align:center; opacity:0.6;';
          menu.appendChild(noMsg);
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
        }
        
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
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
    
    // Create hymn selection grid
    const hymnGrid = document.createElement('div');
    hymnGrid.className = 'hymn-selection-grid';
    hymnGrid.innerHTML = '<h3 style="width:100%;text-align:center;color:var(--text-color);opacity:0.7;margin-bottom:20px;">Select a Hymn</h3>';
    
    hymnbook.forEach(hymn => {
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
    
    songList.appendChild(hymnGrid);
    playlistView.style.display = 'flex';
  }

  // Open hymn reader with traditional hymnal styling
  function openHymnReader(startIndex = 0) {
    currentHymnPage = startIndex;
    songList.innerHTML = '';
    
    const reader = document.createElement('div');
    reader.className = 'hymnal-reader';
    reader.innerHTML = `
      <div class="hymn-book-open" id="hymnBook">
      <div class="page-stack left"></div>
<div class="page-stack right"></div>

        <div class="hymn-book-spine"></div>
        <div class="hymn-book-left" id="hymnPageLeft">
          <div class="hymnal-page hymnal-page-blank">
            <div style="text-align:center; color:var(--text-color); opacity:0.5; margin-top:250px;">← Previous</div>
          </div>
        </div>
        <div class="hymn-page-flip" id="hymnPageFlip">
  <div class="hymnal-page" id="flipPageContent"></div>
</div>

        <div class="hymn-book-right" id="hymnPageRight">
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
function updateStackThickness() {
  const leftStack = document.querySelector('.page-stack.left');
  const rightStack = document.querySelector('.page-stack.right');

  const ratio = currentHymnPage / hymnbook.length;
  leftStack.style.width = `${4 + ratio * 12}px`;
  rightStack.style.width = `${4 + (1 - ratio) * 12}px`;
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

  // Flip hymn forward with page turn effect
  function flipHymnForward() {
  if (currentHymnPage >= hymnbook.length - 1) return;

  const left = hymnPageLeft;
  const right = hymnPageRight;
  const flip = hymnPageFlip;
  const flipContent = flipPageContent;

  flip.className = 'hymn-page-flip forward active';
  flipContent.innerHTML = right.innerHTML;

  // Update EARLY (before animation ends)
  currentHymnPage++;
  displayCurrentHymnOnRight();
  left.innerHTML = flipContent.innerHTML;

  requestAnimationFrame(() => {
    flip.classList.add('animate');
  });

  setTimeout(() => {
    flip.className = 'hymn-page-flip';
  }, 900);
}

function flipHymnBackward() {
  if (currentHymnPage <= 0) return;

  const left = hymnPageLeft;
  const right = hymnPageRight;
  const flip = hymnPageFlip;
  const flipContent = flipPageContent;

  flip.className = 'hymn-page-flip backward active';
  flipContent.innerHTML = left.innerHTML;

  currentHymnPage--;
  displayCurrentHymnOnRight();
  right.innerHTML = flipContent.innerHTML;

  requestAnimationFrame(() => {
    flip.classList.add('animate');
  });

  setTimeout(() => {
    flip.className = 'hymn-page-flip';
  }, 900);
}


  


  // Play hymn from hymnbook
  function playHymn(hymn, mode) {
    currentSong = {
      id: `hymn${hymn.number}`,
      title: hymn.title,
      artist: hymn.author || '',
      youtube: hymn.youtube,
      audio: hymn.audio,
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
      if (hymn.audio) {
        const audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.autoplay = true;
        audioEl.style.width = '100%';
        audioEl.innerHTML = `<source src="${hymn.audio}" type="audio/mpeg">`;
        overlayAudio.appendChild(audioEl);
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

  // Fetch lyrics from free API (lyrics.ovh - completely free, no API key needed)
  function fetchLyrics(title, artist) {
    if (!title || !artist) return Promise.resolve(null);
    
    return fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => data && data.lyrics ? `<pre style="white-space:pre-wrap;font-family:inherit;">${data.lyrics}</pre>` : null)
      .catch(error => {
        console.log('Lyrics fetch error:', error);
        return null;
      });
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
        if (confirm(`Delete "${name}"?`)) {
          delete playlists[name];
          savePlaylists(playlists);
          renderPlaylistsSidebar();
        }
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
      alert('Enter a playlist name');
      return;
    }

    const playlists = loadPlaylists();
    if (playlists[name]) {
      alert('Playlist already exists');
      return;
    }

    playlists[name] = [];
    savePlaylists(playlists);
    input.value = '';
    renderPlaylistsSidebar();
    alert(`✅ Playlist "${name}" created!`);
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
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&max=15`);
      const data = await response.json();

      youtubeLoading.style.display = 'none';

      if (data.error) {
        alert('Search failed: ' + data.error);
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
      alert('Search failed. Make sure the server is running and YOUTUBE_API_KEY is set in .env');
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
