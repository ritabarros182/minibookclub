// mbc-atoms.jsx — vibrant collage atoms + data for Mini Book Club
// Exports to window: MBC_BOOKS, MBC_GIRLS, MBC_BINGO, Spine, Poster, Pill,
//                    Sparkle, Cherry, Arrow, Squiggle, Avatars, Tape

/* ----------------------------------------------------------- PALETTE */
const PAL = {
  paper:  "#f6f2e7",
  ink:    "#191512",
  cherry: "#e8362a",
  pink:   "#ff7eb6",
  lime:   "#c2e84f",
  blue:   "#2d6fe0",
  yellow: "#f4b32c",
  purple: "#8b5cf6",
  orange: "#ff5e2e",
  green:  "#1f6b3b",
  cream:  "#f6f2e7",
};

/* spine color + readable text color per book — 2026 */
const MBC_BOOKS = [
  { m:"Jan", mf:"Janeiro",   t:"A Teoria do Amor",      a:"Ali Hazelwood",  bg:"#c2386b", fg:"#fff",     rating:3.8 },
  { m:"Fev", mf:"Fevereiro", t:"Anatomy: A Love Story", a:"Dana Schwartz",  bg:"#1a5a5a", fg:"#f6f2e7",  rating:null },
  { m:"Mar", mf:"Março",     t:"Butcher & Blackbird",   a:"Brynne Weaver",  bg:"#1c0a0a", fg:"#e8362a",  rating:null },
  { m:"Abr", mf:"Abril",     t:"Panenka",               a:"Ronan Hession",  bg:"#7c4a1e", fg:"#f6f2e7",  rating:null },
  { m:"Mai", mf:"Maio",      t:"Uma Tempestade de Chá", a:"Hafsah Faizal",  bg:"#5c1a8a", fg:"#f6f2e7",  rating:null },
  { m:"Jun", mf:"Junho",     t:"Ninth House",           a:"Leigh Bardugo",  bg:"#0d1a3a", fg:"#c2e84f",  rating:null, current:true },
  { m:"Jul", mf:"Julho",     t:"a revelar",             a:"",               bg:"#6b7c93", fg:"#f6f2e7",  rating:null, upcoming:true },
  { m:"Ago", mf:"Agosto",    t:"a revelar",             a:"",               bg:"#c2844f", fg:"#f6f2e7",  rating:null, upcoming:true },
  { m:"Set", mf:"Setembro",  t:"a revelar",             a:"",               bg:"#4a7c59", fg:"#f6f2e7",  rating:null, upcoming:true },
  { m:"Out", mf:"Outubro",   t:"a revelar",             a:"",               bg:"#6b3a1f", fg:"#f6f2e7",  rating:null, upcoming:true },
  { m:"Nov", mf:"Novembro",  t:"a revelar",             a:"",               bg:"#1f3a5f", fg:"#f6f2e7",  rating:null, upcoming:true },
  { m:"Dez", mf:"Dezembro",  t:"a revelar",             a:"",               bg:"#8b2a4a", fg:"#f6f2e7",  rating:null, upcoming:true },
];

// the real club — name, avatar color, favourite style, club books read, avg rating
const MBC_GIRLS = [
  { name:"Rita",       color:"#e8362a", style:"Romance histórico",   clubRead:5, avg:4.4 },
  { name:"Catarina V.",color:"#2d6fe0", style:"Thriller psicológico",clubRead:5, avg:4.1 },
  { name:"Cláudia",    color:"#8b5cf6", style:"Não-ficção",          clubRead:5, avg:3.9 },
  { name:"Filipa",     color:"#1f6b3b", style:"Fantasia épica",      clubRead:5, avg:4.3 },
  { name:"Daniela",    color:"#ff5e2e", style:"Contemporâneo",       clubRead:4, avg:4.0 },
  { name:"Juliana",    color:"#0e3a5e", style:"Clássicos",           clubRead:4, avg:4.6 },
  { name:"Elizabete",  color:"#6e4a2f", style:"Poesia",              clubRead:2, avg:4.2 },
  { name:"Luísa",      color:"#c2386b", style:"Romance",             clubRead:1, avg:3.8 },
  { name:"Beatriz",    color:"#2e8b8b", style:"Realismo mágico",     clubRead:6, avg:4.5 },
  { name:"Carolina",   color:"#b5483d", style:"Distopia",            clubRead:3, avg:4.0 },
  { name:"Catarina S.",color:"#5b6e1f", style:"Memórias",            clubRead:4, avg:4.2 },
  { name:"Maria",      color:"#9c3587", style:"Histórico",           clubRead:5, avg:4.4 },
  { name:"Marta",      color:"#c0651f", style:"Mistério",            clubRead:3, avg:3.7 },
  { name:"Nádia",      color:"#3a4a7a", style:"Lit. de viagens",     clubRead:2, avg:4.1 },
];

