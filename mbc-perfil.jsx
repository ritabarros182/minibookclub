// mbc-perfil.jsx — member profile (any girl via ?u=Name; defaults to ME)
// Exports: PerfilPage

/** Redimensiona imagem para max 200x200 e devolve data URL */
function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 200;
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function PhotoUploadSection({ currentPhoto, onSaved }) {
  const [preview, setPreview]   = React.useState(currentPhoto);
  const [loading, setLoading]   = React.useState(false);
  const [success, setSuccess]   = React.useState(false);
  const inputRef = React.useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setPreview(dataUrl);
    setLoading(true); setSuccess(false);
    const res = await updatePhoto(ME.name, dataUrl);
    setLoading(false);
    if (res.ok) { setSuccess(true); if (onSaved) onSaved(dataUrl); }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px',
      background: '#fff', borderRadius: 16, border: '1px solid #e8e4d8', maxWidth: 440 }}>
      <button onClick={() => inputRef.current.click()} title="Mudar foto"
        style={{ all: 'unset', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
        {preview
          ? <img src={preview} alt="Foto de perfil"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover',
                border: '3px solid ' + ME.color }} />
          : <span style={{ width: 64, height: 64, borderRadius: '50%', background: ME.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 26, color: '#fff',
              border: '3px solid ' + ME.color }}>{ME.name[0]}</span>}
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20,
          background: '#191512', borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: '2px solid #fff' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </span>
      </button>
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", display: 'block',
          fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>Foto de perfil</span>
        <span className="micro">Aparece na navegação e no teu perfil.</span>
        {success && <span className="micro" style={{ color: '#1f6b3b', display: 'block', marginTop: 4 }}>✓ Guardado!</span>}
        {loading && <span className="micro" style={{ color: '#8a8270', display: 'block', marginTop: 4 }}>A guardar…</span>}
      </div>
      <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
        onClick={() => inputRef.current.click()}>
        {preview ? 'Mudar' : 'Adicionar'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

function ChangePinModal({ onClose }) {
  const [oldPin, setOldPin]   = React.useState('');
  const [newPin, setNewPin]   = React.useState('');
  const [conf, setConf]       = React.useState('');
  const [status, setStatus]   = React.useState(null); // null | 'loading' | 'ok' | 'error'
  const [errMsg, setErrMsg]   = React.useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPin.length < 4 || newPin !== conf) {
      setErrMsg(newPin.length < 4 ? 'O novo PIN tem de ter 4 dígitos.' : 'Os PINs novos não coincidem.');
      return;
    }
    setStatus('loading'); setErrMsg('');
    const res = await changePIN(ME.name, oldPin, newPin);
    if (res.ok) {
      setStatus('ok');
    } else {
      setStatus('error');
      setErrMsg(res.error || 'Erro desconhecido.');
    }
  }

  const inputStyle = {
    width: '100%', border: '2px solid var(--ink)', borderRadius: 10,
    padding: '10px 12px', fontFamily: "'Space Mono',monospace",
    fontSize: 22, letterSpacing: 8, background: 'var(--paper)',
    textAlign: 'center', outline: 'none',
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ padding: '28px 28px 24px' }}>
          <span className="eyebrow">Segurança</span>
          <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, margin: '6px 0 20px' }}>Alterar PIN</h3>
          {status === 'ok' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 36 }}>✅</div>
              <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, marginTop: 12 }}>PIN alterado com sucesso!</p>
              <button className="btn btn-primary" style={{ marginTop: 16, padding: '10px 28px' }} onClick={onClose}>Fechar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>PIN atual</label>
                <input type="password" inputMode="numeric" maxLength={4} value={oldPin}
                  onChange={e => setOldPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="••••" style={inputStyle} autoFocus />
              </div>
              <div>
                <label style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Novo PIN</label>
                <input type="password" inputMode="numeric" maxLength={4} value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="••••" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirmar novo PIN</label>
                <input type="password" inputMode="numeric" maxLength={4} value={conf}
                  onChange={e => setConf(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="••••" style={inputStyle} />
              </div>
              {errMsg && <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 13, color: 'var(--cherry)', margin: 0 }}>{errMsg}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary"
                  style={{ padding: '11px 22px', fontSize: 14, opacity: status === 'loading' ? 0.7 : 1 }}
                  disabled={status === 'loading'}>
                  {status === 'loading' ? 'A guardar…' : 'Guardar'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ padding: '11px 22px', fontSize: 14 }} onClick={onClose}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const ALL_GENRES = [
  "Romance", "Dark Romance", "Romance histórico",
  "Thriller", "Thriller psicológico", "Crime",
  "Fantasia", "Fantasia épica", "Ficção científica",
  "Clássicos", "Não-ficção", "Memórias",
  "Contemporâneo", "Histórico", "Realismo mágico",
  "Mistério", "Terror", "Distopia",
  "Poesia", "Aventura",
];

function GenreSelector({ girl }) {
  const [selected, setSelected] = React.useState(girl.preferredGenres || []);
  const [saving, setSaving]     = React.useState(false);
  const [saved, setSaved]       = React.useState(false);

  function toggle(g) {
    setSelected(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await updatePreferredGenres(ME.name, selected);
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e4d8", padding: "20px 24px", maxWidth: 520 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
        <div>
          <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", display: "block",
            fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 2 }}>Géneros preferidos</span>
          <span className="micro">Escolhe os que mais gostas — aparecem no teu perfil.</span>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ all: "unset", cursor: saving ? "wait" : "pointer", padding: "8px 16px", borderRadius: 10,
            background: saved ? "#1f6b3b" : "#191512", color: "#f6f2e7", flexShrink: 0,
            fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 13,
            opacity: saving ? 0.6 : 1, transition: "background 0.2s" }}>
          {saving ? "…" : saved ? "✓ Guardado" : "Guardar"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {ALL_GENRES.map(g => {
          const on = selected.includes(g);
          return (
            <button key={g} onClick={() => toggle(g)}
              style={{ all: "unset", cursor: "pointer", padding: "6px 13px", borderRadius: 20,
                fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 13,
                background: on ? ME.color : "#f0ede6",
                color:      on ? "#fff"   : "#5a5248",
                border:     "1.5px solid " + (on ? ME.color : "transparent"),
                transition: "all 0.15s" }}>
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EditProfilePanel() {
  var girl = MBC_GIRLS.find(function(g) { return g.name === ME.name; }) || ME;

  // Photo
  var [photo, setPhoto]           = React.useState(ME.photoUrl);
  var [photoLoading, setPhotoLoading] = React.useState(false);
  var [photoSaved, setPhotoSaved] = React.useState(false);
  var photoRef = React.useRef();

  // Info
  var [dispName, setDispName]   = React.useState(girl.displayName || '');
  var [birthday, setBirthday]   = React.useState(girl.birthday || '');
  var [infoSaving, setInfoSaving] = React.useState(false);
  var [infoSaved, setInfoSaved] = React.useState(false);

  // Genres
  var [genres, setGenres]         = React.useState(girl.preferredGenres || []);
  var [genreSaving, setGenreSaving] = React.useState(false);
  var [genreSaved, setGenreSaved] = React.useState(false);

  // PIN
  var [showPin, setShowPin] = React.useState(false);

  async function handlePhoto(e) {
    var file = e.target.files[0];
    if (!file) return;
    var dataUrl = await resizeImage(file);
    setPhoto(dataUrl);
    setPhotoLoading(true); setPhotoSaved(false);
    var res = await updatePhoto(ME.name, dataUrl);
    setPhotoLoading(false);
    if (res.ok) setPhotoSaved(true);
  }

  async function saveInfo() {
    setInfoSaving(true); setInfoSaved(false);
    var res = await updateProfileInfo(ME.name, { displayName: dispName.trim(), birthday: birthday });
    setInfoSaving(false);
    if (res.ok) setInfoSaved(true);
  }

  function toggleGenre(g) {
    setGenres(function(prev) {
      return prev.includes(g) ? prev.filter(function(x) { return x !== g; }) : prev.concat([g]);
    });
    setGenreSaved(false);
  }

  async function saveGenres() {
    setGenreSaving(true); setGenreSaved(false);
    var res = await updatePreferredGenres(ME.name, genres);
    setGenreSaving(false);
    if (res.ok) setGenreSaved(true);
  }

  var labelStyle = { fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600,
    fontSize: 13, color: '#5a5248', display: 'block', marginBottom: 5 };
  var inputStyle = { border: '2px solid #e8e4d8', borderRadius: 10, padding: '10px 14px',
    fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, background: '#faf8f3',
    outline: 'none', width: '100%', boxSizing: 'border-box', color: 'var(--ink)',
    transition: 'border-color .15s' };
  var divStyle = { borderBottom: '1px solid #e8e4d8', margin: '24px 0' };
  var saveBtnStyle = function(saved, saving) { return {
    all: 'unset', cursor: saving ? 'wait' : 'pointer', padding: '10px 22px',
    borderRadius: 10, background: saved ? '#1f6b3b' : '#191512', color: '#f6f2e7',
    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14,
    opacity: saving ? 0.6 : 1, transition: 'background .2s',
  }; };

  return (
    <React.Fragment>
      <div style={{ background: '#fff', border: '2px solid var(--ink)', borderRadius: 20,
        overflow: 'hidden', maxWidth: 540 }}>

        {/* Header com foto */}
        <div style={{ background: ME.color, padding: '20px 24px', display: 'flex',
          alignItems: 'center', gap: 16 }}>
          <button onClick={function() { photoRef.current.click(); }} title="Mudar foto"
            style={{ all: 'unset', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.15)' }}>
              {photo
                ? <img src={photo} alt="foto"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700,
                    fontSize: 24, color: '#fff' }}>{ME.name[0]}</div>}
            </div>
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20,
              background: '#191512', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', border: '2px solid ' + ME.color }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </span>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontStyle: 'italic',
              fontSize: 22, color: '#fff', lineHeight: 1 }}>{dispName || ME.name}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10,
              color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: '.04em' }}>
              EDITAR PERFIL
            </div>
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto}
            style={{ display: 'none' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {/* Feedback foto */}
          {(photoLoading || photoSaved) && (
            <div style={{ marginBottom: 16, fontFamily: "'Space Mono',monospace", fontSize: 11,
              color: photoSaved ? '#1f6b3b' : '#8a8270' }}>
              {photoLoading ? 'A guardar foto...' : '✓ Foto atualizada!'}
            </div>
          )}

          {/* Nome + Aniversario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input value={dispName}
                onChange={function(e) { setDispName(e.target.value); setInfoSaved(false); }}
                placeholder={ME.name} style={inputStyle} />
              <span className="micro" style={{ marginTop: 4, display: 'block' }}>
                Nome de exibicao. O login nao muda.
              </span>
            </div>
            <div>
              <label style={labelStyle}>Aniversario</label>
              <input type="date" value={birthday}
                onChange={function(e) { setBirthday(e.target.value); setInfoSaved(false); }}
                style={inputStyle} />
            </div>
            <div>
              <button onClick={saveInfo} disabled={infoSaving} style={saveBtnStyle(infoSaved, infoSaving)}>
                {infoSaving ? 'A guardar...' : infoSaved ? '✓ Guardado' : 'Guardar informacao'}
              </button>
            </div>
          </div>

          <div style={divStyle} />

          {/* Generos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12, gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700,
                fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>Generos preferidos</div>
              <span className="micro">Aparecem no teu perfil.</span>
            </div>
            <button onClick={saveGenres} disabled={genreSaving}
              style={saveBtnStyle(genreSaved, genreSaving)}>
              {genreSaving ? '...' : genreSaved ? '✓' : 'Guardar'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {ALL_GENRES.map(function(g) {
              var on = genres.includes(g);
              return (
                <button key={g} onClick={function() { toggleGenre(g); }}
                  style={{ all: 'unset', cursor: 'pointer', padding: '6px 13px', borderRadius: 20,
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 13,
                    background: on ? ME.color : '#f0ede6', color: on ? '#fff' : '#5a5248',
                    border: '1.5px solid ' + (on ? ME.color : 'transparent'),
                    transition: 'all .15s' }}>
                  {g}
                </button>
              );
            })}
          </div>

          <div style={divStyle} />

          {/* PIN */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700,
                fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>PIN de acesso</div>
              <span className="micro">Muda o teu PIN de 4 digitos a qualquer altura.</span>
            </div>
            <button className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14,
              flexShrink: 0 }} onClick={function() { setShowPin(true); }}>
              Alterar PIN
            </button>
          </div>

        </div>
      </div>
      {showPin && <ChangePinModal onClose={function() { setShowPin(false); }} />}
    </React.Fragment>
  );
}

