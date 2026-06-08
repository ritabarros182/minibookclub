// mbc-books-api.jsx — Google Books API
// Exports: fetchBookInfo
// Carregar ANTES de mbc-sections.jsx

// Cole aqui a tua chave da Google Books API.
// Ver SETUP.md para instruções.
const GOOGLE_BOOKS_KEY = 'AIzaSyAW1SNR7fJBtvUcJmkIcicHDjqs1lygDjM';

const _booksCache = {};

/**
 * Vai buscar metadados de um livro à Google Books API.
 * Devolve { description, categories, year, pages, cover } ou null se falhar.
 * Resultados ficam em cache para não repetir pedidos.
 */
async function fetchBookInfo(title, author) {
  const cacheKey = title + '|' + (author || '');
  if (cacheKey in _booksCache) return _booksCache[cacheKey];

  try {
    const q = 'intitle:' + encodeURIComponent(title) +
              (author ? '+inauthor:' + encodeURIComponent(author) : '');
    const url = 'https://www.googleapis.com/books/v1/volumes?q=' + q +
                '&maxResults=1&key=' + GOOGLE_BOOKS_KEY;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const info = data.items && data.items[0] && data.items[0].volumeInfo;
    if (!info) { _booksCache[cacheKey] = null; return null; }

    const result = {
      description: info.description
        ? info.description.replace(/<[^>]+>/g, '').trim()
        : null,
      categories: info.categories || [],
      year:  info.publishedDate ? info.publishedDate.slice(0, 4) : null,
      pages: info.pageCount || null,
      cover: info.imageLinks && info.imageLinks.thumbnail
        ? info.imageLinks.thumbnail.replace('http:', 'https:')
        : null,
      language: info.language || null,
    };
    _booksCache[cacheKey] = result;
    return result;
  } catch(e) {
    console.warn('fetchBookInfo error:', title, e);
    _booksCache[cacheKey] = null;
    return null;
  }
}

Object.assign(window, { fetchBookInfo });
