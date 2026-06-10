// mbc-reviews.jsx — reviews (title + body), pickers, recommendations, synopses, member stats
// Loaded after mbc-atoms + mbc-chrome (needs MBC_BOOKS, MBC_GIRLS, ME)

// Quem escolheu o livro de cada mês — 2026
const PICKERS = {
  Jan:"Beatriz",    Fev:"Daniela",  Mar:"Catarina S.", Abr:"Cláudia", Mai:"Luísa", Jun:"Nádia",
  Jul:"",           Ago:"",         Set:"",             Out:"",        Nov:"",      Dez:"",
};

// Sinopses reais vindas do Notion
const SYN = {
  "A Teoria do Amor":
    "A física teórica Elsie Hannaway está na iminência de ser apanhada pela curva pelas muitas vidas que leva. Durante a maior parte dos dias, é professora adjunta, sonhando com um estatuto profissional que lhe dê estabilidade. Noutros dias, como forma de compensar o inexistente salário, exerce o papel de falsa namorada — até que o seu próprio universo desaba.",
  "Anatomy: A Love Story":
    "Edinburgh, 1817. Hazel Sinnett é uma lady que quer ser cirurgiã mais do que quer casar. Jack Currer é um ladrão de cadáveres que apenas tenta sobreviver numa cidade onde é fácil morrer. Quando os dois se cruzam, Hazel percebe que Jack pode ser mais útil do que parece — e que os segredos enterrados não estão só nas covas.",
  "Butcher & Blackbird":
    "Cada serial killer precisa de um amigo. Cada jogo tem de ter um vencedor. Quando um encontro fortuito une os assassinos rivais Sloane e Rowan, os dois encontram algo raro: a amizade de uma alma sombria semelhante à sua. Mas enquanto o jogo entre eles evolui para algo mais, os fantasmas que deixaram para trás aproximam-se.",
  "Panenka":
    "O seu nome era Joseph, mas todos lhe chamavam Panenka — um nome que carregava a sua tristeza e a sua história. Panenka passou 25 anos a viver com os erros desastrosos do seu passado, que o tornaram um exilado na sua própria cidade. Agora, aos 50 anos, começa a reconstruir uma família improvisada — e encontra Esther.",
  "Uma Tempestade de Chá":
    "Arthie Casimir, brilhante criminosa e colecionadora de segredos, é famosa em White Roaring. O seu exclusivo salão de chá é frequentado pela elite durante o dia — mas à noite serve sangue para os vampiros que a sociedade teme. Quando o estabelecimento é ameaçado, Arthie aliará forças com um inimigo antigo para se infiltrar na sinistra comunidade conhecida como Athereum.",
  "Ninth House":
    "Galaxy 'Alex' Stern é a membro mais improvável da turma de caloiros de Yale. Criada nos subúrbios de Los Angeles, abandonou os estudos cedo e entrou num mundo de namorados traficantes e trabalhos sem futuro. Quando sobrevive sozinha a um homicídio múltiplo, é-lhe oferecida uma segunda oportunidade: frequentar uma das universidades mais conceituadas do mundo. A missão? Monitorizar as atividades das sociedades secretas de Yale — cujas práticas ocultas se revelam mais sinistras do que qualquer paranoia imaginaria.",
};

function goodreadsUrl(book) {
  return "https://www.goodreads.com/search?q=" + encodeURIComponent(book.t + " " + (book.a || ""));
}

// Reviews reais do Notion — 2026
// Janeiro: A Teoria do Amor (Ali Hazelwood)
const MBC_REVIEWS = {
  "A Teoria do Amor": [
    { by:"Rita",        r:4, t:"Fofo",                  more:"É o clássico romance fofinho, mas para quem já leu mais livros da autora, este não é o meu preferido. Ainda assim, a Ali não desaponta." },
    { by:"Catarina V.", r:4, t:"Clássico Ali",           more:"Para mim foi uma releitura, mas acho que gostei mais desta vez que da primeira vez que li. Provavelmente porque já não lia um livro académico dela há algum tempo. Adoro as referências a Twilight." },
    { by:"Cláudia",     r:4, t:"Releitura cute",         more:"Para mim foi uma releitura (primeira vez em 2023) e não me lembrava de muita coisa. É um romance fofinho, com a parte das girlies num mundo dominado por homens e essa parte gostei muito. Adorei o Jack, bom book boyfriend! O audiobook é muito bom, recomendo." },
    { by:"Daniela",     r:3, t:"Fofo",                   more:"Este é o segundo livro que leio da autora e, embora tenha gostado mais do que do primeiro, continua a não ser bem o meu género. No fundo é um romance fofo, mas que podia ser reduzido a metade, caso existisse boa comunicação." },
    { by:"Catarina S.", r:3, t:"Leitura rápida e fácil", more:"É a minha segunda oportunidade com livros da Ali Hazelwood e finalmente tenho de admitir que o estilo de escrita dela não é para mim. O romance é cliché mas fofo e gostei bastante dos detalhes da diabetes. Mas escrever sex scenes sabe bem." },
    { by:"Filipa",      r:4, t:"Science Bitch!",         more:"Estar em ciência é giro e tal até certo ponto. Tal como a Elsie estou estagnada na minha posição, pobre e com uma chefe bem questionável. A falta de comunicação ao início estava a matar-me. No geral foi fofo, gostei bastante!" },
  ],
  // Fevereiro–Maio: reviews a atualizar
  "Anatomy: A Love Story": [],
  "Butcher & Blackbird":   [],
  "Panenka":               [],
  "Uma Tempestade de Chá": [],
  "Ninth House":           [],
};