function PerfilPage() {
  const param = new URLSearchParams(location.search).get("u");
  const who = (param && MBC_GIRLS.find(g => g.name === param)) ? param : ME.name;
  const girl = MBC_GIRLS.find(g => g.name === who);
  const isMe = who === ME.name;

  const [selBingoSeason, setSelBingoSeason] = React.useState(null);
  const s = statsFor(who);
  const reviews = reviewsBy(who);
  const picks = picksBy(who);
  const recs = recsBy(who);

  const STATS = [
    { num: s.avg + "★", label: "Média das reviews", c: "var(--orange)" },
    { num: s.read + "/" + s.totalClub, label: "Livros do clube lidos", c: "var(--blue)" },
    { num: s.reviews, label: "Reviews escritas", c: "var(--cherry)" },
    { num: s.picks, label: "Livros que escolheu", c: "var(--green)" },
  ];

  const bingoEyebrow = isMe ? "Os meus cartões" : "Os cartões de " + who;
  const mesesEyebrow = isMe ? "Os meus meses" : "Os meses de " + who;
  const escolhaLabel = isMe ? "a minha escolha" : "a escolha dela";

  return (
    <main>
      <div className="profile-hero">
        {girl.photoUrl
          ? <img src={girl.photoUrl} alt={who}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
                border: "4px solid " + girl.color, flexShrink: 0,
                boxShadow: "0 4px 16px rgba(25,21,18,0.18)" }} />
          : <div className="profile-av" style={{ background: girl.color }}>{who[0]}</div>}
        <div>
          <a href="Girls.html" className="micro" style={{ textDecoration: "none", color: "var(--orange)" }}>← as girls</a>
          <h1 className="profile-name" style={{ marginTop: 6 }}>{girl.displayName || who}{isMe && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.45em", color: "#8a8270", marginLeft: 12 }}>es tu ✦</span>}</h1>
          <p className="micro" style={{ marginTop: 6 }}>Membro desde 2024{girl.style ? ' · ' + girl.style : ''}{girl.birthday ? ' · 🎂 ' + new Date(girl.birthday + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' }) : ''}</p>
          {girl.preferredGenres && girl.preferredGenres.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {girl.preferredGenres.map(g => (
                <span key={g} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10,
                  padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                  background: girl.color + "22", color: girl.color, border: "1px solid " + girl.color + "44" }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="stat-grid">
          {STATS.map(st => (
            <div key={st.label} className="stat-card">
              <div className="stat-num" style={{ color: st.c }}>{st.num}</div>
              <div className="stat-label">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* simplified bingo cards */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{bingoEyebrow}</span>
            <h2 className="section-title">Bookish Bingo</h2>
          </div>
          <a href="bookish-bingo.html" className="shelf-link">ir para o bingo →</a>
        </div>
        <div className="evo-grid">
          {SEASONS.map(season => {
            const bools = getMemberMarks(who, season);
            const count = countMarks(bools);
            return (
              <div key={season.id} className="evo-card" style={{ cursor: season.status !== "locked" ? "pointer" : "default" }}
                onClick={function() { if (season.status !== "locked") setSelBingoSeason(season); }}>
                <div className="evo-top">
                  <span style={{ fontSize: 20 }}>{season.icon}</span>
                  <span className="evo-name">{season.name}</span>
                  <span className="micro" style={{ marginLeft: "auto" }}>{season.range}</span>
                </div>
                <div className="evo-body">
                  <MiniGrid bools={bools} color={girl.color} size={15} gap={4} />
                  <div className="evo-prog">
                    {count >= 9 ? <span className="evo-bingo">BINGO 🎉</span>
                      : <span className="evo-count">{count}<span className="micro"> / 9</span></span>}
                    <LineBadges bools={bools} color={girl.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* livros escolhidos */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">{mesesEyebrow}</span>
            <h2 className="section-title">Livros que escolheu</h2>
          </div>
          {picks.length > 0 && <Pill bg="#c2e84f" fg="#191512" font="hand" size={15} rot={-2}>boa escolha ✦</Pill>}
        </div>
        {picks.length > 0 ? (
          <div className="recs-grid">
            {picks.map((b, i) => (
              <div key={b.m} className="rec-card" style={{ transform: 'rotate(' + ((i%2?1:-1)*1) + 'deg)' }}>
                <Poster book={b} w={150} rot={0} />
                <div className="rec-by"><span className="rec-by-name">{b.mf}</span> · {escolhaLabel}</div>
                <p className="rec-quote hand" style={{ fontSize: 17 }}>{b.t}</p>
              </div>
            ))}
          </div>
        ) : <p className="hand" style={{ fontSize: 19, color: "var(--orange)" }}>ainda não escolheu nenhum mês ✦</p>}
      </section>

      {/* reviews */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">O que achou</span>
            <h2 className="section-title">Reviews</h2>
          </div>
          {reviews.length > 0 && <Pill bg="#191512" fg="#c2e84f" font="mono" size={11}>média {s.avg}★</Pill>}
        </div>
        {reviews.length > 0 ? (
          <div className="mylist">
            {reviews.map(rv => (
              <div key={rv.title} className="mylist-item">
                <div style={{ flex: "none" }}><Poster book={{ t: rv.title, a: rv.author, bg: rv.bg, fg: rv.fg }} w={46} rot={0} /></div>
                <div className="mylist-body">
                  <div className="mylist-title">{rv.title}</div>
                  <div className="mylist-sub">{rv.author} · {rv.month}</div>
                  <ReviewText t={rv.t} more={rv.more} />
                </div>
                <div className="mylist-right">
                  <div style={{ color: "var(--orange)", fontSize: 15, letterSpacing: 1 }}>{starStr(rv.r)}</div>
                  <div className="micro" style={{ marginTop: 4 }}>{rv.r}.0</div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="hand" style={{ fontSize: 19, color: "var(--orange)" }}>ainda sem reviews escritas ✦</p>}
        {isMe && <p className="hand" style={{ fontSize: 18, marginTop: 18, color: "var(--orange)" }}>
          escreve mais na <a href="Estante.html" style={{ color: "var(--ink)" }}>estante</a> → carrega numa capa ✦</p>}
      </section>

      {/* recomendações */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">Fora do clube</span>
            <h2 className="section-title">Recomendações</h2>
          </div>
        </div>
        {recs.length > 0 ? (
          <div className="recs-grid">
            {recs.map((r, i) => (
              <div key={r.t} className="rec-card" style={{ transform: 'rotate(' + ((i%2?1:-1)*1) + 'deg)' }}>
                <Poster book={r} w={150} rot={0} />
                <div className="rec-by"><span className="rec-by-name">{r.by}</span> recomenda</div>
                <p className="rec-quote hand">"{r.q}"</p>
              </div>
            ))}
          </div>
        ) : <p className="hand" style={{ fontSize: 19, color: "var(--orange)" }}>ainda sem recomendações ✦</p>}
      </section>

      {/* editar perfil — só visivel no perfil proprio */}
      {isMe && (
        <section className="section" style={{ paddingTop: 8, paddingBottom: 48 }}>
          <div className="section-head" style={{ marginBottom: 22 }}>
            <div>
              <span className="eyebrow">So tu ves isto</span>
              <h2 className="section-title">Editar Perfil</h2>
            </div>
          </div>
          <EditProfilePanel />
        </section>
      )}

      {selBingoSeason && <MemberBingoModal member={who} season={selBingoSeason} onClose={function() { setSelBingoSeason(null); }} />}
    </main>
  );
}

Object.assign(window, { PerfilPage });
