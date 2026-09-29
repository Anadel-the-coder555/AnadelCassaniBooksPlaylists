(function(){
  // ---- PASTE YOUR TRACKS HERE ----
  // audio: your song file (local relative path, or a Dropbox ?dl=1 link).
  // image: optional. Leave it out (or set to null) to fall back to the generated landscape art.
  // album: which album this track belongs to. Leave it out (or set to null) and it will
  //        land in a "Singles" catch-all album so nothing gets lost.
    const trackData = [
  ];

  function parseFilename(url){
    try {
      const clean = url.split('?')[0];
      const raw = decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1));
      const noExt = raw.replace(/\.[^/.]+$/, '');
      return { title: titleCase(noExt) };
    } catch(e){
      return { title: url };
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
    return { id:i, url:t.audio, image:t.image || null, album: t.album || 'Instrumentals', title:meta.title, dur:null, uploaded:false, addedAt: t.addedAt || 0, holiday: !!t.holiday };
  });

  // "Recently Added" and "Holiday" are computed automatically (see
  // getRecentlyAddedIds/getHolidayIds below) rather than grouped by the
  // song.album field, so these names are reserved and never double as a
  // regular user-named album.
  const RESERVED_ALBUM_NAMES = new Set(['Recently Added', 'Holiday']);
  const RECENTLY_ADDED_COUNT = 20;

  function getRecentlyAddedIds(limit){
    return songs
      .filter(s => !s.holiday)
      .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
      .slice(0, limit)
      .map(s => s.id);
  }

  function getHolidayIds(){
    return songs.filter(s => s.holiday).map(s => s.id);
  }

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

  const addMusicBtn = document.getElementById('addMusicBtn');
  const uploadOverlay = document.getElementById('uploadOverlay');
  const uploadCloseBtn = document.getElementById('uploadCloseBtn');
  const uploadAudioInput = document.getElementById('uploadAudioInput');
  const uploadImageInput = document.getElementById('uploadImageInput');
  const uploadTitleInput = document.getElementById('uploadTitleInput');
  const uploadAlbumInput = document.getElementById('uploadAlbumInput');
  const uploadHolidayInput = document.getElementById('uploadHolidayInput');
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
  const uploadBulkHolidayInput = document.getElementById('uploadBulkHolidayInput');
  const uploadBulkPreview = document.getElementById('uploadBulkPreview');
  const uploadProgress = document.getElementById('uploadProgress');

  const editSongOverlay = document.getElementById('editSongOverlay');
  const editSongCloseBtn = document.getElementById('editSongCloseBtn');
  const editSongImageInput = document.getElementById('editSongImageInput');
  const editSongCoverCurrent = document.getElementById('editSongCoverCurrent');
  const editSongRemoveCoverBtn = document.getElementById('editSongRemoveCoverBtn');
  const editSongTitleInput = document.getElementById('editSongTitleInput');
  const editSongAlbumInput = document.getElementById('editSongAlbumInput');
  const editSongHolidayInput = document.getElementById('editSongHolidayInput');
  const editSongSaveBtn = document.getElementById('editSongSaveBtn');
  const editSongProgress = document.getElementById('editSongProgress');

  const playerCarouselStage = document.getElementById('playerCarouselStage');
  const trackTitle = document.getElementById('trackTitle');
  const albumChipSvg = document.getElementById('albumChipSvg');
  const albumChipImg = document.getElementById('albumChipImg');
  const albumTag = document.getElementById('albumTag');
  const albumChip = document.getElementById('albumChip');
  const progressRow = document.getElementById('progressRow');
  const progressFill = document.getElementById('progressFill');
  const progressTrack = document.getElementById('progressTrack');
  const curTimeEl = document.getElementById('curTime');
  const totalTimeEl = document.getElementById('totalTime');
  const likeBtn = document.getElementById('likeBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');

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

  // ---------- Library (albums grid) ----------

  function renderLibrary(){
    albumGrid.innerHTML = '';
    albumGrid.appendChild(makeAlbumCard('All Songs', songs.map(s => s.id), true));

    const recentIds = getRecentlyAddedIds(RECENTLY_ADDED_COUNT);
    if (recentIds.length) albumGrid.appendChild(makeAlbumCard('Recently Added', recentIds, false));

    const holidayIds = getHolidayIds();
    if (holidayIds.length) albumGrid.appendChild(makeAlbumCard('Holiday', holidayIds, false));

    albumOrder.filter(name => !RESERVED_ALBUM_NAMES.has(name)).forEach(name => {
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
        </div>
        <div class="song-row-album">${Array.isArray(song.album) ? song.album.join(' / ') : song.album}</div>
        ${song.uploaded ? `<div class="song-row-actions">
          <button class="song-row-icon-btn song-row-edit" title="Edit song" aria-label="Edit song">✎</button>
          <button class="song-row-icon-btn song-row-delete" title="Remove from library" aria-label="Remove from library">✕</button>
        </div>` : ''}
      `;
      const open = () => openSong(song.id);
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
      if (song.uploaded){
        row.querySelector('.song-row-edit').addEventListener('click', e => {
          e.stopPropagation();
          openEditSongPanel(song);
        });
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
    // showPlayer() must run before renderAll(): renderAll measures the album
    // chip's rendered width to inset the progress bar, and that measurement
    // comes back 0 (permanently, since it's only recomputed when the album
    // changes) if the player is still display:none at that point.
    showPlayer();
    loadCurrentTrack(false);
    renderAll();
    setPlaying(true);
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    albumGrid.classList.toggle('hidden', tab !== 'albums');
    songListView.classList.toggle('hidden', tab !== 'songs');
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
    const coverUrl = isAll ? null : (albumCoverOverrides.get(name) || albumCovers[name]);
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

    if (!isAll){
      const hasOverride = albumCoverOverrides.has(name);
      const thumb = card.querySelector('.album-thumb');
      const actionsHtml = document.createElement('div');
      actionsHtml.innerHTML = `
        <button class="album-edit-btn" title="Change album picture" aria-label="Change album picture">✎</button>
        ${hasOverride ? '<button class="album-revert-btn" title="Remove custom picture" aria-label="Remove custom picture">↺</button>' : ''}
        <input type="file" accept="image/*" class="album-cover-input hidden">
      `;
      while (actionsHtml.firstChild) thumb.appendChild(actionsHtml.firstChild);

      const coverInput = thumb.querySelector('.album-cover-input');
      // input.click() below dispatches its own bubbling click event (a
      // separate event object from the one on the edit button), which would
      // otherwise reach the card's "open album" listener and start playback.
      coverInput.addEventListener('click', e => e.stopPropagation());
      thumb.querySelector('.album-edit-btn').addEventListener('click', e => {
        e.stopPropagation();
        coverInput.click();
      });
      coverInput.addEventListener('change', async () => {
        const file = coverInput.files[0];
        if (!file) return;
        try {
          await putAlbumCoverRecord(name, file);
          const old = albumCoverOverrides.get(name);
          if (old) URL.revokeObjectURL(old);
          albumCoverOverrides.set(name, URL.createObjectURL(file));
          renderLibrary();
        } catch(e){
          alert('Could not save that picture: ' + (e && e.message ? e.message : 'unknown error'));
        }
      });
      const revertBtn = thumb.querySelector('.album-revert-btn');
      if (revertBtn){
        revertBtn.addEventListener('click', async e => {
          e.stopPropagation();
          try {
            await deleteAlbumCoverRecord(name);
            const old = albumCoverOverrides.get(name);
            if (old) URL.revokeObjectURL(old);
            albumCoverOverrides.delete(name);
            renderLibrary();
          } catch(e){
            alert('Could not remove that picture.');
          }
        });
      }
    }

    const open = () => openAlbum(ids);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    return card;
  }

  function openAlbum(ids){
    queue = ids.slice();
    pos = 0;
    showPlayer();
    loadCurrentTrack(false);
    renderAll();
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

  // ---------- Uploads (your own songs, stored in this browser only) ----------
  // Uploaded audio/cover files are kept as Blobs in IndexedDB (localStorage
  // can't hold binary files) so they survive page reloads without ever
  // leaving this browser.

  // Named for this specific project, not a generic "aether-library" — IndexedDB
  // is scoped per browser origin (protocol+host+port), so a local dev server
  // port reused across several unrelated projects makes them all the SAME
  // origin as far as storage is concerned. A generic DB name is one more thing
  // that could collide if another project happens to share that boilerplate;
  // LEGACY_UPLOAD_DB_NAME is checked once (see migrateLegacyStorageIfNeeded)
  // so upload data saved under the old name isn't silently orphaned.
  const UPLOAD_DB_NAME = 'anadel-books-playlist-library';
  const LEGACY_UPLOAD_DB_NAME = 'aether-library';
  const UPLOAD_STORE_NAME = 'uploads';
  const ALBUM_COVER_STORE_NAME = 'albumCovers';
  const DB_VERSION = 2;

  function openUploadsDB(dbName){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName || UPLOAD_DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(UPLOAD_STORE_NAME)){
          db.createObjectStore(UPLOAD_STORE_NAME, { keyPath: 'dbKey', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(ALBUM_COVER_STORE_NAME)){
          db.createObjectStore(ALBUM_COVER_STORE_NAME, { keyPath: 'name' });
        }
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

  async function getAllRecordsFrom(dbName, storeName){
    const db = await openUploadsDB(dbName);
    return new Promise((resolve, reject) => {
      const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // One-time safety net for the UPLOAD_DB_NAME rename above: if this origin
  // still has data sitting under the old database name (nothing has read it
  // since the rename), copy it into the current one instead of leaving it
  // orphaned. No-ops instantly once the current DB already has uploads, and
  // silently does nothing if the legacy DB never existed on this browser.
  async function migrateLegacyStorageIfNeeded(){
    try {
      const current = await getAllUploadRecords();
      if (current.length) return;
      // indexedDB.open() creates a database as a side effect if the name
      // doesn't exist yet, which would otherwise leave an empty
      // "aether-library" shell behind on every origin that never had one —
      // checking databases() first (where supported) avoids that entirely.
      if (indexedDB.databases){
        const existing = await indexedDB.databases();
        if (!existing.some(d => d.name === LEGACY_UPLOAD_DB_NAME)) return;
      }
      const legacyUploads = await getAllRecordsFrom(LEGACY_UPLOAD_DB_NAME, UPLOAD_STORE_NAME);
      if (legacyUploads.length){
        const db = await openUploadsDB();
        const store = db.transaction(UPLOAD_STORE_NAME, 'readwrite').objectStore(UPLOAD_STORE_NAME);
        legacyUploads.forEach(r => {
          const copy = Object.assign({}, r);
          delete copy.dbKey; // let the new store assign fresh auto-increment keys
          store.add(copy);
        });
      }
      const legacyCovers = await getAllRecordsFrom(LEGACY_UPLOAD_DB_NAME, ALBUM_COVER_STORE_NAME);
      if (legacyCovers.length){
        const db = await openUploadsDB();
        const store = db.transaction(ALBUM_COVER_STORE_NAME, 'readwrite').objectStore(ALBUM_COVER_STORE_NAME);
        legacyCovers.forEach(r => store.put(r));
      }
    } catch(e){ /* legacy DB doesn't exist on this browser — nothing to migrate */ }
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

  // Merges `updates` (title/album/imageBlob) into an existing upload
  // record and persists it, so edits made after the initial upload stick.
  async function updateUploadRecord(dbKey, updates){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const store = db.transaction(UPLOAD_STORE_NAME, 'readwrite').objectStore(UPLOAD_STORE_NAME);
      const getReq = store.get(dbKey);
      getReq.onsuccess = () => {
        const record = getReq.result;
        if (!record){ reject(new Error('Song not found')); return; }
        Object.assign(record, updates);
        const putReq = store.put(record);
        putReq.onsuccess = () => resolve(record);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function getAllAlbumCoverRecords(){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(ALBUM_COVER_STORE_NAME, 'readonly').objectStore(ALBUM_COVER_STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function putAlbumCoverRecord(name, blob){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(ALBUM_COVER_STORE_NAME, 'readwrite').objectStore(ALBUM_COVER_STORE_NAME).put({ name, imageBlob: blob });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteAlbumCoverRecord(name){
    const db = await openUploadsDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(ALBUM_COVER_STORE_NAME, 'readwrite').objectStore(ALBUM_COVER_STORE_NAME).delete(name);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Custom album cover art, keyed by album name, layered on top of the
  // generated landscape art (and the static albumCovers map above).
  let albumCoverOverrides = new Map();

  async function loadAlbumCoversFromDB(){
    let records = [];
    try { records = await getAllAlbumCoverRecords(); } catch(e){ /* IndexedDB unavailable */ }
    albumCoverOverrides = new Map(records.map(r => [r.name, URL.createObjectURL(r.imageBlob)]));
    renderLibrary();
  }

  function makeUploadedSong(record){
    return {
      id: 'up-' + record.dbKey,
      dbKey: record.dbKey,
      url: URL.createObjectURL(record.audioBlob),
      image: record.imageBlob ? URL.createObjectURL(record.imageBlob) : null,
      album: record.album || 'Uploads',
      title: record.title,
      dur: null,
      uploaded: true,
      addedAt: record.addedAt || 0,
      holiday: !!record.holiday
    };
  }

  async function loadUploadsFromDB(){
    let records = [];
    try {
      await migrateLegacyStorageIfNeeded();
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
      .filter(name => name !== 'Uploads' && !RESERVED_ALBUM_NAMES.has(name))
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
    uploadAlbumInput.value = '';
    uploadHolidayInput.checked = false;
    uploadBulkAudioInput.value = '';
    uploadBulkImageInput.value = '';
    uploadBulkAlbumInput.value = '';
    uploadBulkHolidayInput.checked = false;
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
        <span class="upload-bulk-sub">${image ? 'cover: ' + image.name : 'no cover match'}</span>
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
      album: uploadAlbumInput.value.trim() || 'Uploads',
      audioBlob: audioFile,
      imageBlob: imageFile,
      addedAt: Date.now(),
      holiday: uploadHolidayInput.checked
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
        album,
        audioBlob: audioFile,
        imageBlob: matchImageForTitle(parsed.title, imageFiles),
        addedAt: Date.now(),
        holiday: uploadBulkHolidayInput.checked
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

  // ---------- Editing an uploaded song's details/picture ----------

  let editingSongId = null;
  let editSongRemoveCoverFlag = false;

  function openEditSongPanel(song){
    if (!song || !song.uploaded) return;
    editingSongId = song.id;
    editSongRemoveCoverFlag = false;
    editSongImageInput.value = '';
    editSongTitleInput.value = song.title;
    editSongAlbumInput.value = Array.isArray(song.album) ? song.album.join(', ') : song.album;
    editSongCoverCurrent.classList.toggle('hidden', !song.image);
    editSongHolidayInput.checked = !!song.holiday;
    const suggestions = albumOrder
      .filter(name => name !== 'Uploads' && !RESERVED_ALBUM_NAMES.has(name))
      .map(name => `<option value="${name}"></option>`)
      .join('');
    albumSuggestions.innerHTML = suggestions;
    editSongOverlay.classList.remove('hidden');
    editSongTitleInput.focus();
  }

  function closeEditSongPanel(){
    editSongOverlay.classList.add('hidden');
    editingSongId = null;
    editSongProgress.textContent = '';
  }

  editSongCloseBtn.addEventListener('click', closeEditSongPanel);
  editSongOverlay.addEventListener('click', e => { if (e.target === editSongOverlay) closeEditSongPanel(); });

  editSongRemoveCoverBtn.addEventListener('click', () => {
    editSongRemoveCoverFlag = true;
    editSongImageInput.value = '';
    editSongCoverCurrent.classList.add('hidden');
  });
  editSongImageInput.addEventListener('change', () => {
    if (editSongImageInput.files[0]) editSongRemoveCoverFlag = false;
  });

  editSongSaveBtn.addEventListener('click', async () => {
    const song = getSong(editingSongId);
    if (!song) return;
    editSongSaveBtn.disabled = true;
    editSongProgress.textContent = 'Saving…';
    try {
      const updates = {
        title: editSongTitleInput.value.trim() || song.title,
        album: editSongAlbumInput.value.trim() || 'Uploads',
        holiday: editSongHolidayInput.checked,
      };
      const newImageFile = editSongImageInput.files[0];
      if (newImageFile) updates.imageBlob = newImageFile;
      else if (editSongRemoveCoverFlag) updates.imageBlob = null;

      const record = await updateUploadRecord(song.dbKey, updates);
      if (song.image) URL.revokeObjectURL(song.image);
      song.title = record.title;
      song.album = record.album;
      song.holiday = !!record.holiday;
      song.image = record.imageBlob ? URL.createObjectURL(record.imageBlob) : null;

      rebuildSongs();
      renderLibrary();
      if (!playerView.classList.contains('hidden') && queue[pos] === song.id){
        invalidatePlayerCarouselItem(song.id);
        renderAll();
      }
      closeEditSongPanel();
    } catch(e){
      alert('Could not save changes: ' + (e && e.message ? e.message : 'unknown error'));
    } finally {
      editSongSaveBtn.disabled = false;
      editSongProgress.textContent = '';
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

  // Cheap guard against reloading the album art on every timeupdate tick —
  // renderNowPlaying fires ~4x/sec while playing, but the chip's art only
  // ever needs to change when the song's (first) album actually changes.
  let lastAlbumChipKey = null;
  function renderAlbumChipArt(primaryAlbum){
    if (primaryAlbum === lastAlbumChipKey) return;
    lastAlbumChipKey = primaryAlbum;
    const seed = hashStr(String(primaryAlbum));
    const uid = 'achip' + Math.abs(seed);
    // An explicit album cover wins; otherwise fall back to the first song in
    // this album that has its own picture, same as the player carousel does,
    // so the chip still shows something meaningful for the common case where
    // no one ever set an album-level cover.
    const explicitCover = albumCoverOverrides.get(primaryAlbum) || albumCovers[primaryAlbum];
    const albumSongIds = albumMap.get(primaryAlbum) || [];
    const fallbackSong = albumSongIds.map(getSong).find(s => s && s.image);
    const coverUrl = explicitCover || (fallbackSong ? fallbackSong.image : null);
    if (coverUrl){
      albumChipSvg.style.display = 'none';
      albumChipImg.style.display = 'block';
      albumChipImg.src = coverUrl;
      albumChipImg.onerror = () => {
        albumChipImg.style.display = 'none';
        albumChipSvg.style.display = 'block';
        albumChipSvg.innerHTML = landscapeMarkup(seed, uid);
      };
    } else {
      albumChipImg.style.display = 'none';
      albumChipSvg.style.display = 'block';
      albumChipSvg.innerHTML = landscapeMarkup(seed, uid);
    }
    // The chip is absolutely positioned over the near-left corner of
    // now-playing so the title can stay centered regardless of its width, but
    // that means the progress row below needs its own left inset — sized to
    // the chip's actual rendered width (which varies with the album name) —
    // or the wide progress bar would run underneath it, right where curTime
    // renders. A CSS var (rather than setting margin-left directly) lets the
    // mobile layout's plain override win via source order, since that
    // breakpoint drops the chip back into normal flow above the title instead.
    progressRow.style.setProperty('--chip-inset', (albumChip.offsetWidth + 20) + 'px');
  }

  function renderNowPlaying(){
    const song = getSong(queue[pos]);
    trackTitle.textContent = song.title;
    const albumNames = Array.isArray(song.album) ? song.album : [song.album];
    albumTag.textContent = albumNames.join(' / ');
    renderAlbumChipArt(albumNames[0]);
    totalTimeEl.textContent = fmt(song.dur);
    curTimeEl.textContent = fmt(audio.currentTime);
    const pct = song.dur ? (audio.currentTime / song.dur) * 100 : 0;
    progressFill.style.width = pct + '%';
    likeBtn.classList.toggle('active', liked.has(song.id));
  }

  // ---------- Player carousel ----------
  // The carousel IS the player's main visual: each item is a song from the
  // current queue, and the whole player background follows whichever one is
  // centered (see applyPlayerBackground). Only a small window around `pos` is
  // ever built — the queue can be the entire library, and there's no reason
  // to load/sample images for songs that aren't within a step or two of view.

  const playerCarouselCache = new Map(); // song id -> DOM element
  const songPalette = new Map(); // song id -> { bg1, bg2, useDarkText }

  function getPlayerWindowIndices(){
    const n = queue.length;
    if (!n) return [];
    const span = Math.min(2, Math.floor((n - 1) / 2));
    const idxs = new Set();
    for (let d = -span; d <= span; d++) idxs.add(((pos + d) % n + n) % n);
    return Array.from(idxs);
  }

  // Blends a sampled color toward white for a soft pastel wash while keeping some of its hue.
  function mixToPastel([r, g, b], amt){
    const mr = Math.round(r + (255 - r) * amt);
    const mg = Math.round(g + (255 - g) * amt);
    const mb = Math.round(b + (255 - b) * amt);
    return `rgb(${mr}, ${mg}, ${mb})`;
  }

  // No picture to sample from — fall back to a moody dark gradient in the same
  // hue family as this song's generated skyline art, instead of a pastel one,
  // so the "no cover" case still matches the app's default dark theme.
  function setSongPaletteFromSeed(song){
    const seed = hashStr(String(song.id));
    const rnd = mulberry32(seed * 977 + 13);
    const hue = 250 + Math.floor(rnd() * 70);
    songPalette.set(song.id, {
      bg1: `hsl(${hue}, 30%, 15%)`,
      bg2: `hsl(${(hue + 300) % 360}, 24%, 8%)`,
      useDarkText: false
    });
    if (queue[pos] === song.id) applyPlayerBackground(song);
  }

  // Samples the loaded cover image on an offscreen canvas to pull its palette. Falls back
  // to setSongPaletteFromSeed if the image is a cross-origin file the canvas can't read
  // back (getImageData throws SecurityError).
  function updateSongPaletteFromImage(song, imgEl){
    try {
      const w = 28, h = 28;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let r = 0, g = 0, b = 0, count = 0;
      let bestSat = -1, sr = 0, sg = 0, sb = 0;
      for (let i = 0; i < data.length; i += 4){
        if (data[i + 3] < 128) continue;
        const rr = data[i], gg = data[i + 1], bb = data[i + 2];
        r += rr; g += gg; b += bb; count++;
        const mx = Math.max(rr, gg, bb), mn = Math.min(rr, gg, bb);
        const sat = mx === 0 ? 0 : (mx - mn) / mx;
        if (sat > bestSat && mx > 30){ bestSat = sat; sr = rr; sg = gg; sb = bb; }
      }
      if (!count) throw new Error('empty image sample');
      const avg = [r / count, g / count, b / count];
      const accent = bestSat >= 0 ? [sr, sg, sb] : avg;
      const luminance = (0.299 * avg[0] + 0.587 * avg[1] + 0.114 * avg[2]) / 255;
      songPalette.set(song.id, {
        bg1: mixToPastel(avg, 0.4),
        bg2: mixToPastel(accent, 0.5),
        useDarkText: luminance > 0.55
      });
    } catch(e){
      setSongPaletteFromSeed(song);
      return;
    }
    if (queue[pos] === song.id) applyPlayerBackground(song);
  }

  function applyPlayerBackground(song){
    const p = songPalette.get(song.id);
    if (!p) return;
    playerView.style.background = `linear-gradient(135deg, ${p.bg1}, ${p.bg2})`;
    // The wave's fill comes from these same two colors (see
    // .player-carousel-wave path in styles.css), not a generic theme accent —
    // that's what makes it actually follow the background's per-song palette
    // instead of just flipping between two fixed light/dark states.
    playerView.style.setProperty('--pl-wave-a', p.bg1);
    playerView.style.setProperty('--pl-wave-b', p.bg2);
    playerView.classList.toggle('light', p.useDarkText);
  }

  function buildPlayerCarouselItemEl(song, uidSuffix){
    const wrap = document.createElement('div');
    wrap.className = 'player-carousel-item';
    wrap.dataset.songId = String(song.id);
    wrap.innerHTML = `
      <div class="player-carousel-item-inner">
        <svg viewBox="0 0 1200 750" preserveAspectRatio="xMidYMid slice"></svg>
        <img alt="" style="display:none;">
        <div class="play-overlay"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7z"/></svg></div>
      </div>`;
    const svgEl = wrap.querySelector('svg');
    const imgEl = wrap.querySelector('img');
    const seed = hashStr(String(song.id));
    const uid = 'plr' + Math.abs(seed) + uidSuffix;
    if (song.image){
      imgEl.style.display = 'block';
      // Try CORS mode first so the canvas isn't tainted and the real palette can be
      // sampled; a host that doesn't send CORS headers (e.g. some Dropbox links)
      // fails to load in that mode, so retry once without it — the photo still has
      // to display even when we can't read its pixels back.
      imgEl.crossOrigin = 'anonymous';
      imgEl.onload = () => updateSongPaletteFromImage(song, imgEl);
      imgEl.onerror = () => {
        imgEl.crossOrigin = null;
        imgEl.onload = () => setSongPaletteFromSeed(song);
        imgEl.onerror = () => {
          imgEl.style.display = 'none';
          svgEl.innerHTML = landscapeMarkup(seed, uid);
          setSongPaletteFromSeed(song);
        };
        imgEl.src = song.image;
      };
      imgEl.src = song.image;
    } else {
      svgEl.innerHTML = landscapeMarkup(seed, uid);
      setSongPaletteFromSeed(song);
    }
    return wrap;
  }

  function positionPlayerCarouselItems(){
    const n = queue.length;
    if (!n) return;
    playerCarouselCache.forEach((el, songId) => {
      const idx = queue.indexOf(songId);
      if (idx === -1){ el.remove(); playerCarouselCache.delete(songId); return; }
      let d = idx - pos;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const abs = Math.abs(d);
      el.style.setProperty('--i', idx);
      el.classList.toggle('is-active', d === 0);
      // Only the active item plus its immediate neighbor on each side stay visible
      // (a 3-up coverflow) — anything further out is fully hidden and untargetable
      // so stray clicks/taps can't land on it.
      if (abs > 1){
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.transform = `translate(-50%,-50%) translateX(${d * 130}%) scale(0.5)`;
        el.style.zIndex = '0';
      } else {
        el.style.opacity = abs === 0 ? '1' : '0.55';
        el.style.pointerEvents = 'auto';
        const scale = abs === 0 ? 1 : 0.62;
        // With Up Next and Lyrics both gone, nothing else floats over the
        // carousel, so neighbors can peek all the way to the player's edges —
        // the cropped-at-the-edges coverflow look from the reference design.
        el.style.transform = `translate(-50%,-50%) translateX(${d * 62}%) scale(${scale})`;
        el.style.zIndex = String(10 - abs);
      }
    });
  }

  function renderPlayerCarousel(){
    if (!queue.length) return;
    const windowIdxs = getPlayerWindowIndices();
    const neededIds = new Set(windowIdxs.map(i => queue[i]));
    for (const [id, el] of playerCarouselCache){
      if (!neededIds.has(id)){ el.remove(); playerCarouselCache.delete(id); }
    }
    windowIdxs.forEach(i => {
      const id = queue[i];
      if (!playerCarouselCache.has(id)){
        const el = buildPlayerCarouselItemEl(getSong(id), i);
        playerCarouselCache.set(id, el);
        playerCarouselStage.appendChild(el);
      }
    });
    positionPlayerCarouselItems();
    const currentId = queue[pos];
    if (songPalette.has(currentId)) applyPlayerBackground(getSong(currentId));
  }

  // Used when a currently-playing song's cover image is changed via the edit
  // panel, so the carousel rebuilds that item with the new picture instead of
  // keeping the stale cached element.
  function invalidatePlayerCarouselItem(songId){
    const el = playerCarouselCache.get(songId);
    if (el){ el.remove(); playerCarouselCache.delete(songId); }
    songPalette.delete(songId);
  }

  // Drag-to-swipe and tap-to-select both live in these pointer handlers rather
  // than a separate 'click' listener per item: setPointerCapture (needed so a
  // swipe that starts on an image still tracks correctly) retargets the native
  // click event to playerCarouselStage itself, so per-item click handlers never
  // fire for real pointer input. A tap is just a drag whose distance stayed
  // under threshold.
  let playerDragging = false, playerDragStartX = 0, playerDragDeltaX = 0, playerPointerDownItem = null;
  playerCarouselStage.addEventListener('pointerdown', e => {
    playerDragging = true;
    playerDragStartX = e.clientX;
    playerDragDeltaX = 0;
    playerPointerDownItem = e.target.closest('.player-carousel-item');
    playerCarouselStage.setPointerCapture(e.pointerId);
    playerCarouselStage.classList.add('dragging');
  });
  playerCarouselStage.addEventListener('pointermove', e => {
    if (!playerDragging) return;
    playerDragDeltaX = e.clientX - playerDragStartX;
    playerCarouselStage.style.setProperty('--drag', playerDragDeltaX + 'px');
  });
  function endPlayerDrag(){
    if (!playerDragging) return;
    playerDragging = false;
    playerCarouselStage.classList.remove('dragging');
    playerCarouselStage.style.setProperty('--drag', '0px');
    const swipeThreshold = 50;
    const tapThreshold = 6;
    if (playerDragDeltaX > swipeThreshold) goPrev();
    else if (playerDragDeltaX < -swipeThreshold) goNext();
    else if (Math.abs(playerDragDeltaX) <= tapThreshold && playerPointerDownItem){
      const songId = playerPointerDownItem.dataset.songId;
      const idx = queue.findIndex(id => String(id) === songId);
      if (idx !== -1){
        if (idx === pos) setPlaying(!playing);
        else jumpTo(idx);
      }
    }
    playerDragDeltaX = 0;
    playerPointerDownItem = null;
  }
  playerCarouselStage.addEventListener('pointerup', endPlayerDrag);
  playerCarouselStage.addEventListener('pointercancel', endPlayerDrag);

  document.addEventListener('keydown', e => {
    if (playerView.classList.contains('hidden')) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
  });

  function loadCurrentTrack(autoplay){
    const song = getSong(queue[pos]);
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
    renderPlayerCarousel();
  }

  function jumpTo(newPos){
    pos = newPos;
    loadCurrentTrack(playing);
    renderAll();
  }

  function goNext(){
    pos = (pos+1) % queue.length;
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
    loadCurrentTrack(playing);
    renderAll();
  }

  // Play/pause and prev/next no longer have their own buttons — tapping the
  // centered carousel image toggles play/pause, and swiping/tapping a
  // peeking neighbor is prev/next — so this just drives the audio element.
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
    renderPlayerCarousel();
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
  loadAlbumCoversFromDB();

  // Best-effort request that the browser not evict this origin's storage
  // under disk pressure without asking first. Doesn't guarantee anything (the
  // browser can still say no, and it's a no-op in browsers that don't support
  // it), but it's a free extra layer against silently losing uploads.
  if (navigator.storage && navigator.storage.persist){
    navigator.storage.persist().catch(() => {});
  }
})();