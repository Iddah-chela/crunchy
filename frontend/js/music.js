/* music.js
   Drop into your page. Uses hash routing, categories, media session, lyrics syncing.
*/

// --------- Your songs (edit categories property) ----------
const songs = [
  { id: 'yt1', type: 'youtube', category: 'worship', title: 'Worship — Example YouTube', artist: 'Artist', src: 'dQw4w9WgXcQ', lyrics: `[00:00] Intro\n[00:12] Amazing grace...` },
  { id: 'mp3-1', type: 'audio', category: 'hymn', title: 'Acoustic Hymn', artist: 'Local Artist', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', lyrics: `Amazing grace, how sweet the sound\nThat saved a wretch like me...` },
  { id: 'sc1', type: 'soundcloud', category: 'praise', title: 'Praise — Example SC', artist: 'SC', src: 'https://soundcloud.com/forss/flickermood', lyrics: `Static lyrics` }
];

// --------- DOM refs ----------
const categoriesEl = document.getElementById('categories');
const playlistEl = document.getElementById('playlist');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const timeDisplay = document.getElementById('timeDisplay');
const lyricsEl = document.getElementById('lyrics');

const videoWrap = document.getElementById('videoWrap');
const ytContainerId = 'yt-player';
const scIframe = document.getElementById('sc-iframe');

const audioWrap = document.getElementById('audioWrap');
const audioEl = document.getElementById('audioEl');

const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');

let currentIndex = 0;
let ytReady = false;
let ytPlayer = null;
let scWidget = null;
let raf = null;
let isPlaying = false;
let parsedLyrics = [];
let lyricsTimer = null;

// ---------- categories ----------
function getCategories() {
  const set = new Set(songs.map(s => s.category || 'uncategorized'));
  return Array.from(set);
}

function renderCategories() {
  const cats = getCategories();
  categoriesEl.innerHTML = '';
  const all = document.createElement('li');
  all.textContent = 'All';
  all.style.cursor = 'pointer';
  all.onclick = () => navigateTo('#/category/all');
  categoriesEl.appendChild(all);

  cats.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.replace(/_/g,' ').toLowerCase();
    li.style.cursor = 'pointer';
    li.onclick = () => navigateTo('#/category/' + encodeURIComponent(c));
    categoriesEl.appendChild(li);
  });
}

// ---------- playlist rendering ----------
function renderPlaylist(filterCategory) {
  playlistEl.innerHTML = '';
  const list = (filterCategory && filterCategory !== 'all') ? songs.filter(s => s.category === filterCategory) : songs;
  list.forEach((s, i) => {
    const li = document.createElement('li');
    li.dataset.songId = s.id;
    li.innerHTML = `<div style="font-weight:600">${s.title}</div><div style="font-size:0.85em;color:#666">${s.artist} • ${s.type}</div>`;
    li.addEventListener('click', () => {
      // find index in master songs array
      const idx = songs.findIndex(x => x.id === s.id);
      if(idx >= 0) loadSong(idx);
    });
    playlistEl.appendChild(li);
  });
  highlightActive();
}

function highlightActive(){
  Array.from(playlistEl.children).forEach(li => li.classList.remove('active'));
  const s = songs[currentIndex];
  if(!s) return;
  const el = playlistEl.querySelector(`[data-song-id="${s.id}"]`);
  if(el) el.classList.add('active');
}

// ---------- YouTube & SoundCloud APIs (like your code) ----------
(function loadYouTubeAPI(){
  const tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(tag);
})();
(function loadSoundCloudAPI(){
  const tag = document.createElement('script'); tag.src = "https://w.soundcloud.com/player/api.js"; document.head.appendChild(tag);
})();

window.onYouTubeIframeAPIReady = function(){ ytReady = true; if(songs[currentIndex] && songs[currentIndex].type==='youtube') initYouTubePlayer(songs[currentIndex].src); };

