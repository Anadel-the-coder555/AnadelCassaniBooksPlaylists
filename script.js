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
        { audio: "bookSongs/Forgotten Beginning - Hey I Can't Dance!.mp3", image: "bookSongsCovers/HeyICan'tDance.png", album: "Forgotten Middle", lyrics: "" },
        { audio: "bookSongs/Converge - Collide.mp3", image: "bookSongsCovers/Converge.png", album: "Converge", lyrics: "" },
        { audio: "bookSongs/Falling For The Dragon - Falling For The Dragon.mp3", image: "bookSongsCovers/Falling.png", album: "Falling For The Dragon", lyrics: "" },
        { audio: "bookSongs/Talent Bones - Found In Me.mp3", image: "bookSongsCovers/FoundInMe.png", album: "Talent Bones", lyrics: "" },
        { audio: "bookSongs/Matchmaker's Revenge - Matchmaker's Revenge.mp3", image: "bookSongsCovers/Matchmaker.png", album: "Matchmaker's Revenge", lyrics: "" },
        { audio: "bookSongs/One Small Kiss.mp3", image: "bookSongsCovers/Blu.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Survivor.mp3", image: "bookSongsCovers/Survivor.png", album: "Forgotten Middle", lyrics: "" },
        { audio: "bookSongs/Wings.mp3", image: "bookSongsCovers/Wings.png", album: "Forgotten Middle", lyrics: "" },
        { audio: "bookSongs/Ο Χορός των Αστεριών.mp3", image: "bookSongsCovers/DanceOfTheStars.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Ooops I Did It Again.mp3", image: "bookSongsCovers/Oops.png", album: "Matchmaker's Revenge", lyrics: "" },
        { audio: "bookSongs/I Remember.mp3", image: "bookSongsCovers/IRemember.png", album: "Gravity Thief", lyrics: "" },
        { audio: "bookSongs/Wrong Way Up.mp3", image: "bookSongsCovers/WrongWayUp.png", album: "Gravity Thief", lyrics: "" },
        { audio: "bookSongs/Blu - Dance of The Stars.mp3", image: "bookSongsCovers/DanceOfTheStars.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Resonance.mp3", image: "bookSongsCovers/Resonance.png", album: "Resonance", lyrics: "" },
        { audio: "bookSongs/Shuttle 66.mp3", image: "bookSongsCovers/Shuttle66.png", album: "Stellar Hearts", lyrics: "" },
        { audio: "bookSongs/Who Are You.mp3", image: "bookSongsCovers/WhoAreYou.png", album: "Stellar Hearts", lyrics: "" },
        { audio: "bookSongs/Sunrise.mp3", image: "bookSongsCovers/Sunrise.png", album: "Forgotten Middle", lyrics: "" },
        { audio: "bookSongs/Blu - How To Say Goodbye.mp3", image: "bookSongsCovers/HowToSayGoodbye.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Eternal Dusk.mp3", image: "bookSongsCovers/EternalDusk.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Into The Light.mp3", image: "bookSongsCovers/IntoTheLight.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/The Light Was Always Me (Female Version).mp3", image: "bookSongsCovers/TheLightWasAlwaysMeFemale.png", album: "Gravity Thief", lyrics: "" },
        { audio: "bookSongs/Gravity Thief - The Light Was Always Me.mp3", image: "bookSongsCovers/TheLightWasAlwaysMe.png", album: "Gravity Thief", lyrics: "" },
        { audio: "bookSongs/Blu - Reaching Out.mp3", image: "bookSongsCovers/ReachingOut.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Blu - Here For You.mp3", image: "bookSongsCovers/HereForYou.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Blu - Descension.mp3", image: "bookSongsCovers/Descension.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Fern - Healed.mp3", image: "bookSongsCovers/Healed.png", album: "Fern", lyrics: "" },
        { audio: "bookSongs/Forgotten Beginning - 춤을 못 춰요.mp3", image: "bookSongsCovers/HeyICan'tDance.png", album: "Forgotten Middle", lyrics: "" },
        { audio: "bookSongs/Converge - Small Things.mp3", image: "bookSongsCovers/SmallThings.png", album: "Converge", lyrics: "" },
        { audio: "bookSongs/Will I Miss You.mp3", image: "bookSongsCovers/WillIMissYou.png", album: "Talent Bones", lyrics: "" },
        { audio: "bookSongs/Nothing Like This.mp3", image: "bookSongsCovers/NothingLikeThis.png", album: "Forgotten Middle", lyrics: "" },
        { audio: "bookSongs/Falling For The Dragon INSTRUMENTAL.mp3", image: "bookSongsCovers/Falling.png", album: ["Falling For The Dragon", "Instrumentals"], lyrics: "" },
        { audio: "bookSongs/Πώς να πεις αντίο.mp3", image: "bookSongsCovers/HowToSayGoodbye.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/This Isn't All A dream.mp3", image: "bookSongsCovers/ThisIsn'tAllADream.png", album: "Intangible", lyrics: "" },
        { audio: "bookSongs/Girl In The Green Dress.mp3", image: "bookSongsCovers/GirlInTheGreenDress.png", album: "Intangible", lyrics: "" },
        { audio: "bookSongs/She's The Dawn.mp3", image: "bookSongsCovers/She'sTheDawn.png", album: "Intangible", lyrics: "" },
        { audio: "bookSongs/Midnight.mp3", image: "bookSongsCovers/Midnight.png", album: "Blu", lyrics: "" },
        { audio: "bookSongs/Bloom Through.mp3", image: "bookSongsCovers/BloomThrough.png", album: "Fern", lyrics: "" },
        { audio: "bookSongs/Feel Again.mp3", image: "bookSongsCovers/FeelAgain.png", album: ["Intangible", "Instrumentals"], lyrics: "" },
        { audio: "bookSongs/Spy.mp3", image: "bookSongsCovers/Spy.png", album: ["Intangible", "Instrumentals"], lyrics: "" },
        { audio: "bookSongs/Under The Moonlight We're Free INSTRUMENTAL.mp3", image: "bookSongsCovers/UnderTheMoonlightWe'reFree.png", album: ["Intangible", "Instrumentals"], lyrics: "" },
        { audio: "bookSongs/Slipping Away.mp3", image: "bookSongsCovers/SlippingAway.png", album: "Intangible", lyrics: "" },
        { audio: "bookSongs/Under The Moonlight We're Free.mp3", image: "bookSongsCovers/UnderTheMoonlightWe'reFree.png", album: "Intangible", lyrics: "" },
        { audio: "bookSongs/The Hardest Goodbye.mp3", image: "bookSongsCovers/TheHardestGoodbye.png", album: "Forgotten Beginning", lyrics: "" },
        { audio: "bookSongs/Is There A Paradise INSTRUMENTAL.mp3", image: "bookSongsCovers/IsThereAParadise.png", album: ["Resonance", "Instrumentals"], lyrics: "" },
        { audio: "bookSongs/New Day.mp3", image: "bookSongsCovers/NewDay.png", album: "Ion", lyrics: "" },
        { audio: "bookSongs/Watch Her Fly.mp3", image: "bookSongsCovers/WatchHerFly.png", album: "Gravity Thief", lyrics: "" },
        { audio: "bookSongs/Before You Met Me.mp3", image: "bookSongsCovers/BeforeYouMetMe.png", album: "Before We Were Strangers", lyrics: "" },
        { audio: "bookSongs/Limitless.mp3", image: "bookSongsCovers/Limitless.png", album: "Beyond", lyrics: "" },
        { audio: "bookSongs/Our Little Secret FEMALE VERSION.mp3", image: "bookSongsCovers/OurLittleSecret.png", album: "Matchmaker's Revenge", lyrics: "" },
        { audio: "bookSongs/In The Air.mp3", image: "bookSongsCovers/InTheAirJAZZY..png", album: "Enzely", lyrics: "" },
        { audio: "bookSongs/Flow.mp3", image: "bookSongsCovers/Flow.png", album: "Singles", lyrics: "" },
        { audio: "bookSongs/Storm Rider.mp3", image: "bookSongsCovers/StormRider.png", album: "Storm Rider", lyrics: "" },
        { audio: "bookSongs/She's Taking a Trip.mp3", image: "bookSongsCovers/She'sTakingATrip.png", album: "Justin Case", lyrics: "" },
        { audio: "bookSongs/In The Air JAZZY.mp3", image: "bookSongsCovers/InTheAirJAZZY.png", album: "Enzely", lyrics: "" },
        
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
  const albumCovers = {
    "All Songs": "bookSongsCovers/All.png",
    "Forgotten Middle": "bookSongsCovers/Survivor.png",
    "Forgotten Beginning": "bookSongsCovers/ForgottenBeginning.png",
    "Converge": "bookSongsCovers/Converge.png",
    "Falling For The Dragon": "bookSongsCovers/Falling.png",
    "Talent Bones": "bookSongsCovers/FoundInMe.png",
    "Matchmaker's Revenge": "bookSongsCovers/Matchmaker.png",
    "Blu": "bookSongsCovers/Blu.png",
    "Resonance": "bookSongsCovers/Resonance.png",
    "Stellar Hearts": "bookSongsCovers/WhoAreYou.png",
    "Fern": "bookSongsCovers/Healed.png",
    "Gravity Thief": "bookSongsCovers/TheLightWasAlwaysMe.png",
    "Instrumentals": "bookSongsCovers/Instrumentals.png",
    "Intangible": "bookSongsCovers/ThisIsn'tAllADream.png",
    "Ion": "bookSongsCovers/NewDay.png"
  };

  const songs = trackData.map((t, i) => {
    const meta = parseFilename(t.audio);
    return { id:i, url:t.audio, image:t.image || null, album: t.album || 'Instrumentals', lyrics: t.lyrics || '', title:meta.title, artist:meta.artist, dur:null };
  });

  // Lyrics added through the app's own editor are saved in this browser and
  // take priority over anything hardcoded in trackData above.
  const LYRICS_KEY_PREFIX = 'aether-lyrics-';
  songs.forEach(song => {
    try {
      const stored = localStorage.getItem(LYRICS_KEY_PREFIX + song.id);
      if (stored !== null) song.lyrics = stored;
    } catch(e){ /* localStorage unavailable — code defaults still work */ }
  });

  // group songs into albums, preserving first-appearance order
  const albumOrder = [];
  const albumMap = new Map();
  songs.forEach(s => {
  const albums = Array.isArray(s.album) ? s.album : [s.album];
  albums.forEach(name => {
    if (!albumMap.has(name)){ albumMap.set(name, []); albumOrder.push(name); }
    albumMap.get(name).push(s.id);
  });
});

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
    svg.innerHTML = landscapeMarkup(songId, 'main');
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
      `;
      const open = () => openSong(song.id);
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
      songListView.appendChild(row);
    });
  }

  function openSong(songId){
    queue = songs.map(s => s.id);
    pos = songId;
    renderVisual(songs[queue[pos]]);
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
    renderVisual(songs[queue[pos]]);
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

  // ---------- Player ----------

  function renderQueueList(){
    queueList.innerHTML = '';
    const count = Math.min(4, queue.length - 1);
    for (let i=1;i<=count;i++){
      const songId = queue[(pos+i) % queue.length];
      const song = songs[songId];
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
    const song = songs[queue[pos]];
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
      renderVisual(songs[queue[pos]]);
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
    const song = songs[queue[pos]];
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
    const song = songs[queue[pos]];
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
    const song = songs[queue[pos]];
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
    const id = songs[queue[pos]].id;
    liked.has(id) ? liked.delete(id) : liked.add(id);
    renderNowPlaying();
  });
  addBtn.addEventListener('click', () => {
    const id = songs[queue[pos]].id;
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
    const song = songs[queue[pos]];
    if (!song.dur) return;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = song.dur * ratio;
    renderNowPlaying();
  });

  // init — start on the albums library, don't load/play audio until a card is chosen
  renderLibrary();
})();