// mbc-supabase.jsx — carrega todos os dados da app a partir do Supabase
// Carregar DEPOIS de mbc-auth.jsx e ANTES de mbc-chrome.jsx
// Quando os dados estiverem prontos, dispara window.dispatchEvent(new Event('mbc-ready'))
// e define window.MBC_DATA_LOADED = true

async function loadMBCData() {
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  const sb = (path) => fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: H }).then(r => r.json());

  try {
    // Fetch tudo em paralelo
    const [members, books, meetings, reviews, recs, seasons, entries] = await Promise.all([
      sb('member_pins?select=name,color,style,photo_url,preferred_genres&order=name'),
      sb('books?select=*&order=created_at'),
      sb('meetings?select=*&order=year.desc,sort_order.asc'),
      sb('reviews?select=*'),
      sb('recommendations?select=*&order=created_at'),
      sb('bingo_seasons?select=*&year=eq.2026&order=id'),
      sb('bingo_entries?select=*'),
    ]);

    // ── MBC_GIRLS ─────────────────────────────────────────
    window.MBC_GIRLS = members.map(m => ({
      name:            m.name,
      color:           m.color || '#191512',
      style:           m.style || '',
      photoUrl:        m.photo_url || null,
      preferredGenres: m.preferred_genres
        ? (Array.isArray(m.preferred_genres)
            ? m.preferred_genres
            : (() => { try { return JSON.parse(m.preferred_genres); } catch(e) { return []; } })())
        : [],
      // stats calculados abaixo
      clubRead: 0,
      avg:      0,
    }));

    // ── BOOKS dict ────────────────────────────────────────
    const bookById = {};
    books.forEach(b => { bookById[b.id] = b; });

    // ── REVIEWS por livro ─────────────────────────────────
    window.MBC_REVIEWS = {};
    const reviewsByBookId = {};
    reviews.forEach(r => {
      if (!reviewsByBookId[r.book_id]) reviewsByBookId[r.book_id] = [];
      reviewsByBookId[r.book_id].push(r);
    });
    books.forEach(b => {
      const rs = reviewsByBookId[b.id] || [];
      window.MBC_REVIEWS[b.title] = rs.map(r => ({
        by:   r.member_name,
        r:    r.rating,
        t:    r.title,
        more: r.body || '',
      }));
    });

    // ── MBC_BOOKS (combina meetings + books) ──────────────
    const mapMeeting = (m) => {
      const book    = m.book_id ? bookById[m.book_id] : null;
      const rs      = book ? (reviewsByBookId[book.id] || []) : [];
      const rating  = rs.length ? Math.round(rs.reduce((s, r) => s + Number(r.rating), 0) / rs.length * 10) / 10 : null;
      const hasBook = !!book;
      return {
        m:         m.month_code,
        mf:        m.month_full,
        year:      m.year,
        t:         book ? book.title  : 'a revelar',
        a:         book ? book.author : '',
        bg:        book ? book.spine_color : '#6b7c93',
        fg:        book ? book.spine_fg    : '#f6f2e7',
        coverUrl:  book ? book.cover_url   : null,
        bookId:    book ? book.id          : null,
        meetingId: m.id,
        rating,
        current:   m.is_current || false,
        upcoming:  !hasBook && !m.is_current,
        // extra para Encontros
        date:      m.meeting_date,
        endDate:   m.end_date,
        location:  m.location,
        restaurant: m.restaurant,
        type:      m.meeting_type,
        photoUrl:  m.photo_url,
        picker:    m.picker_name,
        genre:     book ? book.genre : null,
      };
    };
    window.MBC_BOOKS      = meetings.filter(m => +m.year === 2026).map(mapMeeting);
    window.MBC_BOOKS_2025 = meetings.filter(m => +m.year === 2025).map(mapMeeting);

    // ── PICKERS ───────────────────────────────────────────
    window.PICKERS = {};
    meetings.forEach(m => { if (m.picker_name) window.PICKERS[m.month_code] = m.picker_name; });

    // ── SYN (sinopses) ────────────────────────────────────
    window.SYN = {};
    books.forEach(b => { if (b.synopsis) window.SYN[b.title] = b.synopsis; });

    // ── ALL_RECS ──────────────────────────────────────────
    window.ALL_RECS = recs.map(r => ({
      id:    r.id,
      by:    r.member_name,
      t:     r.book_title,
      a:     r.author || '',
      genre: r.genre  || '',
      bg:    r.spine_color || '#191512',
      fg:    r.spine_fg    || '#f6f2e7',
      q:     r.quote  || '',
    }));

    // ── SEASONS (Bingo) ───────────────────────────────────
    window.SEASONS = seasons.map(s => ({
      id:         s.id,
      name:       s.name,
      range:      s.date_range,
      icon:       s.icon,
      color:      s.color,
      status:     s.status,
      challenges: Array.isArray(s.challenges) ? s.challenges : JSON.parse(s.challenges),
    }));

    // ── BINGO_ENTRIES por membro+estação ──────────────────
    window.MBC_BINGO_ENTRIES = {};  // keyed by `${seasonId}|${memberName}`
    entries.forEach(e => {
      const key = e.season_id + '|' + e.member_name;
      if (!window.MBC_BINGO_ENTRIES[key]) window.MBC_BINGO_ENTRIES[key] = {};
      window.MBC_BINGO_ENTRIES[key][e.square_index] = { title: e.book_title, author: e.book_author };
    });

    // ── Stats por membro ──────────────────────────────────
    const reviewCountByMember = {};
    const ratingsByMember     = {};
    reviews.forEach(r => {
      reviewCountByMember[r.member_name] = (reviewCountByMember[r.member_name] || 0) + 1;
      if (!ratingsByMember[r.member_name]) ratingsByMember[r.member_name] = [];
      ratingsByMember[r.member_name].push(Number(r.rating));
    });
    window.MBC_GIRLS.forEach(g => {
      const rs = ratingsByMember[g.name] || [];
      g.clubRead = reviewCountByMember[g.name] || 0;
      g.avg      = rs.length ? Math.round(rs.reduce((s, v) => s + v, 0) / rs.length * 10) / 10 : 0;
    });

    // ── ME atualizado com cor + photoUrl ──────────────────
    const meGirl = window.MBC_GIRLS.find(g => g.name === (window.ME && window.ME.name));
    if (meGirl && window.ME) {
      Object.assign(window.ME, meGirl);
    }

    window.MBC_DATA_LOADED = true;
    window.dispatchEvent(new Event('mbc-ready'));
  } catch (err) {
    console.error('loadMBCData error:', err);
    // Em caso de erro, dispara igualmente para não bloquear a app
    window.MBC_DATA_LOADED = true;
    window.dispatchEvent(new Event('mbc-ready'));
  }
}