const ALL_RECS = [
  { by:"Rita",        t:"Stoner",                        a:"John Williams",   genre:"Romance literário", bg:"#2d6fe0", fg:"#f6f2e7", q:"chorei do início ao fim." },
  { by:"Catarina V.", t:"Vê com os Olhos Fechados",      a:"Tana French",     genre:"Thriller",          bg:"#1f6b3b", fg:"#f6f2e7", q:"não adivinhei o final." },
  { by:"Cláudia",     t:"Sapiens",                       a:"Y. N. Harari",    genre:"Não-ficção",        bg:"#6e4a2f", fg:"#f6f2e7", q:"mudou-me a cabeça." },
  { by:"Juliana",     t:"Mrs. Dalloway",                 a:"Virginia Woolf",  genre:"Clássico",          bg:"#0e3a5e", fg:"#f6f2e7", q:"um dia inteiro numa frase." },
  { by:"Beatriz",     t:"A Casa dos Espíritos",          a:"Isabel Allende",  genre:"Realismo mágico",   bg:"#8b5cf6", fg:"#f6f2e7", q:"realismo mágico no auge." },
  { by:"Carolina",    t:"Nunca Me Deixes",               a:"Kazuo Ishiguro",  genre:"Ficção científica", bg:"#e8362a", fg:"#f6f2e7", q:"devastador e perfeito." },
  { by:"Filipa",      t:"O Nome do Vento",               a:"Patrick Rothfuss",genre:"Fantasia",          bg:"#c2386b", fg:"#f6f2e7", q:"queria viver lá dentro." },
  { by:"Rita",        t:"A Insustentável Leveza do Ser", a:"Milan Kundera",   genre:"Romance literário", bg:"#ff5e2e", fg:"#f6f2e7", q:"nunca mais fui a mesma." },
  { by:"Maria",       t:"Memórias de Adriano",           a:"M. Yourcenar",    genre:"Histórico",         bg:"#5b6e1f", fg:"#f6f2e7", q:"história como poesia." },
];

function clubAvg(title) {
  const rs = MBC_REVIEWS[title];
  if (!rs || !rs.length) return null;
  return rs.reduce((s, x) => s + x.r, 0) / rs.length;
}
function reviewsBy(name) {
  const out = [];
  Object.keys(MBC_REVIEWS).forEach(title => {
    const mine = MBC_REVIEWS[title].find(x => x.by === name);
    if (mine) {
      const book = MBC_BOOKS.find(b => b.t === title);
      out.push({ title, author: book ? book.a : "", month: book ? book.m : "", r: mine.r, t: mine.t, more: mine.more,
        bg: book ? book.bg : "#191512", fg: book ? book.fg : "#fff",
        coverUrl: book ? (book.coverUrl || book.cover_url || null) : null });
    }
  });
  return out;
}
function picksBy(name) { return MBC_BOOKS.filter(b => PICKERS[b.m] === name); }
function recsBy(name) { return ALL_RECS.filter(r => r.by === name); }

function statsFor(name) {
  const g = MBC_GIRLS.find(x => x.name === name) || { clubRead: 0, avg: 0 };
  return {
    avg: g.avg.toFixed(1), read: g.clubRead,
    totalClub: MBC_BOOKS.filter(b => !b.upcoming).length,
    reviews: reviewsBy(name).length, picks: picksBy(name).length, recs: recsBy(name).length, style: g.style,
  };
}

const MY_RECS = recsBy(ME.name);
function myReviews() { return reviewsBy(ME.name); }
function myPicks() { return picksBy(ME.name); }
function myStats() { return statsFor(ME.name); }

Object.assign(window, { MBC_REVIEWS, PICKERS, ALL_RECS, SYN, goodreadsUrl, clubAvg, reviewsBy, picksBy, recsBy,
  statsFor, myReviews, myPicks, MY_RECS, myStats });