/* ----------------------------------------------------------- ATOMS */

// Colorful book spine with vertical type (ref: JZA shelf)
function Spine({ book, h = 230, onClick, lean = 0 }) {
  const w = 30 + (book.t.length % 4) * 5;
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      title={book.t + ' — ' + book.a}
      style={{ all: "unset", cursor: "pointer", width: w, height: h, background: book.bg,
        color: book.fg, position: "relative", flex: "none", borderRadius: "3px 3px 1px 1px",
        boxShadow: hover
          ? "0 14px 26px -10px rgba(25,21,18,0.5)"
          : "inset 3px 0 0 rgba(255,255,255,0.14), inset -3px 0 0 rgba(0,0,0,0.10)",
        transform: 'translateY(' + (hover ? -10 : 0) + 'px) rotate(' + lean + 'deg)',
        transformOrigin: "bottom center", transition: "transform .18s cubic-bezier(.2,.8,.3,1), box-shadow .18s",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap",
        fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: w * 0.34,
        letterSpacing: "0.04em", textTransform: "uppercase", maxHeight: "84%", overflow: "hidden",
        textOverflow: "ellipsis" }}>{book.t}</span>
      {book.current && <span style={{ position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
        width: 7, height: 7, borderRadius: "50%", background: "#f6f2e7",
        boxShadow: "0 0 0 3px rgba(246,242,231,0.3)" }} />}
    </button>
  );
}

// Capa do livro — mostra a imagem real se disponível, senão design tipográfico
function Poster({ book, w = 250, rot = -3, style = {} }) {
  const h = Math.round(w * 1.38);
  const [imgError, setImgError] = React.useState(false);
  const coverUrl = book.coverUrl || book.cover_url || null;
  const shadow = "0 22px 44px -18px rgba(25,21,18,0.55), 0 2px 0 rgba(0,0,0,0.15)";

  if (coverUrl && !imgError) {
    return (
      <div style={{ width: w, transform: 'rotate(' + rot + 'deg)', flex: "none",
        borderRadius: 4, overflow: "hidden", boxShadow: shadow,
        background: book.bg || "#f6f2e7", lineHeight: 0, ...style }}>
        <img src={coverUrl} alt={book.t} onError={() => setImgError(true)}
          style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
      </div>
    );
  }

  // Fallback tipográfico
  return (
    <div style={{ width: w, height: h, background: book.bg, color: book.fg, position: "relative",
      transform: 'rotate(' + rot + 'deg)', borderRadius: 4, flex: "none", boxShadow: shadow, ...style }}>
      <div style={{ position: "absolute", inset: 0, padding: w * 0.1, display: "flex",
        flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: w * 0.045, letterSpacing: "0.14em",
          textTransform: "uppercase", opacity: 0.85 }}>{book.a}</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: w * 0.16, lineHeight: 0.98,
          fontStyle: "italic", textWrap: "balance" }}>{book.t}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: w * 0.04, letterSpacing: "0.1em",
          display: "flex", justifyContent: "space-between", opacity: 0.85 }}>
          <span>MINI BOOK CLUB</span><span>'26</span></div>
      </div>
    </div>
  );
}

// Sticker pill label
function Pill({ children, bg = "#191512", fg = "#f6f2e7", rot = 0, font = "mono", size = 12, style = {} }) {
  const ff = font === "mono" ? "'Space Mono', monospace"
    : font === "hand" ? "'Caveat', cursive"
    : "'Bricolage Grotesque', sans-serif";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: bg, color: fg,
      fontFamily: ff, fontWeight: font === "grotesk" ? 700 : (font === "hand" ? 600 : 700),
      fontSize: font === "hand" ? size * 1.5 : size, letterSpacing: font === "mono" ? "0.08em" : "0.01em",
      textTransform: font === "mono" ? "uppercase" : "none", padding: font === "hand" ? "2px 14px" : "7px 14px",
      borderRadius: 999, transform: 'rotate(' + rot + 'deg)', lineHeight: 1,
      boxShadow: "0 2px 0 rgba(25,21,18,0.18)", whiteSpace: "nowrap", ...style }}>{children}</span>
  );
}

