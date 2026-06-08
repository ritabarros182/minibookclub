// mbc-bingo-data.jsx — seasons (3x3), challenges, member progress, mini components
// Loaded after mbc-atoms + mbc-chrome (needs MBC_GIRLS, ME)
// Exports: SEASONS, bingoKey, getMyMarks, marksToBools, getMemberMarks, countMarks,
//          MiniGrid, MiniCover, BINGO_COLORS

const SEASONS = [
  { id:"inverno",   name:"Inverno",   range:"Jan–Mar", icon:"❄️", color:"#2d6fe0", status:"done",
    challenges:["Aquece a alma","Capa azul","Lido na manta","+400 páginas","Um clássico","Autora nórdica","Passa-se no inverno","Recomendado por uma amiga","Um policial"] },
  { id:"primavera", name:"Primavera", range:"Abr–Jun", icon:"🌸", color:"#ff7eb6", status:"current",
    challenges:["Autora portuguesa","Capa florida","−200 páginas","Publicado este ano","Estreia de autora","Um romance","Lido ao ar livre","Fez-te sorrir","Rosa na capa"] },
  { id:"verao",     name:"Verão",     range:"Jul–Set", icon:"☀️", color:"#f4b32c", status:"locked",
    challenges:["Lido na praia","Uma aventura","−300 páginas","Romance de verão","Autora estrangeira","Capa amarela","Lido num só dia","Numa ilha","Comprado em viagem"] },
  { id:"outono",    name:"Outono",    range:"Out–Dez", icon:"🍂", color:"#ff5e2e", status:"locked",
    challenges:["História de fantasmas","Tons quentes","Clássico que adiavas","+500 páginas","Ganhou um prémio","Adaptado ao cinema","Fez-te chorar","Mistério","Lido com chá"] },
];

// colours assigned to bingo book covers as you fill squares
const BINGO_COLORS = ["#e8362a","#2d6fe0","#1f6b3b","#8b5cf6","#ff5e2e","#0e3a5e","#c2386b","#2e8b8b","#f4b32c"];

const bingoKey = (seasonId) => "mbc-bingo-" + seasonId;  // mantido para compatibilidade

/** Retorna as marcas de um membro para uma estação (do cache Supabase) */
function getMemberMarksObj(memberName, seasonId) {
  const key = seasonId + '|' + memberName;
  return (window.MBC_BINGO_ENTRIES && window.MBC_BINGO_ENTRIES[key]) || {};
}

/** Retorna as marcas do utilizador atual (objeto {0: {...}, 3: {...}} etc.) */
function getMyMarks(seasonId) {
  return getMemberMarksObj(ME ? ME.name : '', seasonId);
}

function marksToBools(obj) { return Array.from({ length: 9 }, (_, i) => !!obj[i]); }

function getMemberMarks(name, season) {
  if (season.status === "locked") return Array(9).fill(false);
  return marksToBools(getMemberMarksObj(name, season.id));
}

function countMarks(bools) { return bools.filter(Boolean).length; }

// mantido para compatibilidade
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let x = seed || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }

// detect completed line / column / diagonal / full bingo from a 3x3
const BINGO_LINES = {
  rows:  [[0,1,2],[3,4,5],[6,7,8]],
  cols:  [[0,3,6],[1,4,7],[2,5,8]],
  diags: [[0,4,8],[2,4,6]],
};
function bingoLines(bools) {
  const all = (arr) => arr.every(i => bools[i]);
  const rows = BINGO_LINES.rows.filter(all).length;
  const cols = BINGO_LINES.cols.filter(all).length;
  const diags = BINGO_LINES.diags.filter(all).length;
  const bingo = bools.every(Boolean);
  return { rows, cols, diags, bingo, line: rows > 0, col: cols > 0, diag: diags > 0 };
}

// row of LINHA / COLUNA / DIAGONAL / BINGO chips, lit when achieved
function LineBadges({ bools, color = "#1f6b3b", size = "sm" }) {
  const L = bingoLines(bools);
  const items = [
    { k: "LINHA",    on: L.line },
    { k: "COLUNA",   on: L.col },
    { k: "DIAGONAL", on: L.diag },
    { k: "BINGO",    on: L.bingo },
  ];
  return (
    <div className={"line-badges" + (size === "lg" ? " lb-lg" : "")}>
      {items.map(it => (
        <span key={it.k} className={"lbadge" + (it.on ? " on" : "")}
          style={it.on ? { background: color, borderColor: "#191512", color: "#fff" } : null}>
          {it.on ? "\u2713 " : ""}{it.k}</span>
      ))}
    </div>
  );
}

// 3x3 mini progress grid (evolution + profile views)
function MiniGrid({ bools, color = "#1f6b3b", size = 16, gap = 4 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, " + size + "px)", gap }}>
      {bools.map((b, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: 4,
          background: b ? color : "#e3ddca",
          boxShadow: b ? "inset 0 0 0 1.5px rgba(0,0,0,0.18)" : "none",
          display: "grid", placeItems: "center", color: "#fff", fontSize: size * 0.6, fontWeight: 800 }}>
          {b ? "✓" : ""}</div>
      ))}
    </div>
  );
}

// mini book cover that fills a marked bingo square
function MiniCover({ title, author, color }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: color, color: "#f6f2e7",
      borderRadius: 8, padding: "9px 11px 10px", display: "flex", flexDirection: "column",
      justifyContent: "space-between", textAlign: "left", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "rgba(255,255,255,0.18)" }} />
      <div style={{ fontFamily: "'DM Serif Display',serif", fontStyle: "italic", fontSize: 14, lineHeight: 1.0,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, letterSpacing: ".04em",
        textTransform: "uppercase", opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{author}</div>
    </div>
  );
}

Object.assign(window, { SEASONS, BINGO_COLORS, bingoKey, getMyMarks, marksToBools,
  getMemberMarks, countMarks, hashStr, MiniGrid, MiniCover, bingoLines, LineBadges });
