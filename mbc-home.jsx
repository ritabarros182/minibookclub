// mbc-home.jsx — HOME: Hero, ProximoEncontro, EstantePeek
// Exports to window: Hero, ProximoEncontro, EstantePeek
// Requer: mbc-books-api.jsx + mbc-sections.jsx carregados antes

const { useState, useEffect } = React;
const RKEY = "mbc-reviews-extra";
function loadExtra() { try { return JSON.parse(localStorage.getItem(RKEY)) || {}; } catch(e) { return {}; } }

/* ================================================================ HERO */
function Hero() {
  const cur = MBC_BOOKS.find(b => b.current) || MBC_BOOKS[0];
  const [gbInfo, setGbInfo]       = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [extra, setExtra]         = useState(loadExtra);

  // Buscar capa + género na API
  useEffect(() => {
    if (!cur || cur.t === 'a revelar') return;
    fetchBookInfo(cur.t, cur.a).then(info => { if (info) setGbInfo(info); });
  }, [cur?.t]);

  if (!cur) return null;

  // Merge reviews (hardcoded + extra do localStorage)
  const baseReviews = MBC_REVIEWS[cur.t] || [];
  const extraReviews = extra[cur.t] || [];
  const allReviews = [...extraReviews, ...baseReviews.filter(b => !extraReviews.some(e => e.by === b.by))];
  const myReview = allReviews.find(r => r.by === ME.name);

  // Girls que já deixaram review
  const reviewerNames = [...new Set(allReviews.map(r => r.by))];
  const reviewerGirls = MBC_GIRLS.filter(g => reviewerNames.includes(g.name));

  // Sinopse (Supabase > Google Books)
  const synopsis = SYN[cur.t] || (gbInfo?.description ? gbInfo.description.slice(0, 200) + '…' : null);

  // Género da API
  const genre = cur.genre || gbInfo?.categories?.[0] || null;

  // Quem escolheu
  const picker = cur.picker || PICKERS[cur.m] || null;

  // Capa: Supabase > Google Books runtime
  const coverUrl = cur.coverUrl || gbInfo?.cover || null;
  const bookWithCover = { ...cur, coverUrl };

  const save = (title, review) => {
    setExtra(e => {
      const list = (e[title] || []).filter(x => x.by !== review.by);
      const next = { ...e, [title]: [review, ...list] };
      try { localStorage.setItem(RKEY, JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };

  return (
    <React.Fragment>
      <section className="hero" id="top">
        <div className="hero-text">
          <Pill bg="#e8362a" fg="#f6f2e7" rot={-2} style={{ marginBottom: 22 }}>
            ★ A nossa escolha de {cur.mf}
          </Pill>
          <h1 className="headline">
            <span className="headline-sm">o livro</span>
            <span className="headline-lg">
              do mês
              <Squiggle w={260} color="#f4b32c" style={{ position: "absolute", left: 4, bottom: -14, width: "min(260px,70%)" }} />
            </span>
            <Cherry size={54} style={{ position: "absolute", top: -18, right: 28 }} />
            <Sparkle size={30} color="#2d6fe0" style={{ position: "absolute", top: 8, left: -34 }} />
          </h1>

          <div className="book-id">
            <h2 className="booktitle">{cur.t}</h2>
            <p className="bookauthor">{cur.a}</p>
          </div>

          {synopsis && <p className="hero-blurb">{synopsis}</p>}

          <div className="meta-row">
            {reviewerGirls.length > 0 && (
              <div className="meta-girls">
                <div style={{ display: "flex" }}>
                  {reviewerGirls.slice(0, 5).map((g, i) => (
                    <MemberAvatar key={g.name} name={g.name} size={30}
                      border="2px solid #f6f2e7" marginLeft={i ? -6 : 0} />
                  ))}
                </div>
                <span className="hand" style={{ fontSize: 17, marginLeft: 12 }}>elas já leram →</span>
              </div>
            )}
          </div>

          <div className="cta-row">
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              Ver na estante &amp; reviews
            </button>
            {!myReview && (
              <button className="btn btn-ghost" onClick={() => setModalOpen(true)}>
                Deixa a tua review
              </button>
            )}
          </div>
        </div>

        <div className="hero-art">
          <Tape w={120} rot={-8} color="rgba(45,111,224,0.55)"
            style={{ position: "absolute", top: -14, left: "32%", zIndex: 3 }} />
          <button onClick={() => setModalOpen(true)}
            style={{ all: "unset", cursor: "pointer", display: "block" }}>
            <Poster book={bookWithCover} w={290} rot={-4} />
          </button>
          {picker && (
            <Pill bg="#c2e84f" fg="#191512" font="grotesk" size={13} rot={6}
              style={{ position: "absolute", top: 20, right: -18, zIndex: 4 }}>
              {picker}
            </Pill>
          )}
          {genre && (
            <Pill bg="#8b5cf6" fg="#f6f2e7" font="mono" size={10} rot={-5}
              style={{ position: "absolute", bottom: 54, left: -34, zIndex: 4 }}>
              ★ {genre}
            </Pill>
          )}
          <Sparkle size={34} color="#e8362a" style={{ position: "absolute", bottom: 14, right: 6 }} />
          <Arrow w={86} color="#191512" flip style={{ position: "absolute", bottom: -10, right: "30%" }} />
        </div>
      </section>

      {modalOpen && (
        <BookModal
          book={cur}
          extra={extra}
          onClose={() => setModalOpen(false)}
          onSave={save}
        />
      )}
    </React.Fragment>
  );
}

/* ============================================================ PRÓXIMO ENCONTRO */
function ProximoEncontro() {
  const cur = MBC_BOOKS.find(b => b.current);
  const [attended, setAttended]   = useState(null);
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    if (!cur?.meetingId) return;
    getAttendance(cur.meetingId).then(list => {
      setAttendees(list);
      setAttended(list.includes(ME.name));
    });
  }, [cur?.meetingId]);

  if (!cur) return null;

  const dateObj      = cur.date ? new Date(cur.date + 'T12:00:00') : null;
  const hasDate      = dateObj && !isNaN(dateObj.getTime());
  const dayNum       = hasDate ? dateObj.getDate() : null;
  const monthName    = hasDate ? dateObj.toLocaleDateString('pt-PT', { month: 'long' }) : null;
  const meetingLabel = cur.type === 'Retiro' ? 'Retiro de ' + cur.mf : 'Jantar de ' + cur.mf;
  const locationText = [cur.restaurant, cur.location].filter(Boolean).join(' · ');

  async function handleToggle() {
    if (!cur.meetingId) return;
    const next = await toggleAttendance(cur.meetingId);
    setAttended(next);
    setAttendees(prev => next ? [...new Set([...prev, ME.name])] : prev.filter(n => n !== ME.name));
  }

  return (
    <section className="section" style={{ paddingTop: 10 }}>
      <div className="section-head">
        <div>
          <span className="eyebrow">Marca na agenda</span>
          <h2 className="section-title">Próximo encontro</h2>
        </div>
      </div>
      <div className="meet-card">
        {hasDate ? (
          <div className="meet-date">
            <div className="meet-day">{dayNum}</div>
            <div className="meet-mon" style={{ textTransform: "capitalize" }}>{monthName}</div>
          </div>
        ) : (
          <div className="meet-date" style={{ opacity: 0.4, userSelect: "none" }}>
            <div className="meet-day" style={{ fontSize: 22 }}>?</div>
            <div className="meet-mon">data</div>
          </div>
        )}

        <div className="meet-body">
          <h3>{meetingLabel}</h3>
          {hasDate && locationText
            ? <p>{locationText}</p>
            : <p style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                Estamos a aguardar data para o próximo encontro.
              </p>}
        </div>

        <div className="meet-rsvp">
          {/* Avatares com nome no hover */}
          {attendees.length > 0 && (
            <div style={{ display: "flex", marginBottom: 10, flexWrap: "wrap" }}>
              {attendees.slice(0, 7).map(name => {
                const g = MBC_GIRLS.find(x => x.name === name);
                return (
                  <span key={name} title={name} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: g ? g.color : "#d4cfc2",
                    border: "2px solid #fff", marginRight: -6,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bricolage Grotesque',sans-serif",
                    fontWeight: 700, fontSize: 13, color: "#fff",
                    cursor: "default", flexShrink: 0,
                  }}>{name[0]}</span>
                );
              })}
              {attendees.length > 7 && (
                <span style={{
                  width: 34, height: 34, borderRadius: "50%", background: "#d4cfc2",
                  border: "2px solid #fff", marginRight: -6, display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "#5a5248", fontWeight: 700, flexShrink: 0,
                }}>+{attendees.length - 7}</span>
              )}
            </div>
          )}

          {/* Botão Eu vou — só aparece quando há data */}
          {hasDate && <button onClick={handleToggle} style={{
            all: "unset", cursor: "pointer",
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 700, fontSize: 12, letterSpacing: "0.01em",
            padding: "7px 16px", borderRadius: 20,
            background: attended ? "#1f6b3b" : "transparent",
            color:      attended ? "#fff"    : "#5a5248",
            border:     "1.5px solid " + (attended ? "#1f6b3b" : "#d4cfc2"),
            transition: "all 0.15s",
          }}>
            {attended === null ? "…" : attended ? "✓ Eu vou" : "Eu vou?"}
          </button>}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== ESTANTE PEEK */
function EstantePeek() {
  const [sel, setSel]     = useState(null);
  const [extra, setExtra] = useState(loadExtra);

  const save = (title, review) => {
    setExtra(e => {
      const list = (e[title] || []).filter(x => x.by !== review.by);
      const next = { ...e, [title]: [review, ...list] };
      try { localStorage.setItem(RKEY, JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };

  // Um livro é "lido" só quando tem reviews
  const readCount     = MBC_BOOKS.filter(b => !b.upcoming && !b.current && (MBC_REVIEWS[b.t]?.length > 0 || extra[b.t]?.length > 0)).length;
  const upcomingCount = MBC_BOOKS.filter(b => b.upcoming).length;

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="eyebrow">A coleção de 2026</span>
          <h2 className="section-title">A nossa estante</h2>
        </div>
        <a href="Estante.html" className="shelf-link">ver estante completa →</a>
      </div>
      <div className="estante-frame">
        <div className="shelf">
          {MBC_BOOKS.map((b, i) => {
            const h = 180 + ((i * 7) % 5) * 12;
            if (b.upcoming) {
              // Lombada fantasma com nome do mês
              return (
                <div key={b.m} style={{
                  width: 32, height: h, background: "#d4cfc2", opacity: 0.3,
                  borderRadius: "3px 3px 1px 1px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    writingMode: "vertical-rl", transform: "rotate(180deg)",
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700,
                    fontSize: 10, color: "#5a5248", letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>{b.mf}</span>
                </div>
              );
            }
            return (
              <Spine key={b.m} book={b} h={h}
                lean={b.current ? -6 : 0}
                onClick={() => setSel(b)} />
            );
          })}
        </div>
        <div className="shelf-board" />
        <div className="shelf-foot">
          <span className="hand" style={{ fontSize: 20 }}>
            {readCount} {readCount === 1 ? "lido" : "lidos"}, {upcomingCount} à espera ✦
          </span>
        </div>
      </div>

      {sel && (
        <BookModal book={sel} extra={extra} onClose={() => setSel(null)} onSave={save} />
      )}
    </section>
  );
}

Object.assign(window, { Hero, ProximoEncontro, EstantePeek });
