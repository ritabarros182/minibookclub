// mbc-chrome.jsx — shared Nav + Footer + toast + loading hook
// Exports to window: Nav, Footer, useToast, ME, useDataReady, LoadingScreen
// Requer mbc-auth.jsx + mbc-supabase.jsx carregados antes

const ME = getMe() || MBC_GIRLS[0]; // utilizadora da sessão atual

/** Hook que retorna true quando os dados do Supabase estiverem prontos */
function useDataReady() {
  const [ready, setReady] = React.useState(window.MBC_DATA_LOADED || false);
  React.useEffect(() => {
    if (window.MBC_DATA_LOADED) { setReady(true); return; }
    const h = () => setReady(true);
    window.addEventListener('mbc-ready', h);
    return () => window.removeEventListener('mbc-ready', h);
  }, []);
  return ready;
}

/** Ecrã de loading enquanto os dados carregam */
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      fontFamily: "'Bricolage Grotesque', sans-serif", background: 'var(--paper)' }}>
      <Cherry size={40} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%',
            background: 'var(--ink)', opacity: 0.3,
            animation: 'mbc-pulse 1s ease-in-out ' + (i * 0.2) + 's infinite' }} />
        ))}
      </div>
      <style>{"@keyframes mbc-pulse { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.3); } }"}</style>
    </div>
  );
}

const PAGES = [
  { id: "estante",  label: "Estante",        href: "Estante.html" },
  { id: "girls",    label: "Girls",          href: "Girls.html" },
  { id: "bingo",    label: "Bookish Bingo",  href: "bookish-bingo.html" },
  { id: "recs",     label: "Recomendações",  href: "recomendacoes.html" },
  { id: "encontros",label: "Encontros",      href: "Encontros.html" },
];

function NavProfile({ current }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // fechar ao clicar fora
  React.useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const photoUrl = ME.photoUrl || null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className={"profile-chip" + (current === "perfil" ? " is-on" : "")}
        style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          padding: "6px 12px 6px 6px", borderRadius: 99,
          background: current === "perfil" ? "var(--ink)" : "transparent",
          border: "2px solid " + (current === "perfil" ? "var(--ink)" : "#d4cfc2"),
          transition: "background 0.15s, border-color 0.15s" }}>
        {photoUrl
          ? <img src={photoUrl} alt={ME.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          : <span className="chip-av" style={{ background: ME.color, width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0 }}>{ME.name[0]}</span>}
        <span className="chip-name" style={{ color: current === "perfil" ? "#fff" : "var(--ink)" }}>{ME.name}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" style={{ marginLeft: 2, opacity: 0.5,
          transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 999,
          background: "#fff", border: "1px solid #e8e4d8", borderRadius: 12,
          boxShadow: "0 8px 24px rgba(25,21,18,0.12)", minWidth: 160, overflow: "hidden" }}>
          <a href={"o-meu-perfil.html?u=" + encodeURIComponent(ME.name)}
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 14, fontWeight: 500,
              color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid #f0ede6" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9f7f2"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Ver perfil
          </a>
          {ME.name === 'Rita' && (
            <a href="admin.html"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 14, fontWeight: 500,
                color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid #f0ede6" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9f7f2"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Backoffice
            </a>
          )}
          <button onClick={logout}
            style={{ all: "unset", width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", cursor: "pointer",
              fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 14, fontWeight: 500,
              color: "#e8362a", boxSizing: "border-box" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

function Nav({ current }) {
  return (
    <header className="nav">
      <a href="index.html" className="nav-logo">
        <BookIcon size={26} style={{ flex: "none" }} />
        <span>Mini Book Club</span>
      </a>
      <nav className="nav-links">
        {PAGES.map(p => (
          <a key={p.id} href={p.href} className={"nav-link" + (current === p.id ? " is-on" : "")}>
            {p.label}</a>
        ))}
      </nav>
      <NavProfile current={current} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <BookIcon size={28} />
      <span className="footer-logo">Mini Book Club</span>
      <span className="micro">est. 2024 · feito com livros &amp; cafés</span>
    </footer>
  );
}

// tiny toast hook + element helper
function useToast() {
  const [msg, setMsg] = React.useState("");
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2000);
    return () => clearTimeout(t);
  }, [msg]);
  const node = <div className={"toast" + (msg ? " show" : "")}>{msg}</div>;
  return [setMsg, node];
}

Object.assign(window, { Nav, Footer, useToast, ME, logout, useDataReady, LoadingScreen });
