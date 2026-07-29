import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';

const GOODREADS_FEED_URL = "https://www.goodreads.com/review/list_rss/165632513";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-Goodreads-Parser/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function cleanCdata(text) {
  if (!text) return '';
  return text
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function extractTag(itemXml, tagName) {
  const match = itemXml.match(new RegExp(`<${tagName}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tagName}>`, 'i'));
  return match ? cleanCdata(match[1]) : '';
}

function extractImageFromDescription(descXml) {
  const imgMatch = descXml.match(/src=["'](https?:\/\/[^"']+)["']/i);
  return imgMatch ? imgMatch[1] : '';
}

function formatDate(dateStr) {
  if (!dateStr) return { read_date: 'Recently', read_year: 2026 };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { read_date: dateStr, read_year: 2026 };
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  
  return {
    read_date: `${m} ${day}`,
    read_year: year
  };
}

export function parseGoodreadsXML(xmlText) {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
  
  const readBooks = [];
  const currentlyReading = [];
  const wantToRead = [];

  for (const itemXml of items) {
    const id = extractTag(itemXml, 'guid') || extractTag(itemXml, 'book_id') || extractTag(itemXml, 'id');
    const title = extractTag(itemXml, 'title') || extractTag(itemXml, 'book_title');
    const author = extractTag(itemXml, 'author_name') || extractTag(itemXml, 'author');
    
    let coverUrl = extractTag(itemXml, 'book_large_image_url') || extractTag(itemXml, 'book_medium_image_url') || extractTag(itemXml, 'book_image_url');
    if (!coverUrl || coverUrl.includes('nopic')) {
      const desc = extractTag(itemXml, 'description');
      const fallbackImg = extractImageFromDescription(desc);
      if (fallbackImg) coverUrl = fallbackImg;
    }

    const pagesRaw = extractTag(itemXml, 'num_pages') || extractTag(itemXml, 'book_num_pages');
    const pages = pagesRaw ? parseInt(pagesRaw, 10) : 0;
    
    const ratingRaw = extractTag(itemXml, 'user_rating');
    const rating = ratingRaw ? parseInt(ratingRaw, 10) : 0;
    
    const readAtRaw = extractTag(itemXml, 'user_read_at') || extractTag(itemXml, 'user_date_created') || extractTag(itemXml, 'pubDate');
    const { read_date, read_year } = formatDate(readAtRaw);

    const shelves = extractTag(itemXml, 'user_shelves').toLowerCase();
    const link = extractTag(itemXml, 'link') || `https://www.goodreads.com/review/show/${id}`;

    const bookObj = {
      id: id || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title,
      author: author || 'Unknown Author',
      cover_url: coverUrl || '/books/ddia.jpg',
      rating: rating > 0 ? rating : undefined,
      pages,
      read_date,
      read_year,
      link
    };

    if (shelves.includes('currently-reading')) {
      currentlyReading.push({
        id: bookObj.id,
        title: bookObj.title,
        author: bookObj.author,
        cover_url: bookObj.cover_url,
        link: bookObj.link
      });
    } else if (shelves.includes('to-read')) {
      wantToRead.push(bookObj);
    } else {
      readBooks.push(bookObj);
    }
  }

  // Calculate statistics
  const currentYear = new Date().getFullYear();
  const totalBooks = readBooks.length;
  const booksThisYear = readBooks.filter(b => b.read_year === currentYear).length;
  const totalPages = readBooks.reduce((acc, b) => acc + (b.pages || 0), 0);
  const estimatedHours = parseFloat(((totalPages * 1.5) / 60).toFixed(1));

  // Books per year
  const yearCountsMap = {};
  for (const b of readBooks) {
    const yr = b.read_year || 2026;
    yearCountsMap[yr] = (yearCountsMap[yr] || 0) + 1;
  }

  const booksPerYear = [2024, 2025, 2026].map(yr => ({
    year: yr,
    count: yearCountsMap[yr] || 0
  }));

  return {
    stats: {
      total_books: totalBooks,
      books_this_year: booksThisYear,
      total_pages: totalPages,
      estimated_hours: estimatedHours,
      books_per_year: booksPerYear
    },
    currently_reading: currentlyReading,
    read_books: readBooks,
    want_to_read: wantToRead
  };
}

async function main() {
  console.log(`Fetching RSS from ${GOODREADS_FEED_URL}...`);
  try {
    const xml = await fetchUrl(GOODREADS_FEED_URL);
    const result = parseGoodreadsXML(xml);
    console.log(JSON.stringify(result, null, 2));
    fs.writeFileSync('public/books-goodreads-data.json', JSON.stringify(result, null, 2), 'utf-8');
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

main();