// ---------- load / stop ----------
function stopAllPlayers(){
  try { audioEl.pause(); } catch(e){}
  try { if(ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo(); } catch(e){}
  try { if(scWidget && scWidget.pause) scWidget.pause(); } catch(e){}
  isPlaying = false; playPauseBtn.textContent = '▶️'; cancelAnimationFrame(raf);
}

function loadSong(index){
  if(index < 0 || index >= songs.length) return;
  stopAllPlayers();
  currentIndex = index;
  highlightActive();

  const s = songs[index];
  titleEl.textContent = s.title;
  artistEl.textContent = s.artist || '';
  parseAndShowLyrics(s.lyrics || '');

  // hide players
  videoWrap.style.display = 'none'; audioWrap.style.display = 'none'; scIframe.style.display = 'none';
  document.getElementById(ytContainerId).innerHTML = '';

  if(s.type === 'audio'){
    audioWrap.style.display = 'block';
    audioEl.src = s.src;
    audioEl.currentTime = 0;
    audioEl.volume = parseFloat(volume.value);
    audioEl.play().then(()=> { isPlaying=true; playPauseBtn.textContent='⏸'; startProgressUpdater(); }).catch(()=> { playPauseBtn.textContent='▶️'; startProgressUpdater(); });
  } else if(s.type === 'youtube'){
    videoWrap.style.display = 'block';
    if(ytReady) initYouTubePlayer(s.src);
    else {
      // placeholder until API ready
      const placeholder = document.createElement('div'); placeholder.id = ytContainerId + '-placeholder'; document.getElementById(ytContainerId).appendChild(placeholder);
    }
  } else if(s.type === 'soundcloud'){
    videoWrap.style.display = 'block'; scIframe.style.display='block';
    const params = new URLSearchParams({ url: s.src, auto_play: 'false', hide_related: 'false', show_comments:'false', show_user:'true', show_reposts:'false', visual:'false' });
    scIframe.src = `https://w.soundcloud.com/player/?${params.toString()}`;
    initSCWidgetWhenReady();
  }

  // set media metadata (media session)
  setMediaSessionMetadata(s);
  // persist
  localStorage.setItem('music_currentIndex', String(currentIndex));
  localStorage.setItem('music_currentSongId', s.id);
  updateTimeDisplay(0,0); progress.value=0;
}

// ---------- YT init ----------
function initYouTubePlayer(videoId){
  if(ytPlayer && ytPlayer.destroy){ ytPlayer.destroy(); ytPlayer = null; }
  ytPlayer = new YT.Player(ytContainerId, {
    height: '360', width: '640', videoId: videoId,
    playerVars: { autoplay:1, controls:1, modestbranding:1, rel:0, iv_load_policy:3 },
    events: {
      onReady: (e) => { try{ e.target.playVideo(); isPlaying=true; playPauseBtn.textContent='⏸'; startProgressUpdater(); }catch(e){} const v = parseFloat(volume.value)*100; try{ ytPlayer.setVolume(v);}catch(e){} },
      onStateChange: (ev) => {
        const YTState = YT.PlayerState;
        if(ev.data === YTState.PAUSED || ev.data === YTState.ENDED){ isPlaying=false; playPauseBtn.textContent='▶️'; }
        else if(ev.data === YTState.PLAYING){ isPlaying=true; playPauseBtn.textContent='⏸'; }
        if(ev.data === YTState.ENDED) nextSong();
      }
    }
  });
}

// ---------- SoundCloud widget init helper ----------
function initSCWidgetWhenReady(){
  function initSC(){
    try{
      scWidget = SC.Widget(scIframe);
      scWidget.bind(SC.Widget.Events.READY, () => {
        scWidget.setVolume(parseFloat(volume.value));
        scWidget.play(); // may be blocked until user interacts
        isPlaying = true; playPauseBtn.textContent='⏸'; startProgressUpdater();
      });
      scWidget.bind(SC.Widget.Events.PLAY, ()=> { isPlaying=true; playPauseBtn.textContent='⏸'; });
      scWidget.bind(SC.Widget.Events.PAUSE, ()=> { isPlaying=false; playPauseBtn.textContent='▶️'; });
      scWidget.bind(SC.Widget.Events.FINISH, ()=> nextSong());
    }catch(e){ console.warn('SC init failed', e); }
  }

  if(typeof SC !== 'undefined') initSC();
  else {
    const t = setInterval(()=> { if(typeof SC !== 'undefined'){ clearInterval(t); initSC(); } }, 200);
  }
}

// ---------- controls ----------
playPauseBtn.addEventListener('click', () => {
  const s = songs[currentIndex];
  if(!s) return;
  if(s.type === 'audio'){
    if(audioEl.paused){ audioEl.play(); isPlaying=true; playPauseBtn.textContent='⏸'; }
    else{ audioEl.pause(); isPlaying=false; playPauseBtn.textContent='▶️'; }
  } else if(s.type === 'youtube'){
    if(!ytPlayer) return;
    const st = ytPlayer.getPlayerState();
    if(st === YT.PlayerState.PLAYING){ ytPlayer.pauseVideo(); isPlaying=false; playPauseBtn.textContent='▶️'; }
    else{ ytPlayer.playVideo(); isPlaying=true; playPauseBtn.textContent='⏸'; }
  } else if(s.type === 'soundcloud'){
    if(!scWidget) return;
    scWidget.isPaused(paused => {
      if(paused){ scWidget.play(); isPlaying=true; playPauseBtn.textContent='⏸'; } 
      else { scWidget.pause(); isPlaying=false; playPauseBtn.textContent='▶️'; }
    });
  }
});

prevBtn.addEventListener('click', ()=> changeSong(-1));
nextBtn.addEventListener('click', ()=> changeSong(1));

function changeSong(delta){ let ni = (currentIndex + delta + songs.length) % songs.length; loadSong(ni); }
function nextSong(){ changeSong(1); }

// ---------- progress / seek ----------
progress.addEventListener('input', (e) => {
  const pct = parseFloat(e.target.value) / 100;
  seekToPercent(pct);
});

function seekToPercent(pct){
  const s = songs[currentIndex]; if(!s) return;
  if(s.type === 'audio'){ if(audioEl.duration) audioEl.currentTime = audioEl.duration * pct; }
  else if(s.type === 'youtube'){ if(ytPlayer && ytPlayer.getDuration){ const d = ytPlayer.getDuration(); ytPlayer.seekTo(d * pct, true); } }
  else if(s.type === 'soundcloud'){ if(scWidget) scWidget.getDuration(dMs => scWidget.seekTo(dMs * pct)); }
}

// ---------- volume ----------
volume.addEventListener('input', ()=> {
  const v = parseFloat(volume.value);
  audioEl.volume = v;
  if(ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(v*100);
  if(scWidget && scWidget.setVolume) scWidget.setVolume(v);
});

// ---------- progress updater ----------
function startProgressUpdater(){
  cancelAnimationFrame(raf);
  function tick(){
    const s = songs[currentIndex]; if(!s) return;
    if(s.type === 'audio'){ const cur=audioEl.currentTime||0; const dur=audioEl.duration||0; updateTimeDisplay(cur,dur); updateProgressBar(cur,dur); if(!audioEl.paused) isPlaying=true; }
    else if(s.type === 'youtube'){ if(ytPlayer && ytPlayer.getDuration){ const dur = ytPlayer.getDuration()||0; const cur = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0; updateTimeDisplay(cur,dur); updateProgressBar(cur,dur); } }
    else if(s.type === 'soundcloud'){ if(scWidget){ scWidget.getPosition(posMs => { scWidget.getDuration(dMs => { const cur=(posMs||0)/1000; const dur=(dMs||0)/1000; updateTimeDisplay(cur,dur); updateProgressBar(cur,dur); }); }); } }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

function updateProgressBar(cur, dur){ if(!isFinite(dur) || dur===0) progress.value=0; else progress.value = (cur/dur)*100; }
function updateTimeDisplay(cur, dur){
  const fmt = s => { s = Math.max(0, Math.floor(s)); const m = Math.floor(s/60); const sec = String(s%60).padStart(2,'0'); return `${m}:${sec}`; };
  timeDisplay.textContent = `${fmt(cur)} / ${isFinite(dur) && dur>0 ? fmt(dur) : '00:00'}`;
}

// ---------- lyrics parser & highlighter ----------
function parseAndShowLyrics(txt){
  parsedLyrics = [];
  const lines = txt.split(/\r?\n/).map(l=>l.trim());
  for(const line of lines){
    const match = line.match(/^\[(\d{1,2}):(\d{2})\]\s*(.*)/);
    if(match){ parsedLyrics.push({time: parseInt(match[1],10)*60 + parseInt(match[2],10), text: match[3]}); }
    else if(line) parsedLyrics.push({time: null, text: line});
  }
  renderLyrics();
  startLyricsHighlighter();
}
function renderLyrics(){ if(parsedLyrics.length===0){ lyricsEl.textContent='No lyrics available.'; return;} lyricsEl.innerHTML = parsedLyrics.map((ln,i)=>`<div data-idx="${i}" style="padding:2px 0">${ln.text}</div>`).join(''); }
function startLyricsHighlighter(){
  if(lyricsTimer) clearInterval(lyricsTimer);
  lyricsTimer = setInterval(()=> {
    const s = songs[currentIndex];
    if(!s) return;
    const getCur = cb => {
      if(s.type === 'audio') cb(audioEl.currentTime || 0);
      else if(s.type === 'youtube') cb(ytPlayer && ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0);
      else if(s.type === 'soundcloud'){ if(scWidget) scWidget.getPosition(ms => cb((ms||0)/1000)); else cb(0); }
      else cb(0);
    };
    getCur(curSec => {
      let active = -1;
      for(let i=0;i<parsedLyrics.length;i++){ if(parsedLyrics[i].time === null) continue; if(parsedLyrics[i].time <= curSec) active = i; }
      Array.from(lyricsEl.querySelectorAll('div')).forEach(div => div.style.background = '');
      if(active >= 0){ const el = lyricsEl.querySelector(`div[data-idx="${active}"]`); if(el){ el.style.background = '#ffd'; el.scrollIntoView({behavior:'smooth', block:'center'}); } }
    });
  }, 700);
}

// ---------- media session (OS controls / lock screen) ----------
function setMediaSessionMetadata(s){
  if(!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.artist || '', album: '', artwork: [] });
  navigator.mediaSession.setActionHandler('play', ()=> playPauseBtn.click());
  navigator.mediaSession.setActionHandler('pause', ()=> playPauseBtn.click());
  navigator.mediaSession.setActionHandler('previoustrack', ()=> prevBtn.click());
  navigator.mediaSession.setActionHandler('nexttrack', ()=> nextBtn.click());
}

// ---------- routing (hash) ----------
function handleHash(){
  const h = location.hash || '#/category/all';
  if(h.startsWith('#/category/')){
    const cat = decodeURIComponent(h.replace('#/category/',''));
    renderPlaylist(cat === 'all' ? null : cat);
  } else {
    // default: show categories and all
    renderPlaylist(null);
  }
}
function navigateTo(hash){
  location.hash = hash;
}

// ---------- persistence restore ----------
function restoreState(){
  const idx = parseInt(localStorage.getItem('music_currentIndex'),10);
  const songId = localStorage.getItem('music_currentSongId');
  if(!isNaN(idx) && idx >= 0 && idx < songs.length) currentIndex = idx;
  else if(songId) {
    const i = songs.findIndex(s=>s.id === songId);
    if(i>=0) currentIndex = i;
  }
}

// ---------- init ----------
function bindSimpleEvents(){
  document.addEventListener('keydown', (e)=> { if(e.code==='Space'){ e.preventDefault(); playPauseBtn.click(); } if(e.code==='ArrowRight') nextBtn.click(); if(e.code==='ArrowLeft') prevBtn.click(); });
  audioEl.addEventListener('play', ()=> { isPlaying=true; playPauseBtn.textContent='⏸'; startProgressUpdater(); });
  audioEl.addEventListener('pause', ()=> { isPlaying=false; playPauseBtn.textContent='▶️'; });
  audioEl.addEventListener('ended', ()=> nextSong());
  window.addEventListener('hashchange', handleHash);
  progress.addEventListener('change', ()=>{ /* keep handled by input */ });
  // try to resume blocked embeds on first user interaction
  document.addEventListener('click', ()=> {
    const s = songs[currentIndex];
    if(s && s.type === 'youtube' && ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
    if(s && s.type === 'soundcloud' && scWidget && scWidget.play) scWidget.play();
  }, { once: true });
}

function initMusicApp(){
  renderCategories();
  restoreState();
  renderPlaylist(null);
  loadSong(currentIndex);
  bindSimpleEvents();
  handleHash();
  // keep playing when page hidden (default behavior), optionally handle visibility
  document.addEventListener('visibilitychange', ()=> {
    // nothing needed generally; some mobile browsers may pause when hidden — that's normal
  });
}

// run
initMusicApp();