// book icon — logo mark do Mini Book Club
function BookIcon({ size = 34, color = "#191512", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={style} aria-hidden="true">
      {/* capa do livro */}
      <rect x="8" y="5" width="24" height="31" rx="3" stroke={color} strokeWidth="2.2"/>
      {/* lombada */}
      <line x1="14" y1="5" x2="14" y2="36" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      {/* borda das páginas (direita) */}
      <line x1="32" y1="9" x2="32" y2="32" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
      {/* linhas de texto */}
      <line x1="18.5" y1="14" x2="28" y2="14" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
      <line x1="18.5" y1="19" x2="28" y2="19" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
      <line x1="18.5" y1="24" x2="24"  y2="24" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

// 4-point sparkle
function Sparkle({ size = 26, color = "#191512", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
    </svg>
  );
}

// little cherry doodle (simple circles + stems)
function Cherry({ size = 34, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={style} aria-hidden="true">
      <path d="M11 12 C20 6 28 6 30 14" fill="none" stroke="#1f6b3b" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 13 C12 22 13 26 13 28" fill="none" stroke="#1f6b3b" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M29 14 C27 22 24 26 24 27" fill="none" stroke="#1f6b3b" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="31" r="6.4" fill="#e8362a" stroke="#191512" strokeWidth="1.6" />
      <circle cx="25" cy="30" r="6.4" fill="#e8362a" stroke="#191512" strokeWidth="1.6" />
      <circle cx="10" cy="29" r="1.6" fill="#fff" opacity="0.7" />
    </svg>
  );
}

// hand-drawn curved arrow
function Arrow({ w = 70, color = "#191512", flip = false, style = {} }) {
  return (
    <svg width={w} height={w * 0.7} viewBox="0 0 70 50" style={{ transform: flip ? "scaleX(-1)" : "none", ...style }} aria-hidden="true">
      <path d="M4 8 C28 2 56 8 60 34" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M50 30 L61 36 L58 23" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// marker squiggle underline
function Squiggle({ w = 200, color = "#f4b32c", style = {} }) {
  return (
    <svg width={w} height="14" viewBox={"0 0 " + w + " 14"} preserveAspectRatio="none" style={style} aria-hidden="true">
      <path d={"M2 9 Q " + (w*0.25) + " 2 " + (w*0.5) + " 8 T " + (w-2) + " 7"} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

// washi tape strip
function Tape({ w = 90, rot = -6, color = "rgba(244,179,44,0.7)", style = {} }) {
  return (
    <div style={{ width: w, height: 26, background: color, transform: 'rotate(' + rot + 'deg)',
      boxShadow: "0 1px 4px rgba(0,0,0,0.12)", position: "relative", overflow: "hidden",
      maskImage: "linear-gradient(90deg,transparent 0, #000 4px, #000 calc(100% - 4px), transparent 100%)",
      ...style }}>
      <div style={{ position: "absolute", inset: 0, background:
        "repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)" }} />
    </div>
  );
}

// Avatar de uma membro — foto se disponível, senão inicial colorida
function MemberAvatar({ name, size = 32, border = "2.5px solid #f6f2e7", marginLeft = 0, style = {} }) {
  const g = (typeof MBC_GIRLS !== "undefined" && MBC_GIRLS.find(x => x.name === name)) || { color: "#191512" };
  const base = {
    width: size, height: size, borderRadius: "50%", border, flexShrink: 0,
    marginLeft, boxShadow: "0 2px 5px rgba(25,21,18,0.18)", ...style,
  };
  return g.photoUrl
    ? <img src={g.photoUrl} alt={name} title={name}
        style={{ ...base, objectFit: "cover", display: "block" }} />
    : <div title={name}
        style={{ ...base, background: g.color, display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 700, fontSize: size * 0.42, color: "#fff" }}>
        {name[0]}
      </div>;
}

// overlapping member avatars
function Avatars({ size = 32, max = 5 }) {
  return (
    <div style={{ display: "flex" }}>
      {MBC_GIRLS.slice(0, max).map((g, i) => (
        <MemberAvatar key={g.name} name={g.name} size={size} marginLeft={i ? -size * 0.3 : 0} />
      ))}
    </div>
  );
}

Object.assign(window, { PAL, MBC_BOOKS, MBC_GIRLS,
  Spine, Poster, Pill, Sparkle, Cherry, BookIcon, Arrow, Squiggle, Tape, Avatars, MemberAvatar });
