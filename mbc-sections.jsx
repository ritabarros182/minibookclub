// mbc-sections.jsx — full page sections
// Exports: EstanteFull, GirlsFull, BingoFull, RecsFull, EncontrosFull
const { useState, useEffect } = React;

function PageIntro({ eyebrow, title, sub, right }) {
  return (
    <div className="page-intro">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="page-title">{title}</h1>
          {sub && <p className="page-sub">{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

function starStr(v) {
  if (v == null) return "";
  const f = Math.round(v);
  return "★★★★★".slice(0, f) + "☆☆☆☆☆".slice(0, 5 - f);
}

// review with title + expandable body ("ler mais")
function ReviewText({ t, more }) {
  const [o, setO] = useState(false);
  return (
    <div className="review-text">
      <span className="review-headline">{t}</span>
      {more && <React.Fragment>
        {o && <span className="review-more"> — {more}</span>}
        <button className="readmore" onClick={() => setO(v => !v)}>{o ? "ler menos" : "ler mais"}</button>
      </React.Fragment>}
    </div>
  );
}

/* =============================================================== ESTANTE */
const RKEY = "mbc-reviews-extra";
function loadExtra() { try { return JSON.parse(localStorage.getItem(RKEY)) || {}; } catch(e) { return {}; } }

function StarsInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3, fontSize: 26, cursor: "pointer", color: "var(--orange)" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)} style={{ lineHeight: 1 }}>
          {i <= (hover || value) ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

function BookModal({ book, extra, onClose, onSave }) {
  const base = MBC_REVIEWS[book.t] || [];
  const myExtra = (extra[book.t] || []).find(x => x.by === ME.name);
  const mine = myExtra || base.find(x => x.by === ME.name);
  const combined = [
    ...(extra[book.t] || []),
    ...base.filter(b => !(extra[book.t] || []).some(e => e.by === b.by)),
  ];
  const avg = combined.length ? combined.reduce((s, x) => s + x.r, 0) / combined.length : null;
  const [open, setOpen] = useState(!mine);
  const [r, setR] = useState(mine ? mine.r : 0);
  const [t, setT] = useState(mine ? mine.t : "");
  const [more, setMore] = useState(mine && mine.more ? mine.more : "");
  // Google Books
  const [gbInfo, setGbInfo]       = useState(null);
  const [gbLoading, setGbLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setGbLoading(true); setGbInfo(null);
    fetchBookInfo(book.t, book.a).then(info => { if (alive) { setGbInfo(info); setGbLoading(false); } });
    return () => { alive = false; };
  }, [book.t]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-top">
          <Poster book={{ ...book, coverUrl: book.coverUrl || (gbInfo && gbInfo.cover) || null }} w={130} rot={-3} />
          <div className="modal-meta">
            <span className="micro" style={{ color: "var(--orange)" }}>{book.mf}{book.picker ? ' · escolha de ' + book.picker : ''}</span>
            <h3>{book.t}</h3>
            <div className="modal-author">{book.a}</div>
            {avg != null
              ? <div className="modal-avg">
                  <span className="modal-avg-num">{avg.toFixed(1)}</span>
                  <div>
                    <div style={{ color: "var(--orange)", fontSize: 16, letterSpacing: 1 }}>{starStr(avg)}</div>
                    <div className="micro">{combined.length} reviews do clube</div>
                  </div>
                </div>
              : <Pill bg="#191512" fg="#c2e84f" font="mono" size={11}>{book.current ? "A ler agora" : "Ainda sem reviews"}</Pill>}
            {/* sinopse: usa SYN curada se existir, senão usa Google Books */}
            {SYN[book.t]
              ? <p className="modal-syn">{SYN[book.t]}</p>
              : (!gbLoading && gbInfo && gbInfo.description)
                ? <p className="modal-syn">{gbInfo.description.slice(0, 320)}{gbInfo.description.length > 320 ? "…" : ""}</p>
                : null}
            {/* metadados Google Books */}
            {gbLoading
              ? <span className="micro" style={{ color: "#aaa5" }}>a buscar detalhes…</span>
              : gbInfo && (gbInfo.year || gbInfo.pages || gbInfo.categories.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {gbInfo.year && (
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, padding: "3px 8px",
                      background: "#f6f2e7", border: "1px solid #d4cfc2", borderRadius: 20, color: "#5a5248" }}>
                      {gbInfo.year}
                    </span>
                  )}
                  {gbInfo.pages && (
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, padding: "3px 8px",
                      background: "#f6f2e7", border: "1px solid #d4cfc2", borderRadius: 20, color: "#5a5248" }}>
                      {gbInfo.pages} pág.
                    </span>
                  )}
                  {gbInfo.categories.slice(0, 2).map(c => (
                    <span key={c} style={{
                      fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600,
                      fontSize: 11, padding: "3px 10px", background: "#c2e84f", borderRadius: 20, color: "#191512",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            <a className="modal-gr" href={goodreadsUrl(book)} target="_blank" rel="noopener noreferrer"
              style={{ marginTop: 14, display: "inline-block" }}>ver no Goodreads ↗</a>
          </div>
        </div>

        <div className="modal-reviews">
          {/* my review form */}
          <div style={{ background: "#fff", border: "2px dashed var(--ink)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="hand" style={{ fontSize: 20, color: "var(--orange)" }}>
                {mine ? "a tua review ✦" : "deixa a tua review ✦"}</span>
              {!open && <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}
                onClick={() => setOpen(true)}>{mine ? "editar" : "escrever"}</button>}
            </div>
            {open && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <StarsInput value={r} onChange={setR} />
                <input value={t} onChange={e => setT(e.target.value)} placeholder="Título da review (ex: Perturbador e belíssimo)"
                  style={{ width: "100%", border: "2px solid var(--ink)", borderRadius: 10, padding: "10px 12px",
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 15, background: "var(--paper)" }} />
                <textarea value={more} onChange={e => setMore(e.target.value)} placeholder="Escreve mais sobre o que achaste… (opcional)"
                  rows={3} style={{ width: "100%", border: "2px solid var(--ink)", borderRadius: 10, padding: 10,
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, resize: "vertical", background: "var(--paper)" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}
                    onClick={() => { if (r && t.trim()) { onSave(book.t, { by: ME.name, r, t: t.trim(), more: more.trim() }); setOpen(false); } }}>
                    Publicar</button>
                </div>
              </div>
            )}
          </div>
          {/* all reviews */}
          {combined.map((rev, i) => {
            const g = MBC_GIRLS.find(x => x.name === rev.by) || { color: "#191512" };
            return (
              <div className="review-item" key={i}>
                <MemberAvatar name={rev.by} size={36} border="2px solid #f0ede6" style={{ flexShrink: 0 }} />
                <div className="review-body">
                  <div className="review-head">
                    <span className="review-name">{rev.by}{rev.by === ME.name ? " (tu)" : ""}</span>
                    <span className="review-stars">{starStr(rev.r)}</span>
                  </div>
                  <ReviewText t={rev.t} more={rev.more} />
                </div>
              </div>
            );
          })}
          {combined.length === 0 && <p className="hand" style={{ fontSize: 18, textAlign: "center" }}>
            ainda ninguém escreveu. sê a primeira! ✦</p>}
        </div>
      </div>
    </div>
  );
}

// Cover card com fetch automático de capa via Google Books
function CoverCard({ book, onClick }) {
  const [cover, setCover] = useState(book.coverUrl || null);

  useEffect(() => {
    if (cover) return;
    let alive = true;
    fetchBookInfo(book.t, book.a).then(info => {
      if (alive && info?.cover) setCover(info.cover);
    });
    return () => { alive = false; };
  }, [book.t]);

  const enriched = { ...book, coverUrl: cover };
  const avg = clubAvg(book.t);

  return (
    <button className="cover-card" onClick={onClick}>
      <div className="cover-wrap">
        <Poster book={enriched} w={120} rot={0} />
        {book.current && <span className="cover-badge">A LER</span>}
      </div>
      <span className="cover-month">{book.mf}</span>
      {avg != null
        ? <span className="cover-stars">{starStr(avg)} {avg.toFixed(1)}</span>
        : <span className="cover-soon">{book.current ? "a ler" : "em breve"}</span>}
      {book.picker && (
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#8a8270', marginTop: 2 }}>
          ✦ {book.picker}
        </span>
      )}
    </button>
  );
}

function EstanteFull() {
  const [year, setYear]   = useState("2026");
  const [sel, setSel]     = useState(null);
  const [extra, setExtra] = useState(loadExtra);

  useEffect(() => { try { localStorage.setItem(RKEY, JSON.stringify(extra)); } catch(e) {} }, [extra]);
  const save = (title, review) => setExtra(e => {
    const list = (e[title] || []).filter(x => x.by !== review.by);
    return { ...e, [title]: [review, ...list] };
  });

  const books2026  = window.MBC_BOOKS      || [];
  const books2025  = window.MBC_BOOKS_2025 || [];
  const shelfBooks = year === "Todos" ? [...books2025, ...books2026]
                   : year === "2025"  ? books2025
                   :                    books2026;

  // Só livros revelados na grid (excluem upcoming)
  const revealedBooks = shelfBooks.filter(b => !b.upcoming);
  const readCount     = revealedBooks.filter(b => (MBC_REVIEWS[b.t] || []).length > 0).length;

  return (
    <main>
      <PageIntro eyebrow="A coleção do clube" title="A nossa estante"
        sub="Um livro por mês, guardado para sempre. Carrega numa capa para ler as reviews do clube — e deixar a tua."
        right={
          <div className="year-tabs">
            {["Todos", "2025", "2026"].map(y =>
              <button key={y} className={"year-tab" + (y === year ? " is-on" : "")} onClick={() => setYear(y)}>{y}</button>
            )}
          </div>
        }
      />

      <section className="section" style={{ paddingTop: 18 }}>
        {/* Prateleira com lombadas — só revelados */}
        <div className="estante-frame">
          <div className="shelf">
            {shelfBooks.filter(b => !b.upcoming).map((b, i) => (
              <div key={(b.year || '26') + b.m}>
                <Spine book={b} h={200 + ((i * 7) % 5) * 12}
                  lean={b.current ? -6 : 0}
                  onClick={() => setSel(b)} />
              </div>
            ))}
          </div>
          <div className="shelf-board" />
          <div className="shelf-foot">
            <span className="hand" style={{ fontSize: 20 }}>
              {readCount} lidos, {revealedBooks.length - readCount} à espera ✦
            </span>
          </div>
        </div>

        {/* Grid de capas — só revelados */}
        <div className="cover-grid">
          {revealedBooks.map(b => (
            <CoverCard key={(b.year || '26') + b.m} book={b} onClick={() => setSel(b)} />
          ))}
        </div>
      </section>

      {sel && <BookModal book={sel} extra={extra} onClose={() => setSel(null)} onSave={save} />}
    </main>
  );
}

/* ================================================================ GIRLS */
function GirlsFull() {
  return (
    <main>
      <PageIntro eyebrow="Quem faz o clube" title="As girls"
        sub="As leitoras do clube. Carrega numa para ires ao perfil dela — livros do clube lidos, média das reviews, escolhas e estilo preferido."
        right={<Pill bg="#ff7eb6" fg="#191512" font="hand" size={16} rot={-3}>{MBC_GIRLS.length} leitoras, 1 estante ♥</Pill>} />
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="girls-grid">
          {MBC_GIRLS.map((g, i) => {
            const picks = picksBy(g.name).length;
            return (
              <a key={g.name} href={"o-meu-perfil.html?u=" + encodeURIComponent(g.name)}
                className="girl-card" style={{ "--gc": g.color, transform: 'rotate(' + ((i%2?1:-1)*0.9) + 'deg)', textDecoration: "none", color: "inherit" }}>
                <div className="girl-top">
                  <MemberAvatar name={g.name} size={44} border={"3px solid " + g.color} style={{ flexShrink: 0 }} />
                  <div>
                    <h3 className="girl-name">{g.name}</h3>
                    <span className="girl-genre">{g.style}</span>
                  </div>
                </div>
                <div className="girl-reading" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="girl-count" style={{ color: g.color }}>{g.clubRead}</span>
                    <span className="micro">livros do clube</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--orange)", fontSize: 14, letterSpacing: 1 }}>{starStr(g.avg)}</div>
                    <span className="micro">média {g.avg.toFixed(1)}</span>
                  </div>
                </div>
                <div className="girl-foot">
                  <span className="micro">{picks} {picks === 1 ? "escolha sua" : "escolhas suas"} · ver perfil →</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* ================================================================ BINGO */
function BingoEntry({ challenge, color, onClose, onSave }) {
  const [title, setTitle]     = useState("");
  const [author, setAuthor]   = useState("");
  const [preview, setPreview] = useState(null);   // null = idle, false = loading, objeto = resultado
  const debounceRef = React.useRef(null);

  // Auto-fetch quando título + autor têm conteúdo suficiente
  useEffect(() => {
    if (title.length < 3) { setPreview(null); return; }
    clearTimeout(debounceRef.current);
    setPreview(false); // loading
    debounceRef.current = setTimeout(async () => {
      const info = await fetchBookInfo(title, author);
      setPreview(info); // objeto ou null
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [title, author]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ padding: "30px 28px 28px" }}>
          <span className="micro" style={{ color: "var(--orange)" }}>Marcar quadrado</span>
          <h3 style={{ margin: "6px 0 18px", fontFamily: "'DM Serif Display',serif", fontStyle: "italic", fontSize: 26, lineHeight: 1.05 }}>"{challenge}"</h3>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 70, height: 100, flex: "none", position: "relative", borderRadius: 8, overflow: "hidden", boxShadow: "0 6px 16px -6px rgba(25,21,18,.4)" }}>
              <MiniCover title={title || "Que livro?"} author={author || "autora"} color={color} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do livro" autoFocus
                style={{ border: "2px solid var(--ink)", borderRadius: 10, padding: "10px 12px", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, background: "var(--paper)" }} />
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Autora"
                style={{ border: "2px solid var(--ink)", borderRadius: 10, padding: "10px 12px", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, background: "var(--paper)" }} />
            </div>
          </div>
          {/* Preview Google Books */}
          {preview === false && (
            <p className="micro" style={{ color: "#aaa", marginTop: 10 }}>a buscar o livro…</p>
          )}
          {preview && (preview.year || preview.categories.length > 0 || preview.pages) && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "#f6f2e7",
              borderRadius: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span className="micro">✓ encontrado:</span>
              {preview.year && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11,
                padding: "2px 7px", background: "#fff", border: "1px solid #d4cfc2", borderRadius: 20, color: "#5a5248" }}>{preview.year}</span>}
              {preview.pages && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11,
                padding: "2px 7px", background: "#fff", border: "1px solid #d4cfc2", borderRadius: 20, color: "#5a5248" }}>{preview.pages} pág.</span>}
              {preview.categories.slice(0, 1).map(c => (
                <span key={c} style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600,
                  fontSize: 11, padding: "2px 7px", background: "#c2e84f", borderRadius: 20, color: "#191512" }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn btn-primary" style={{ padding: "11px 22px", fontSize: 14 }}
              onClick={() => { if (title.trim()) onSave({ title: title.trim(), author: author.trim() || "—", color }); }}>
              Marcar ✓</button>
            <button className="btn btn-ghost" style={{ padding: "11px 22px", fontSize: 14 }} onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BingoFull() {
  const startIdx = Math.max(0, SEASONS.findIndex(s => s.status === "current"));
  const [ai, setAi]     = useState(startIdx);
  const season           = SEASONS[ai];
  const [marks, setMarks] = useState(() => getMyMarks(season.id));
  const [entry, setEntry] = useState(null);

  useEffect(() => { setMarks(getMyMarks(season.id)); setEntry(null); }, [ai]);

  // Guardar no Supabase ao adicionar/remover
  const addBook = async (i, book) => {
    const next = { ...marks, [i]: book };
    setMarks(next);
    setEntry(null);
    await saveBingoEntry(season.id, i, book.title, book.author);
  };
  const removeBook = async (i) => {
    const n = { ...marks }; delete n[i];
    setMarks(n);
    await removeBingoEntry(season.id, i);
  };

  const myBools = marksToBools(marks);
  const myCount = countMarks(myBools);
  const locked = season.status === "locked";

  // leaderboard of the other members for this season
  const others = MBC_GIRLS.map(g => {
    const bools = getMemberMarks(g.name, season);
    return { g, bools, count: countMarks(bools) };
  }).sort((a, b) => b.count - a.count);

  return (
    <main>
      <PageIntro eyebrow="1 cartão por estação · 4 no ano" title="Bookish Bingo"
        sub="Quatro cartões 3×3, um por estação. Marca um quadrado sempre que leres um livro que encaixe no desafio — e vê como vão as outras." />
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="bingo-tabs">
          {SEASONS.map((s, i) => (
            <button key={s.id} className={"bingo-tab" + (i === ai ? " is-on" : "")} onClick={() => setAi(i)}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>{s.name}<span className="micro">{s.range}</span>{s.status === "locked" && " 🔒"}</button>
          ))}
        </div>

        {/* my card */}
        <div className="bingo-card" style={{ "--season": season.color }}>
          <div className="bingo-card-head">
            <div>
              <span className="micro" style={{ color: "var(--orange)" }}>{season.icon} {season.range} · o teu cartão</span>
              <h3 className="bingo-card-title">Bingo de {season.name}</h3>
            </div>
            <Pill bg="#191512" fg="#c2e84f" font="mono" size={12}>{myCount} / 9 ✓</Pill>
          </div>
          <div className="bingo-card-body">
            <div className="bingo-grid bingo-grid-3">
            {season.challenges.map((sq, i) => {
              const mk = marks[i];
              return (
                <div key={i} className={"bingo-sq" + (mk ? " marked" : "") + (locked ? " locked" : "")}
                  style={{ cursor: locked ? "default" : "pointer" }}
                  onClick={() => { if (!locked && !mk) setEntry(i); }}>
                  {mk
                    ? <React.Fragment>
                        <MiniCover title={mk.title} author={mk.author} color={mk.color} />
                        <button className="sq-remove" title="remover" onClick={(e) => { e.stopPropagation(); removeBook(i); }}>✕</button>
                      </React.Fragment>
                    : <span className="bingo-sq-text">{sq}</span>}
                </div>
              );
            })}
            </div>
          </div>
          <p className="bingo-hint hand">{locked ? "esta estação ainda não começou ✦"
            : myCount >= 9 ? "BINGO! 🎉 completaste o cartão ✦"
            : "carrega num quadrado e diz que livro leste — aparece a capa ✦"}</p>
        </div>

        {/* evolution of the others */}
        <div className="section-head" style={{ margin: "48px 0 22px" }}>
          <div>
            <span className="eyebrow">Como vão as outras</span>
            <h2 className="section-title" style={{ fontSize: "clamp(28px,4vw,44px)" }}>Evolução · {season.name}</h2>
          </div>
        </div>
        <div className="evo-grid">
          {others.map(({ g, bools, count }) => (
            <a key={g.name} href={"o-meu-perfil.html?u=" + encodeURIComponent(g.name)} className="evo-card">
              <div className="evo-top">
                <div className="evo-av" style={{ background: g.color }}>{g.name[0]}</div>
                <span className="evo-name">{g.name}{g.name === ME.name ? " (tu)" : ""}</span>
              </div>
              <div className="evo-body">
                <MiniGrid bools={bools} color={g.color} size={15} gap={4} />
                <div className="evo-prog">
                  {count >= 9
                    ? <span className="evo-bingo">BINGO 🎉</span>
                    : <span className="evo-count">{count}<span className="micro"> / 9</span></span>}
                  {count < 9 && (bingoLines(bools).line || bingoLines(bools).col || bingoLines(bools).diag) && (
                    <span className="evo-linha" style={{ background: g.color }}>✦ LINHA!</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {entry != null && <BingoEntry challenge={season.challenges[entry]} color={BINGO_COLORS[entry % BINGO_COLORS.length]}
        onClose={() => setEntry(null)} onSave={(book) => addBook(entry, book)} />}
    </main>
  );
}

/* ================================================================= RECS */

// Card individual — vai buscar a capa à API
function RecCard({ rec, idx, onDelete }) {
  const [cover, setCover] = useState(null);
  const canDelete = ME && ME.name === rec.by;

  useEffect(() => {
    let alive = true;
    fetchBookInfo(rec.t, rec.a).then(info => {
      if (alive && info?.cover) setCover(info.cover);
    });
    return () => { alive = false; };
  }, [rec.t]);

  const book = { t: rec.t, a: rec.a, bg: rec.bg, fg: rec.fg, coverUrl: cover };

  return (
    <div className="rec-card" style={{ transform: 'rotate(' + ((idx % 2 ? 1 : -1) * 1.2) + 'deg)', position: 'relative' }}>
      {canDelete && (
        <button onClick={() => onDelete(rec.id)}
          title="Remover recomendação"
          style={{ position: 'absolute', top: 6, right: 6, zIndex: 10, all: 'unset', cursor: 'pointer',
            width: 22, height: 22, borderRadius: '50%', background: 'rgba(232,54,42,0.85)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, lineHeight: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          ✕
        </button>
      )}
      <Poster book={book} w={150} rot={0} />
      <div className="rec-by">
        <span className="rec-by-name">{rec.by}</span>
        {rec.genre ? <span> · {rec.genre}</span> : null}
      </div>
      <p className="rec-quote hand">"{rec.q}"</p>
    </div>
  );
}

// Modal para adicionar uma recomendação
function AddRecModal({ onClose, onAdded }) {
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [quote, setQuote]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [searching, setSearching] = useState(false);

  async function doSearch() {
    if (!search.trim()) return;
    setSearching(true); setResults([]);
    try {
      const res  = await fetch('https://www.googleapis.com/books/v1/volumes?q=' +
        encodeURIComponent(search) + '&maxResults=5&key=' + GOOGLE_BOOKS_KEY);
      const data = await res.json();
      setResults((data.items || []).map(item => ({
        title:  item.volumeInfo.title,
        author: (item.volumeInfo.authors || []).join(', '),
        cover:  item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        genre:  (item.volumeInfo.categories || [])[0] || '',
      })));
    } catch(e) {}
    setSearching(false);
  }

  async function handleSave() {
    if (!selected || !quote.trim()) return;
    setSaving(true);
    const rec = await addRecommendation({
      member_name: ME.name,
      book_title:  selected.title,
      author:      selected.author || '',
      genre:       selected.genre  || '',
      quote:       quote.trim(),
      spine_color: '#191512',
    });
    if (rec) onAdded(rec);
    setSaving(false);
    onClose();
  }

  const inputStyle = { width: '100%', border: '2px solid #d4cfc2', borderRadius: 10, padding: '10px 12px',
    fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, background: '#f9f7f2',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ maxHeight: '88vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, margin: '0 0 20px' }}>
          A tua recomendação
        </h3>

        {/* Pesquisa */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontFamily: "'Bricolage Grotesque',sans-serif",
            fontSize: 13, fontWeight: 600, color: '#5a5248', marginBottom: 6 }}>
            Pesquisar livro
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="título ou autora…" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={doSearch} disabled={searching}
              style={{ all: 'unset', cursor: searching ? 'wait' : 'pointer', padding: '10px 18px',
                borderRadius: 10, background: '#191512', color: '#f6f2e7', flexShrink: 0,
                fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14 }}>
              {searching ? '…' : 'Pesquisar'}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => setSelected(r)}
                style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 10, cursor: 'pointer',
                  border: '2px solid ' + (selected?.title === r.title ? '#191512' : '#e8e4d8'),
                  background: selected?.title === r.title ? '#f9f7f2' : '#fff',
                  transition: 'border-color 0.15s' }}>
                {r.cover && <img src={r.cover} alt="" style={{ width: 40, height: 58, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 13, color: '#8a8270' }}>{r.author}</div>
                  {r.genre && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#aaa', marginTop: 3 }}>{r.genre}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quote */}
        {selected && (
          <React.Fragment>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: "'Bricolage Grotesque',sans-serif",
                fontSize: 13, fontWeight: 600, color: '#5a5248', marginBottom: 6 }}>
                O que te fez amar este livro?
              </label>
              <textarea value={quote} onChange={e => setQuote(e.target.value)}
                placeholder="uma frase curta, do coração ✦"
                rows={3}
                style={{ width: '100%', border: '2px solid #191512', borderRadius: 10, padding: 10,
                  fontFamily: "'Caveat',cursive", fontSize: 18, resize: 'vertical', background: '#f9f7f2',
                  outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSave} disabled={saving || !quote.trim()}
              style={{ all: 'unset', cursor: saving || !quote.trim() ? 'not-allowed' : 'pointer',
                padding: '12px 28px', borderRadius: 10, background: '#191512', color: '#f6f2e7',
                fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 14,
                opacity: saving || !quote.trim() ? 0.5 : 1, transition: 'opacity 0.15s' }}>
              {saving ? 'A guardar…' : 'Guardar recomendação ✦'}
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function RecsFull() {
  const [recs, setRecs]       = useState([...(window.ALL_RECS || [])]);
  const [mode, setMode]       = useState("pessoa");
  const [val, setVal]         = useState("Todas");
  const [showAdd, setShowAdd] = useState(false);

  const switchMode = (m) => { setMode(m); setVal(m === "pessoa" ? "Todas" : "Todos"); };
  const recMembers = [...new Set(recs.map(r => r.by))].sort();
  const genres     = [...new Set(recs.map(r => r.genre).filter(Boolean))].sort();
  const allLabel   = mode === "pessoa" ? "Todas" : "Todos";
  const chips      = mode === "pessoa" ? [allLabel, ...recMembers] : [allLabel, ...genres];
  const list       = val === allLabel ? recs : recs.filter(r => (mode === "pessoa" ? r.by : r.genre) === val);

  async function handleDelete(id) {
    await removeRecommendation(id);
    setRecs(prev => prev.filter(r => r.id !== id));
  }

  function handleAdded(rec) {
    setRecs(prev => [rec, ...prev]);
    setVal("Todas"); setMode("pessoa");
  }

  return (
    <main>
      <PageIntro eyebrow="Fora do livro do mês" title="Recomendações"
        sub="Os favoritos de sempre de cada uma — para quando acabamos o livro do mês cedo demais."
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Pill bg="#c2e84f" fg="#191512" font="mono" size={11}>{recs.length} favoritos</Pill>
            <button onClick={() => setShowAdd(true)}
              style={{ all: 'unset', cursor: 'pointer', padding: '10px 18px', borderRadius: 99,
                background: '#191512', color: '#f6f2e7', fontFamily: "'Bricolage Grotesque',sans-serif",
                fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(25,21,18,0.18)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Adicionar
            </button>
          </div>
        }
      />
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="rec-filterbar">
          <span className="micro">filtrar por</span>
          <div className="seg">
            <button className={"seg-btn" + (mode === "pessoa" ? " on" : "")} onClick={() => switchMode("pessoa")}>pessoa</button>
            <button className={"seg-btn" + (mode === "genero" ? " on" : "")} onClick={() => switchMode("genero")}>género</button>
          </div>
        </div>
        <div className="bingo-tabs" style={{ marginBottom: 30 }}>
          {chips.map(n => (
            <button key={n} className={"bingo-tab" + (n === val ? " is-on" : "")} onClick={() => setVal(n)}>{n}</button>
          ))}
        </div>
        <div className="recs-grid">
          {list.map((r, i) => (
            <RecCard key={r.id || (r.by + r.t)} rec={r} idx={i} onDelete={handleDelete} />
          ))}
          {list.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <p className="hand" style={{ fontSize: 22, color: 'var(--orange)' }}>
                ainda não há recomendações aqui ✦
              </p>
            </div>
          )}
        </div>
      </section>
      {showAdd && <AddRecModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
    </main>
  );
}

/* ============================================================ ENCONTROS */
const TAPE_COLORS = ["#ff7eb6","#2d6fe0","#c2e84f","#f4b32c","#8b5cf6","#ff5e2e","#e8362a","#1f6b3b","#0e3a5e","#6e4a2f","#c2386b","#2e8b8b"];

function MeetingCard({ meeting, idx }) {
  const [attended, setAttended]     = useState(null);  // null=loading, true/false
  const [attendees, setAttendees]   = useState([]);
  const [uploading, setUploading]   = useState(false);
  const [photo, setPhoto]           = useState(meeting.photoUrl || null);
  const fileRef = React.useRef();
  const isPast  = meeting.date && new Date(meeting.date) < new Date();
  const tape    = TAPE_COLORS[idx % TAPE_COLORS.length];
  const rot     = idx % 2 === 0 ? -2 : 2;
  const cap     = meeting.restaurant
    ? meeting.monthFull + ' · ' + meeting.restaurant
    : meeting.monthFull;

  useEffect(() => {
    if (!meeting.meetingId || !isPast) return;
    getAttendance(meeting.meetingId).then(list => {
      setAttendees(list);
      setAttended(list.includes(ME.name));
    });
  }, [meeting.meetingId]);

  async function handleToggle() {
    const next = await toggleAttendance(meeting.meetingId);
    setAttended(next);
    setAttendees(prev => next ? [...prev, ME.name] : prev.filter(n => n !== ME.name));
  }

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file || !meeting.meetingId) return;
    setUploading(true);
    const url = await uploadMeetingPhoto(meeting.meetingId, file);
    if (url) setPhoto(url);
    setUploading(false);
  }

  return (
    <figure className="polaroid" style={{ transform: 'rotate(' + rot + 'deg)', position: "relative" }}>
      <Tape w={84} rot={rot < 0 ? 5 : -5} color={tape + "cc"}
        style={{ position: "absolute", top: -12, left: "50%", marginLeft: -42, zIndex: 2 }} />

      {/* Foto */}
      <div className="polaroid-img" style={{ position: "relative", overflow: "hidden", cursor: isPast ? "pointer" : "default" }}
        onClick={() => isPast && fileRef.current && fileRef.current.click()}>
        {photo
          ? <img src={photo} alt={cap} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", background: "#e8e4d8", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8, color: "#8a8270" }}>
              {isPast
                ? <React.Fragment>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontFamily: "'Caveat',cursive", fontSize: 14 }}>adicionar foto</span>
                  </React.Fragment>
                : <span style={{ fontFamily: "'Caveat',cursive", fontSize: 14 }}>em breve ✦</span>}
            </div>}
        {uploading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(25,21,18,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#fff",
            fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 13 }}>
            A guardar…
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />

      <figcaption className="polaroid-cap hand">{cap}</figcaption>

      {/* Botão "Eu fui" + avatares */}
      {isPast && meeting.meetingId && (
        <div style={{ padding: "8px 12px 4px", borderTop: "1px solid #e8e4d8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", marginLeft: -4 }}>
              {attendees.slice(0, 6).map(name => {
                const g = MBC_GIRLS.find(x => x.name === name);
                return (
                  <span key={name} title={name} style={{ width: 22, height: 22, borderRadius: "50%",
                    background: g ? g.color : "#d4cfc2", border: "2px solid #fff",
                    marginLeft: -4, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 9, color: "#fff" }}>
                    {name[0]}
                  </span>
                );
              })}
              {attendees.length > 6 && (
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#d4cfc2",
                  border: "2px solid #fff", marginLeft: -4, display: "inline-flex",
                  alignItems: "center", justifyContent: "center", fontSize: 8, color: "#5a5248", fontWeight: 700 }}>
                  +{attendees.length - 6}
                </span>
              )}
            </div>
            <button onClick={handleToggle} style={{
              all: "unset", cursor: "pointer",
              fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 11, fontWeight: 700,
              padding: "4px 10px", borderRadius: 20,
              background: attended ? "#1f6b3b" : "transparent",
              color:      attended ? "#fff"    : "#5a5248",
              border:     "1.5px solid " + (attended ? "#1f6b3b" : "#d4cfc2"),
              transition: "all 0.15s",
            }}>
              {attended ? "✓ Eu fui" : "Eu fui?"}
            </button>
          </div>
        </div>
      )}
    </figure>
  );
}

function EncontrosFull() {
  const pastOrCurrent = MBC_BOOKS.filter(b => !b.upcoming || b.current);
  return (
    <main>
      <PageIntro eyebrow="Um por mês, sempre" title="Encontros"
        sub="A nossa galeria. Clica numa polaroid para adicionar a foto. Marca que estiveste presente."
        right={<Pill bg="#ff5e2e" fg="#f6f2e7" font="hand" size={16} rot={2}>a nossa história ✦</Pill>} />
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="gallery-grid">
          {pastOrCurrent.map((b, idx) => (
            <MeetingCard key={b.meetingId || b.m} meeting={b} idx={idx} />
          ))}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { PageIntro, EstanteFull, GirlsFull, BingoFull, RecsFull, EncontrosFull, starStr, ReviewText });
