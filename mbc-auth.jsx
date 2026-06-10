// mbc-auth.jsx — autenticação com Supabase
// Exports: getMe, setMe, logout, verifyPin, changePIN
// Carregar DEPOIS de mbc-atoms.jsx e ANTES de mbc-chrome.jsx

// ─── Configuração Supabase ───────────────────────────────────────────────────
// Após criar o projeto no Supabase, cola os dois valores abaixo.
// Ver ficheiro SETUP.md para instruções passo-a-passo.
const SUPABASE_URL = 'https://ymtxdnuxhwujxfhbmahs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdHhkbnV4aHd1anhmaGJtYWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjgwNTMsImV4cCI6MjA5NjQwNDA1M30.MLBuqrYc5coeVBdtLBn2AnMxuMJ9YCvbqsEnVWeZyZE';

const SESSION_KEY  = 'mbc_session';
const SESSION_DAYS = 30;

// ─── Sessão local ────────────────────────────────────────────────────────────
/** Lê o utilizador atual do localStorage. Devolve objeto girl (com photoUrl) ou null. */
function getMe() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (s && s.name && Date.now() < s.expires) {
      const girl = MBC_GIRLS.find(g => g.name === s.name);
      if (!girl) return null;
      return Object.assign({}, girl, { photoUrl: s.photoUrl || null });
    }
  } catch(e) {}
  return null;
}

/** Guarda sessão no localStorage (válida 30 dias). */
function setMe(name) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name,
    expires: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  }));
}

/** Termina sessão e redireciona para o login. */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  location.replace('login.html');
}

// ─── Supabase helpers ────────────────────────────────────────────────────────
function _sbHeaders() {
  return {
    'apikey':        SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type':  'application/json',
  };
}

/**
 * Verifica se o PIN introduzido está correto.
 * Devolve true/false.
 */
async function verifyPin(name, pin) {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/member_pins?name=eq.' + encodeURIComponent(name) + '&select=pin',
      { headers: _sbHeaders() }
    );
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 && data[0].pin === pin;
  } catch(e) {
    console.error('verifyPin error:', e);
    return false;
  }
}

/**
 * Guarda/atualiza a foto de perfil no Supabase e na sessão local.
 * photoDataUrl: string base64 (data:image/...) ou URL externa.
 * Devolve { ok: true } ou { ok: false, error: string }.
 */
async function updatePhoto(name, photoDataUrl) {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/member_pins?name=eq.' + encodeURIComponent(name),
      {
        method:  'PATCH',
        headers: Object.assign({}, _sbHeaders(), { Prefer: 'return=minimal' }),
        body:    JSON.stringify({ photo_url: photoDataUrl }),
      }
    );
    if (!res.ok) throw new Error(res.status);
    // atualizar sessão local
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s) { s.photoUrl = photoDataUrl; localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
    } catch(e) {}
    return { ok: true };
  } catch(e) {
    return { ok: false, error: 'Erro ao guardar foto.' };
  }
}

/**
 * Carrega a foto de perfil de um membro a partir do Supabase.
 * Devolve string URL ou null.
 */
async function loadPhoto(name) {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/member_pins?name=eq.' + encodeURIComponent(name) + '&select=photo_url',
      { headers: _sbHeaders() }
    );
    const data = await res.json();
    return data[0]?.photo_url || null;
  } catch(e) { return null; }
}

/**
 * Muda o PIN de um membro.
 * Devolve { ok: true } ou { ok: false, error: 'mensagem' }.
 */
async function changePIN(name, oldPin, newPin) {
  const valid = await verifyPin(name, oldPin);
  if (!valid) return { ok: false, error: 'PIN atual incorreto.' };
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/member_pins?name=eq.' + encodeURIComponent(name),
      {
        method:  'PATCH',
        headers: Object.assign({}, _sbHeaders(), { Prefer: 'return=minimal' }),
        body:    JSON.stringify({ pin: newPin }),
      }
    );
    if (!res.ok) throw new Error(res.status);
    return { ok: true };
  } catch(e) {
    console.error('changePIN error:', e);
    return { ok: false, error: 'Erro de ligação. Tenta outra vez.' };
  }
}

/**
 * Guarda os géneros preferidos de um membro no Supabase.
 * genres: array de strings, ex: ["Romance", "Thriller"]
 */
async function updatePreferredGenres(name, genres) {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/member_pins?name=eq.' + encodeURIComponent(name),
      {
        method:  'PATCH',
        headers: Object.assign({}, _sbHeaders(), { Prefer: 'return=minimal' }),
        body:    JSON.stringify({ preferred_genres: JSON.stringify(genres) }),
      }
    );
    if (!res.ok) throw new Error(res.status);
    // atualizar cache local em MBC_GIRLS
    if (typeof MBC_GIRLS !== 'undefined') {
      const g = MBC_GIRLS.find(x => x.name === name);
      if (g) g.preferredGenres = genres;
    }
    return { ok: true };
  } catch(e) {
    return { ok: false, error: 'Erro ao guardar géneros.' };
  }
}

/**
 * Guarda nome de exibicao e/ou aniversario no Supabase.
 * info: { displayName: string, birthday: string (YYYY-MM-DD) }
 */
async function updateProfileInfo(name, info) {
  var body = {};
  if (info.displayName !== undefined) body.display_name = info.displayName;
  if (info.birthday   !== undefined) body.birthday      = info.birthday || null;
  try {
    var res = await fetch(
      SUPABASE_URL + '/rest/v1/member_pins?name=eq.' + encodeURIComponent(name),
      {
        method:  'PATCH',
        headers: Object.assign({}, _sbHeaders(), { Prefer: 'return=minimal' }),
        body:    JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error(res.status);
    if (typeof MBC_GIRLS !== 'undefined') {
      var g = MBC_GIRLS.find(function(x) { return x.name === name; });
      if (g) {
        if (info.displayName !== undefined) g.displayName = info.displayName;
        if (info.birthday    !== undefined) g.birthday    = info.birthday;
      }
    }
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s) {
        if (info.displayName !== undefined) s.displayName = info.displayName;
        if (info.birthday    !== undefined) s.birthday    = info.birthday;
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      }
    } catch(e2) {}
    return { ok: true };
  } catch(e) {
    return { ok: false, error: 'Erro ao guardar.' };
  }
}

Object.assign(window, { getMe, setMe, logout, verifyPin, changePIN, updatePhoto, loadPhoto,
  updatePreferredGenres, updateProfileInfo, SUPABASE_URL, SUPABASE_KEY });