// Funções utilitárias para bingo com Supabase
async function saveBingoEntry(seasonId, squareIndex, bookTitle, bookAuthor) {
  const me = window.ME;
  if (!me) return;
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' };
  await fetch(SUPABASE_URL + '/rest/v1/bingo_entries', {
    method: 'POST', headers: H,
    body: JSON.stringify({ season_id: seasonId, member_name: me.name, square_index: squareIndex, book_title: bookTitle, book_author: bookAuthor }),
  });
  // atualiza cache local
  const key = seasonId + '|' + me.name;
  if (!window.MBC_BINGO_ENTRIES[key]) window.MBC_BINGO_ENTRIES[key] = {};
  window.MBC_BINGO_ENTRIES[key][squareIndex] = { title: bookTitle, author: bookAuthor };
}

async function removeBingoEntry(seasonId, squareIndex) {
  const me = window.ME;
  if (!me) return;
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  await fetch(SUPABASE_URL + '/rest/v1/bingo_entries?season_id=eq.' + encodeURIComponent(seasonId) + '&member_name=eq.' + encodeURIComponent(me.name) + '&square_index=eq.' + squareIndex, {
    method: 'DELETE', headers: H,
  });
  const key = seasonId + '|' + me.name;
  if (window.MBC_BINGO_ENTRIES[key]) delete window.MBC_BINGO_ENTRIES[key][squareIndex];
}

async function toggleAttendance(meetingId) {
  const me = window.ME;
  if (!me) return null;
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' };
  // verificar se já está
  const res  = await fetch(SUPABASE_URL + '/rest/v1/meeting_attendance?meeting_id=eq.' + meetingId + '&member_name=eq.' + encodeURIComponent(me.name), { headers: H });
  const data = await res.json();
  if (data.length > 0) {
    await fetch(SUPABASE_URL + '/rest/v1/meeting_attendance?meeting_id=eq.' + meetingId + '&member_name=eq.' + encodeURIComponent(me.name), { method: 'DELETE', headers: H });
    return false;
  } else {
    await fetch(SUPABASE_URL + '/rest/v1/meeting_attendance', { method: 'POST', headers: Object.assign({}, H, { Prefer: 'return=minimal' }), body: JSON.stringify({ meeting_id: meetingId, member_name: me.name }) });
    return true;
  }
}

async function getAttendance(meetingId) {
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  const res  = await fetch(SUPABASE_URL + '/rest/v1/meeting_attendance?meeting_id=eq.' + meetingId + '&select=member_name', { headers: H });
  const data = await res.json();
  return data.map(d => d.member_name);
}

// Upload de foto para Supabase Storage
async function uploadMeetingPhoto(meetingId, file) {
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  const ext  = file.name.split('.').pop();
  const path = meetingId + '.' + ext;
  const uploadRes = await fetch(SUPABASE_URL + '/storage/v1/object/meeting-photos/' + path, {
    method: 'POST', headers: Object.assign({}, H, { 'Content-Type': file.type }),
    body: file,
  });
  if (!uploadRes.ok) return null;
  const publicUrl = SUPABASE_URL + '/storage/v1/object/public/meeting-photos/' + path;
  // guardar na meeting
  await fetch(SUPABASE_URL + '/rest/v1/meetings?id=eq.' + meetingId, {
    method: 'PATCH', headers: Object.assign({}, H, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ photo_url: publicUrl }),
  });
  return publicUrl;
}

// Adicionar uma recomendação ao Supabase (devolve objeto rec normalizado ou null)
async function addRecommendation({ member_name, book_title, author, genre, quote, spine_color }) {
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json', Prefer: 'return=representation' };
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/recommendations', {
      method: 'POST', headers: H,
      body: JSON.stringify({ member_name, book_title, author: author || '', genre: genre || '',
                             quote: quote || '', spine_color: spine_color || '#191512' }),
    });
    const data = await res.json();
    const r = data[0];
    if (!r) return null;
    return { id: r.id, by: r.member_name, t: r.book_title, a: r.author || '',
             genre: r.genre || '', bg: r.spine_color || '#191512', fg: r.spine_fg || '#f6f2e7', q: r.quote || '' };
  } catch(e) { console.error('addRecommendation', e); return null; }
}

// Remover uma recomendação pelo id
async function removeRecommendation(id) {
  const H = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  try {
    await fetch(SUPABASE_URL + '/rest/v1/recommendations?id=eq.' + id, { method: 'DELETE', headers: H });
  } catch(e) { console.error('removeRecommendation', e); }
}

// Iniciar carregamento imediatamente
loadMBCData();

Object.assign(window, { loadMBCData, saveBingoEntry, removeBingoEntry, toggleAttendance, getAttendance,
  uploadMeetingPhoto, addRecommendation, removeRecommendation });
