(function(){
  // ---- PASTE YOUR TRACKS HERE ----
  // audio: your song file (local relative path, or a Dropbox ?dl=1 link).
  // image: optional. Leave it out (or set to null) to fall back to the generated landscape art.
  // album: which album this track belongs to. Leave it out (or set to null) and it will
  //        land in a "Singles" catch-all album so nothing gets lost.
  // lyrics: optional. Paste the lyrics as a backtick string, one line per line of text, e.g.
  //         lyrics: `First line here
  //         Second line here`
  //         Leave it as "" and the lyrics panel will just say "No lyrics added yet."
    const trackData = [
  ];

  function parseFilename(url){
    try {
      const clean = url.split('?')[0];
      const raw = decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1));
      const noExt = raw.replace(/\.[^/.]+$/, '');
      const parts = noExt.split(/\s*-\s*/);
      if (parts.length >= 2){
        return { artist: titleCase(parts[0]), title: titleCase(parts.slice(1).join(' - ')) };
      }
      return { artist: 'Unknown Artist', title: titleCase(noExt) };
    } catch(e){
      return { artist: 'Unknown Artist', title: url };
    }
  }
  function titleCase(s){
    return s.replace(/[_]+/g,' ').trim().replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1));
  }

  // ---- PASTE YOUR ALBUM COVERS HERE (optional) ----
  // Fill in an image path for any album to use it as that album's cover on the
  // Albums grid. Leave it as "" (empty string) to keep the generated landscape art.
  // Same rules as track covers: local relative path (e.g. "bookSongsCovers/blu.png")
  // or a Dropbox ?dl=1 link. If an image fails to load, it falls back to generated art.
  const albumCovers = {};

  const baseSongs = trackData.map((t, i) => {
    const meta = parseFilename(t.audio);
    return { id:i, url:t.audio, image:t.image || null, album: t.album || 'Instrumentals', lyrics: t.lyrics || '', title:meta.title, artist:meta.artist, dur:null, uploaded:false };
  });

  // Lyrics added through the app's own editor are saved in this browser and
  // take priority over anything hardcoded in trackData above.
  const LYRICS_KEY_PREFIX = 'aether-lyrics-';
  baseSongs.forEach(song => {
    try {
      const stored = localStorage.getItem(LYRICS_KEY_PREFIX + song.id);
      if (stored !== null) song.lyrics = stored;
    } catch(e){ /* localStorage unavailable — code defaults still work */ }
  });

  // Songs added through the "Add Music" panel (see the Uploads section below)
  // live only in this browser's IndexedDB and are merged in alongside the
  // built-in trackData songs. Uploaded ids are stable strings ('up-<dbKey>')
  // so removing one upload never shifts another's id.
  let uploadedSongs = [];
  let songs = baseSongs.slice();
  let songsById = new Map();
  let albumOrder = [];
  let albumMap = new Map();

  function getSong(id){ return songsById.get(id); }

  // group songs into albums, preserving first-appearance order
  function rebuildAlbums(){
    albumOrder = [];
    albumMap = new Map();
    songs.forEach(s => {
      const albums = Array.isArray(s.album) ? s.album : [s.album];
      albums.forEach(name => {
        if (!albumMap.has(name)){ albumMap.set(name, []); albumOrder.push(name); }
        albumMap.get(name).push(s.id);
      });
    });
  }

  function rebuildSongs(){
    songs = baseSongs.concat(uploadedSongs);
    songsById = new Map(songs.map(s => [s.id, s]));
    rebuildAlbums();
  }

  rebuildSongs();

  const liked = new Set();
  const added = new Set();

  let queue = songs.map(s => s.id);
  let pos = 0;
  let playing = false;

  const audio = new Audio();
  audio.preload = 'metadata';

  const libraryView = document.getElementById('libraryView');
  const playerView = document.getElementById('playerView');
  const albumGrid = document.getElementById('albumGrid');
  const songListView = document.getElementById('songListView');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const backBtn = document.getElementById('backBtn');
  const lyricsPanel = document.getElementById('lyricsPanel');
  const lyricsText = document.getElementById('lyricsText');
  const lyricsToggleBtn = document.getElementById('lyricsToggleBtn');
  const lyricsEditBtn = document.getElementById('lyricsEditBtn');
  const lyricsEditor = document.getElementById('lyricsEditor');
  const lyricsEditActions = document.getElementById('lyricsEditActions');
  const lyricsSaveBtn = document.getElementById('lyricsSaveBtn');
  const lyricsCancelBtn = document.getElementById('lyricsCancelBtn');

  const addMusicBtn = document.getElementById('addMusicBtn');
  const uploadOverlay = document.getElementById('uploadOverlay');
  const uploadCloseBtn = document.getElementById('uploadCloseBtn');
  const uploadAudioInput = document.getElementById('uploadAudioInput');
  const uploadImageInput = document.getElementById('uploadImageInput');
  const uploadTitleInput = document.getElementById('uploadTitleInput');
  const uploadArtistInput = document.getElementById('uploadArtistInput');
  const uploadAlbumInput = document.getElementById('uploadAlbumInput');
  const uploadSaveBtn = document.getElementById('uploadSaveBtn');
  const albumSuggestions = document.getElementById('albumSuggestions');
  const uploadStorageEl = document.getElementById('uploadStorageUsage');
  const uploadModeOneBtn = document.getElementById('uploadModeOneBtn');
  const uploadModeManyBtn = document.getElementById('uploadModeManyBtn');
  const uploadOneFields = document.getElementById('uploadOneFields');
  const uploadManyFields = document.getElementById('uploadManyFields');
  const uploadBulkAudioInput = document.getElementById('uploadBulkAudioInput');
  const uploadBulkImageInput = document.getElementById('uploadBulkImageInput');
  const uploadBulkAlbumInput = document.getElementById('uploadBulkAlbumInput');
  const uploadBulkPreview = document.getElementById('uploadBulkPreview');
  const uploadProgress = document.getElementById('uploadProgress');

  const svg = document.getElementById('landscape');
  const landscapeImg = document.getElementById('landscapeImg');
  const artLayer = document.getElementById('artLayer');
  const queueList = document.getElementById('queueList');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const albumTag = document.getElementById('albumTag');
  const progressFill = document.getElementById('progressFill');
  const progressTrack = document.getElementById('progressTrack');
  const curTimeEl = document.getElementById('curTime');
  const totalTimeEl = document.getElementById('totalTime');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const likeBtn = document.getElementById('likeBtn');
  const addBtn = document.getElementById('addBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');

  function mulberry32(seed){
    return function(){
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function hashStr(str){
    let h = 0;
    for (let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  function fmt(s){
    if (s == null || isNaN(s)) return '--:--';
    s = Math.floor(s);
    const m = Math.floor(s/60), r = s%60;
    return m + ':' + String(r).padStart(2,'0');
  }

  // Builds the gothic landscape SVG markup for a given seed/uid pair.
  // uid must be unique among all <svg> elements simultaneously in the DOM
  // (the main viewer uses 'main'; album thumbnails get their own id).
  function landscapeMarkup(seed, uid){
    const rnd = mulberry32(seed * 977 + 13);
    const hue = 250 + Math.floor(rnd()*70);
    const skyTop = `hsl(${hue}, 32%, 9%)`;
    const skyMid = `hsl(${hue+10}, 28%, 14%)`;
    const skyBottom = `hsl(${(hue+300)%360}, 20%, 6%)`;
    const moonWarm = seed % 2 === 0;
    const moonColor = moonWarm ? '#e7d3a1' : '#cdd3d8';
    const moonX = 260 + rnd()*680;
    const moonY = 130 + rnd()*90;
    const moonR = 46 + rnd()*10;
    const phase = rnd();

    let defs = `<defs>
      <linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}"/>
        <stop offset="55%" stop-color="${skyMid}"/>
        <stop offset="100%" stop-color="${skyBottom}"/>
      </linearGradient>
    </defs>`;

    let out = `<rect x="0" y="0" width="1200" height="750" fill="url(#sky${uid})"/>`;

    out += `<g stroke="${moonColor}" stroke-opacity="0.10" fill="none">`;
    for (let i=1;i<=3;i++){
      out += `<circle cx="${moonX}" cy="${moonY}" r="${moonR + i*34}" stroke-width="1"/>`;
    }
    out += `</g>`;

    out += `<g fill="${moonColor}" opacity="0.75">`;
    for (let i=0;i<70;i++){
      const sx = rnd()*1200, sy = rnd()*420, sr = rnd()*1.4 + 0.3;
      out += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(2)}"/>`;
    }
    out += `</g>`;

    out += `<mask id="moonMask${uid}">
        <rect x="0" y="0" width="1200" height="750" fill="white"/>
        <circle cx="${moonX + (phase-0.5)*moonR*2.1}" cy="${moonY}" r="${moonR}" fill="black"/>
      </mask>
      <circle cx="${moonX}" cy="${moonY}" r="${moonR}" fill="${moonColor}" mask="url(#moonMask${uid})"/>
      <circle cx="${moonX}" cy="${moonY}" r="${moonR}" fill="none" stroke="${moonColor}" stroke-opacity="0.25"/>`;

    out += buildSkylineLayer(rnd, 470, `hsl(${hue}, 20%, 8%)`, 0.55, 0.9);
    out += buildSkylineLayer(rnd, 560, `hsl(${(hue+340)%360}, 22%, 5%)`, 0.85, 1.25);

    return defs + out;
  }

  function buildLandscape(songId){
    svg.innerHTML = landscapeMarkup(hashStr(String(songId)), 'main');
  }

  function buildSkylineLayer(rnd, baseY, color, heightScale, widthScale){
    let x = -20;
    let d = `M -20 750 `;
    while (x < 1230){
      const w = (40 + rnd()*70) * widthScale;
      const h = (60 + rnd()*220) * heightScale;
      const topY = baseY - h;
      const spireTip = rnd() > 0.6;
      d += `L ${x.toFixed(0)} ${baseY.toFixed(0)} `;
      if (spireTip){
        const midx = x + w*0.5;
        d += `L ${midx.toFixed(0)} ${(topY-30).toFixed(0)} L ${(x+w).toFixed(0)} ${baseY.toFixed(0)} `;
      } else {
        d += `L ${x.toFixed(0)} ${topY.toFixed(0)} L ${(x+w).toFixed(0)} ${topY.toFixed(0)} L ${(x+w).toFixed(0)} ${baseY.toFixed(0)} `;
      }
      x += w + rnd()*8;
    }
    d += `L 1230 750 Z`;
    return `<path d="${d}" fill="${color}"/>`;
  }

  function toRoman(num){
    const map = [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let res = '';
    for (const [v,s] of map){ while(num>=v){ res+=s; num-=v; } }
    return res;
  }

  // ---------- Library (albums grid) ----------

  function renderLibrary(){
    albumGrid.innerHTML = '';
    albumGrid.appendChild(makeAlbumCard('All Songs', songs.map(s => s.id), true));
    albumOrder.forEach(name => {
      albumGrid.appendChild(makeAlbumCard(name, albumMap.get(name), false));
    });
    renderSongList();
  }

  function renderSongList(){
    songListView.innerHTML = '';
    songs.forEach(song => {
      const row = document.createElement('div');
      row.className = 'song-row';
      row.tabIndex = 0;
      row.innerHTML = `
        <div class="song-row-main">
          <div class="song-row-title">${song.title}</div>
          <div class="song-row-artist">${song.artist}</div>
        </div>
        <div class="song-row-album">${Array.isArray(song.album) ? song.album.join(' / ') : song.album}</div>
        ${song.uploaded ? '<button class="song-row-delete" title="Remove from library" aria-label="Remove from library">✕</button>' : ''}
      `;
      const open = () => openSong(song.id);
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
      if (song.uploaded){
        row.querySelector('.song-row-delete').addEventListener('click', e => {
          e.stopPropagation();
          removeUpload(song);
        });
      }
      songListView.appendChild(row);
    });
  }

  function openSong(songId){
    queue = songs.map(s => s.id);
    pos = queue.indexOf(songId);
    renderVisual(getSong(queue[pos]));
    loadCurrentTrack(false);
    renderAll();
    showPlayer();
    setPlaying(true);
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.tab === 'albums'){
      albumGrid.classList.remove('hidden');
      songListView.classList.add('hidden');
    } else {
      albumGrid.classList.add('hidden');
      songListView.classList.remove('hidden');
    }
  }));

  function makeAlbumCard(name, ids, isAll){
    const card = document.createElement('div');
    card.className = 'album-card' + (isAll ? ' all-songs' : '');
    card.tabIndex = 0;

    const seed = isAll ? hashStr('ALL_SONGS_AETHER') : hashStr(name);
    const uid = 'lib' + Math.abs(seed) + (isAll ? 'a' : '');

    card.innerHTML = `
      <div class="album-thumb">
        <svg viewBox="0 0 1200 750" preserveAspectRatio="xMidYMid slice"></svg>
        <img alt="" style="display:none;">
        <div class="thumb-scrim"></div>
        <div class="play-overlay"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7z"/></svg></div>
      </div>
      <div class="album-info">
        <div class="album-name">${name}</div>
        <div class="album-count">${ids.length} ${ids.length===1?'song':'songs'}</div>
      </div>`;

    const thumbSvg = card.querySelector('.album-thumb svg');
    const thumbImg = card.querySelector('.album-thumb img');
    const coverUrl = albumCovers[name];
    if (coverUrl){
      thumbImg.src = coverUrl;
      thumbImg.style.display = 'block';
      thumbImg.onerror = () => {
        // cover image failed to load — fall back to generated art
        thumbImg.style.display = 'none';
        thumbSvg.innerHTML = landscapeMarkup(seed, uid);
      };
    } else {
      thumbSvg.innerHTML = landscapeMarkup(seed, uid);
    }

    const open = () => openAlbum(ids);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    return card;
  }

  function openAlbum(ids){
    queue = ids.slice();
    pos = 0;
    renderVisual(getSong(queue[pos]));
    loadCurrentTrack(false);
    renderAll();
    showPlayer();
    setPlaying(true);
  }

  function showPlayer(){
    libraryView.classList.add('hidden');
    playerView.classList.remove('hidden');
  }
  function showLibrary(){
    setPlaying(false);
    playerView.classList.add('hidden');
    libraryView.classList.remove('hidden');
  }
  backBtn.addEventListener('click', showLibrary);
  lyricsToggleBtn.addEventListener('click', () => lyricsPanel.classList.toggle('open'));

  // ---------- Uploads (your own songs, stored in this browser only) ----------
  // Uploaded audio/cover files are kept as Blobs in IndexedDB (localStorage
  // can't hold binary files) so they survive page reloads without ever
  // leaving this browser.

  const UPLOAD_DB_NAME = 'aether-library';
  const UPLOAD_STORE_NAME = 'uploads';

  function openUploadsDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(UPLOAD_DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(UPLOAD_STORE_NAME, { keyPath: 'dbKey', autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllUploadRecords(){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(UPLOAD_STORE_NAME, 'readonly').objectStore(UPLOAD_STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function addUploadRecord(record){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(UPLOAD_STORE_NAME, 'readwrite').objectStore(UPLOAD_STORE_NAME).add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteUploadRecord(dbKey){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(UPLOAD_STORE_NAME, 'readwrite').objectStore(UPLOAD_STORE_NAME).delete(dbKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  function makeUploadedSong(record){
    return {
      id: 'up-' + record.dbKey,
      dbKey: record.dbKey,
      url: URL.createObjectURL(record.audioBlob),
      image: record.imageBlob ? URL.createObjectURL(record.imageBlob) : null,
      album: record.album || 'Uploads',
      lyrics: record.lyrics || '',
      title: record.title,
      artist: record.artist,
      dur: null,
      uploaded: true
    };
  }

  async function loadUploadsFromDB(){
    let records = [];
    try {
      records = await getAllUploadRecords();
    } catch(e){ /* IndexedDB unavailable — app still works with the base library */ }
    uploadedSongs = records.map(makeUploadedSong);
    rebuildSongs();
    renderLibrary();
  }

  function fmtBytes(n){
    if (n < 1024*1024) return (n/1024).toFixed(0) + ' KB';
    if (n < 1024*1024*1024) return (n/(1024*1024)).toFixed(0) + ' MB';
    return (n/(1024*1024*1024)).toFixed(1) + ' GB';
  }

  async function renderStorageUsage(){
    if (!navigator.storage || !navigator.storage.estimate){
      uploadStorageEl.textContent = '';
      return;
    }
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const pct = quota ? Math.round((usage / quota) * 100) : 0;
      uploadStorageEl.textContent = `${fmtBytes(usage)} used of ~${fmtBytes(quota)} available in this browser (${pct}%)`;
      uploadStorageEl.classList.toggle('warn', pct >= 80);
    } catch(e){
      uploadStorageEl.textContent = '';
    }
  }

  let uploadMode = 'one';

  function setUploadMode(mode){
    uploadMode = mode;
    uploadModeOneBtn.classList.toggle('active', mode === 'one');
    uploadModeManyBtn.classList.toggle('active', mode === 'many');
    uploadOneFields.classList.toggle('hidden', mode !== 'one');
    uploadManyFields.classList.toggle('hidden', mode !== 'many');
    uploadSaveBtn.textContent = mode === 'many' ? 'Add All to Library' : 'Add to Library';
  }

  function openUploadPanel(){
    const suggestions = albumOrder
      .filter(name => name !== 'Uploads')
      .map(name => `<option value="${name}"></option>`)
      .join('');
    albumSuggestions.innerHTML = suggestions;
    setUploadMode('one');
    uploadOverlay.classList.remove('hidden');
    uploadTitleInput.focus();
    renderStorageUsage();
  }

  function closeUploadPanel(){
    uploadOverlay.classList.add('hidden');
    uploadAudioInput.value = '';
    uploadImageInput.value = '';
    uploadTitleInput.value = '';
    uploadArtistInput.value = '';
    uploadAlbumInput.value = '';
    uploadBulkAudioInput.value = '';
    uploadBulkImageInput.value = '';
    uploadBulkAlbumInput.value = '';
    uploadBulkPreview.innerHTML = '';
    uploadProgress.textContent = '';
  }

  addMusicBtn.addEventListener('click', openUploadPanel);
  uploadCloseBtn.addEventListener('click', closeUploadPanel);
  uploadOverlay.addEventListener('click', e => { if (e.target === uploadOverlay) closeUploadPanel(); });
  uploadModeOneBtn.addEventListener('click', () => setUploadMode('one'));
  uploadModeManyBtn.addEventListener('click', () => setUploadMode('many'));

  uploadAudioInput.addEventListener('change', () => {
    const file = uploadAudioInput.files[0];
    if (!file) return;
    const parsed = parseFilename(file.name);
    if (!uploadTitleInput.value.trim()) uploadTitleInput.value = parsed.title;
    if (!uploadArtistInput.value.trim()) uploadArtistInput.value = parsed.artist;
  });

  // Best-effort cover matching for bulk imports: normalize both the parsed
  // song title and each candidate image's filename (strip extension,
  // lowercase, drop punctuation) and look for an exact or containing match.
  // Covers are commonly reused across several songs (whole albums sharing
  // one image), so a single image file may legitimately match many songs.
  function normalizeName(s){
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function matchImageForTitle(title, imageFiles){
    const normTitle = normalizeName(title);
    if (!normTitle) return null;
    let best = null, bestLen = 0;
    for (const img of imageFiles){
      const base = normalizeName(img.name.replace(/\.[^/.]+$/, ''));
      if (!base) continue;
      if (base === normTitle) return img;
      if ((normTitle.includes(base) || base.includes(normTitle)) && base.length > bestLen){
        best = img;
        bestLen = base.length;
      }
    }
    return best;
  }

  function renderBulkPreview(){
    const audioFiles = Array.from(uploadBulkAudioInput.files);
    if (!audioFiles.length){ uploadBulkPreview.innerHTML = ''; return; }
    const imageFiles = Array.from(uploadBulkImageInput.files);
    uploadBulkPreview.innerHTML = audioFiles.map(f => {
      const parsed = parseFilename(f.name);
      const image = matchImageForTitle(parsed.title, imageFiles);
      return `<div class="upload-bulk-row">
        <span class="upload-bulk-title">${parsed.title}</span>
        <span class="upload-bulk-sub">${parsed.artist} · ${image ? 'cover: ' + image.name : 'no cover match'}</span>
      </div>`;
    }).join('');
  }
  uploadBulkAudioInput.addEventListener('change', renderBulkPreview);
  uploadBulkImageInput.addEventListener('change', renderBulkPreview);

  async function handleSingleSave(){
    const audioFile = uploadAudioInput.files[0];
    if (!audioFile){
      alert('Choose an audio file first.');
      return;
    }
    const imageFile = uploadImageInput.files[0] || null;
    const parsed = parseFilename(audioFile.name);
    const record = {
      title: uploadTitleInput.value.trim() || parsed.title,
      artist: uploadArtistInput.value.trim() || parsed.artist,
      album: uploadAlbumInput.value.trim() || 'Uploads',
      lyrics: '',
      audioBlob: audioFile,
      imageBlob: imageFile,
      addedAt: Date.now()
    };
    try {
      const dbKey = await addUploadRecord(record);
      uploadedSongs.push(makeUploadedSong({ ...record, dbKey }));
      rebuildSongs();
      renderLibrary();
      closeUploadPanel();
    } catch(e){
      if (e && e.name === 'QuotaExceededError'){
        alert('Your browser\'s storage is full. Remove an older upload (in the All Songs tab) or free up disk space, then try again.');
      } else {
        alert('Could not save that file in this browser: ' + (e && e.message ? e.message : 'unknown error'));
      }
    }
  }

  async function handleBulkSave(){
    const audioFiles = Array.from(uploadBulkAudioInput.files);
    if (!audioFiles.length){
      alert('Choose at least one audio file.');
      return;
    }
    const imageFiles = Array.from(uploadBulkImageInput.files);
    const album = uploadBulkAlbumInput.value.trim() || 'Uploads';
    let added = 0;
    for (const audioFile of audioFiles){
      const parsed = parseFilename(audioFile.name);
      const record = {
        title: parsed.title,
        artist: parsed.artist,
        album,
        lyrics: '',
        audioBlob: audioFile,
        imageBlob: matchImageForTitle(parsed.title, imageFiles),
        addedAt: Date.now()
      };
      uploadProgress.textContent = `Adding ${added + 1} of ${audioFiles.length}…`;
      try {
        const dbKey = await addUploadRecord(record);
        uploadedSongs.push(makeUploadedSong({ ...record, dbKey }));
        added++;
      } catch(e){
        rebuildSongs();
        renderLibrary();
        uploadProgress.textContent = '';
        const reason = (e && e.name === 'QuotaExceededError')
          ? 'ran out of browser storage'
          : `hit an error (${e && e.message ? e.message : 'unknown'})`;
        alert(`Added ${added} of ${audioFiles.length} songs before this ${reason}. Remove some older uploads to free up room, then add the rest.`);
        return;
      }
    }
    rebuildSongs();
    renderLibrary();
    uploadProgress.textContent = '';
    closeUploadPanel();
  }

  uploadSaveBtn.addEventListener('click', async () => {
    uploadSaveBtn.disabled = true;
    try {
      if (uploadMode === 'many') await handleBulkSave();
      else await handleSingleSave();
    } finally {
      uploadSaveBtn.disabled = false;
    }
  });

  async function removeUpload(song){
    if (!confirm(`Remove "${song.title}" from your library?`)) return;
    const wasPlayingThisSong = !playerView.classList.contains('hidden') && queue[pos] === song.id;
    try {
      await deleteUploadRecord(song.dbKey);
    } catch(e){
      alert('Could not remove that song.');
      return;
    }
    URL.revokeObjectURL(song.url);
    if (song.image) URL.revokeObjectURL(song.image);
    uploadedSongs = uploadedSongs.filter(s => s.id !== song.id);
    rebuildSongs();
    if (wasPlayingThisSong) showLibrary();
    renderLibrary();
  }

  // ---------- Player ----------

  function renderQueueList(){
    queueList.innerHTML = '';
    const count = Math.min(4, queue.length - 1);
    for (let i=1;i<=count;i++){
      const songId = queue[(pos+i) % queue.length];
      const song = getSong(songId);
      const li = document.createElement('li');
      li.className = 'entering';
      li.tabIndex = 0;
      li.innerHTML = `<span class="roman">${toRoman(i)}</span>
        <span class="meta">
          <div class="qtitle">${song.title}</div>
          <div class="qartist">${song.artist}</div>
        </span>`;
      const targetPos = (pos+i) % queue.length;
      li.addEventListener('click', () => jumpTo(targetPos));
      li.addEventListener('keydown', e => { if (e.key==='Enter') jumpTo(targetPos); });
      queueList.appendChild(li);
      requestAnimationFrame(() => li.classList.remove('entering'));
    }
  }

  function renderNowPlaying(){
    const song = getSong(queue[pos]);
    trackTitle.textContent = song.title;
    trackArtist.textContent = song.artist;
    albumTag.textContent = Array.isArray(song.album) ? song.album.join(' / ') : song.album;
    totalTimeEl.textContent = fmt(song.dur);
    curTimeEl.textContent = fmt(audio.currentTime);
    const pct = song.dur ? (audio.currentTime / song.dur) * 100 : 0;
    progressFill.style.width = pct + '%';
    likeBtn.classList.toggle('active', liked.has(song.id));
    addBtn.classList.toggle('active', added.has(song.id));
  }

  function renderVisual(song){
    if (song.image){
      svg.style.display = 'none';
      landscapeImg.style.display = 'block';
      landscapeImg.src = song.image;
      landscapeImg.onerror = () => {
        // image failed to load — fall back to generated art instead of a broken image
        landscapeImg.style.display = 'none';
        svg.style.display = 'block';
        buildLandscape(song.id);
      };
    } else {
      landscapeImg.style.display = 'none';
      svg.style.display = 'block';
      buildLandscape(song.id);
    }
  }

  function crossfadeVisual(){
    artLayer.classList.add('fading');
    setTimeout(() => {
      renderVisual(getSong(queue[pos]));
      artLayer.classList.remove('fading');
    }, 260);
  }

  function renderLyrics(song){
    exitLyricsEdit();
    if (song.lyrics && song.lyrics.trim()){
      lyricsText.textContent = song.lyrics;
      lyricsText.classList.remove('empty');
    } else {
      lyricsText.textContent = 'No lyrics added yet.';
      lyricsText.classList.add('empty');
    }
    lyricsPanel.scrollTop = 0;
  }

  function enterLyricsEdit(){
    const song = getSong(queue[pos]);
    lyricsEditor.value = song.lyrics || '';
    lyricsText.classList.add('hidden');
    lyricsEditBtn.classList.add('hidden');
    lyricsEditor.classList.remove('hidden');
    lyricsEditActions.classList.remove('hidden');
    lyricsEditor.focus();
  }

  function exitLyricsEdit(){
    lyricsEditor.classList.add('hidden');
    lyricsEditActions.classList.add('hidden');
    lyricsText.classList.remove('hidden');
    lyricsEditBtn.classList.remove('hidden');
  }

  lyricsEditBtn.addEventListener('click', enterLyricsEdit);
  lyricsCancelBtn.addEventListener('click', exitLyricsEdit);
  lyricsSaveBtn.addEventListener('click', () => {
    const song = getSong(queue[pos]);
    song.lyrics = lyricsEditor.value;
    try { localStorage.setItem(LYRICS_KEY_PREFIX + song.id, song.lyrics); } catch(e){}
    exitLyricsEdit();
    if (song.lyrics && song.lyrics.trim()){
      lyricsText.textContent = song.lyrics;
      lyricsText.classList.remove('empty');
    } else {
      lyricsText.textContent = 'No lyrics added yet.';
      lyricsText.classList.add('empty');
    }
  });

  function loadCurrentTrack(autoplay){
    const song = getSong(queue[pos]);
    renderLyrics(song);
    audio.src = song.url;
    audio.currentTime = 0;
    audio.onloadedmetadata = () => {
      song.dur = audio.duration;
      renderNowPlaying();
    };
    audio.onerror = () => {
      trackTitle.textContent = song.title + ' (could not load audio)';
    };
    if (autoplay) audio.play().catch(()=>{});
  }

  function renderAll(){
    renderNowPlaying();
    renderQueueList();
  }

  function jumpTo(newPos){
    pos = newPos;
    crossfadeVisual();
    loadCurrentTrack(playing);
    renderAll();
  }

  function goNext(){
    pos = (pos+1) % queue.length;
    crossfadeVisual();
    loadCurrentTrack(playing);
    renderAll();
  }
  function goPrev(){
    if (audio.currentTime > 3){
      audio.currentTime = 0;
      renderNowPlaying();
      return;
    }
    pos = (pos-1+queue.length) % queue.length;
    crossfadeVisual();
    loadCurrentTrack(playing);
    renderAll();
  }

  function setPlaying(v){
    playing = v;
    playIcon.innerHTML = playing
      ? `<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>`
      : `<path d="M7 5l13 7-13 7z"/>`;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playBtn.title = playing ? 'Pause' : 'Play';
    if (playing){
      audio.play().catch(()=>{});
    } else {
      audio.pause();
    }
  }

  audio.addEventListener('timeupdate', renderNowPlaying);
  audio.addEventListener('ended', goNext);

  playBtn.addEventListener('click', () => setPlaying(!playing));
  document.getElementById('nextBtn').addEventListener('click', goNext);
  document.getElementById('prevBtn').addEventListener('click', goPrev);

  likeBtn.addEventListener('click', () => {
    const id = getSong(queue[pos]).id;
    liked.has(id) ? liked.delete(id) : liked.add(id);
    renderNowPlaying();
  });
  addBtn.addEventListener('click', () => {
    const id = getSong(queue[pos]).id;
    added.has(id) ? added.delete(id) : added.add(id);
    renderNowPlaying();
  });

  shuffleBtn.addEventListener('click', () => {
    const currentId = queue[pos];
    const rest = queue.filter((_, i) => i !== pos);
    for (let i = rest.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    queue = [currentId, ...rest];
    pos = 0;
    shuffleBtn.classList.add('active');
    setTimeout(() => shuffleBtn.classList.remove('active'), 900);
    renderQueueList();
  });

  progressTrack.addEventListener('click', (e) => {
    const song = getSong(queue[pos]);
    if (!song.dur) return;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = song.dur * ratio;
    renderNowPlaying();
  });

  // init — start on the albums library, don't load/play audio until a card is chosen
  renderLibrary();
  loadUploadsFromDB();
})();