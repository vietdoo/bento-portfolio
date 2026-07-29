import { booksData, type Book } from "../data/books";

export const GOODREADS_USER_ID = "165632513";
export const GOODREADS_FEED_URL = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}`;

export interface GoodreadsStats {
  total_books: number;
  books_this_year: number;
  total_pages: number;
  estimated_hours: number;
  books_per_year: { year: number; count: number }[];
}

export interface CurrentlyReadingBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  link: string;
}

export interface ReadBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  rating?: number;
  ratingText?: string;
  pages: number;
  read_date: string;
  read_year: number;
  link: string;
}

export interface GoodreadsParsedOutput {
  stats: GoodreadsStats;
  currently_reading: CurrentlyReadingBook[];
  read_books: ReadBook[];
}

function cleanCdata(text: string): string {
  if (!text) return '';
  return text
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function extractTag(itemXml: string, tagName: string): string {
  const match = itemXml.match(new RegExp(`<${tagName}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tagName}>`, 'i'));
  return match ? cleanCdata(match[1]) : '';
}

function extractImageFromDescription(descXml: string): string {
  const imgMatch = descXml.match(/src=["'](https?:\/\/[^"']+)["']/i);
  return imgMatch ? imgMatch[1] : '';
}

function formatDate(dateStr: string): { read_date: string; read_year: number } {
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

function getRatingText(rating: number): string {
  switch (rating) {
    case 5: return "it was amazing";
    case 4: return "really liked it";
    case 3: return "liked it";
    case 2: return "it was ok";
    case 1: return "did not like it";
    default: return "unrated";
  }
}

/**
 * Technical XML Parser for Goodreads RSS feed
 */
export function parseGoodreadsXML(xmlText: string): GoodreadsParsedOutput {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];

  const readBooks: ReadBook[] = [];
  const currentlyReading: CurrentlyReadingBook[] = [];

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
    const link = extractTag(itemXml, 'link') || `https://www.goodreads.com/user/show/${GOODREADS_USER_ID}`;

    if (shelves.includes('currently-reading')) {
      currentlyReading.push({
        id: id || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title,
        author: author || 'Unknown Author',
        cover_url: coverUrl || '/books/ddia.jpg',
        link
      });
    } else if (!shelves.includes('to-read')) {
      readBooks.push({
        id: id || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title,
        author: author || 'Unknown Author',
        cover_url: coverUrl || '/books/ddia.jpg',
        rating: rating > 0 ? rating : undefined,
        ratingText: rating > 0 ? getRatingText(rating) : undefined,
        pages,
        read_date,
        read_year,
        link
      });
    }
  }

  const currentYear = new Date().getFullYear();
  const totalBooks = readBooks.length;
  const booksThisYear = readBooks.filter(b => b.read_year === currentYear).length;
  const totalPages = readBooks.reduce((acc, b) => acc + (b.pages || 0), 0);
  const estimatedHours = parseFloat(((totalPages * 1.5) / 60).toFixed(1));

  const yearCountsMap: Record<number, number> = {};
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
    read_books: readBooks
  };
}

/**
 * Fetches and parses live Goodreads data in JSON Output Format
 */
export async function getParsedGoodreadsData(): Promise<GoodreadsParsedOutput> {
  try {
    const response = await fetch(GOODREADS_FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-Goodreads-Parser/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Goodreads RSS error ${response.status}`);
    }

    const xmlText = await response.text();
    return parseGoodreadsXML(xmlText);
  } catch (error) {
    console.warn("Using fallback cached Goodreads data due to network:", error);
    const read = booksData.filter(b => b.status === 'completed').map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      cover_url: b.coverImage,
      rating: b.rating,
      ratingText: b.ratingText || "it was amazing",
      pages: b.pages || 300,
      read_date: b.dateRead || "Mar 14",
      read_year: parseInt(b.yearRead || "2026", 10),
      link: b.goodreadsUrl || "https://www.goodreads.com/user/show/165632513"
    }));

    const currently = booksData.filter(b => b.status === 'reading').map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      cover_url: b.coverImage,
      link: b.goodreadsUrl || "https://www.goodreads.com/user/show/165632513"
    }));

    const totalPages = read.reduce((acc, b) => acc + b.pages, 0);

    return {
      stats: {
        total_books: read.length,
        books_this_year: read.filter(b => b.read_year === 2026).length,
        total_pages: totalPages,
        estimated_hours: parseFloat(((totalPages * 1.5) / 60).toFixed(1)),
        books_per_year: [
          { year: 2024, count: read.filter(b => b.read_year === 2024).length },
          { year: 2025, count: read.filter(b => b.read_year === 2025).length },
          { year: 2026, count: read.filter(b => b.read_year === 2026).length }
        ]
      },
      currently_reading: currently,
      read_books: read
    };
  }
}

/**
 * Compatibility helper function for Astro UI
 */
export async function getLiveGoodreadsBooks(): Promise<Book[]> {
  try {
    const data = await getParsedGoodreadsData();
    const liveBooks: Book[] = [];

    // Add currently reading
    data.currently_reading.forEach(b => {
      const match = booksData.find(existing => existing.title.toLowerCase().includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(existing.title.toLowerCase()));
      if (match) {
        liveBooks.push({ ...match, status: 'reading', statusLabel: 'Đang đọc' });
      } else {
        liveBooks.push({
          id: b.id,
          title: b.title,
          author: b.author,
          category: 'tech',
          categoryLabel: 'Technical Book',
          status: 'reading',
          statusLabel: 'Đang đọc',
          coverImage: b.cover_url,
          yearRead: '2026',
          dateRead: 'Currently Reading',
          summary: 'Currently reading book on Goodreads.',
          review: 'Synced from Goodreads profile.',
          keyTakeaways: ['Goodreads live sync'],
          goodreadsUrl: b.link,
          tags: ['Goodreads', 'Reading']
        });
      }
    });

    // Add read books
    data.read_books.forEach(b => {
      const match = booksData.find(existing => existing.title.toLowerCase().includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(existing.title.toLowerCase()));
      if (match) {
        liveBooks.push({
          ...match,
          status: 'completed',
          statusLabel: 'Đã đọc',
          rating: b.rating || match.rating,
          ratingText: b.ratingText || match.ratingText,
          yearRead: b.read_year ? b.read_year.toString() : match.yearRead,
          dateRead: b.read_date || match.dateRead
        });
      } else {
        liveBooks.push({
          id: b.id,
          title: b.title,
          author: b.author,
          category: 'tech',
          categoryLabel: 'Book',
          status: 'completed',
          statusLabel: 'Đã đọc',
          coverImage: b.cover_url,
          rating: b.rating,
          ratingText: b.ratingText,
          pages: b.pages,
          yearRead: b.read_year ? b.read_year.toString() : '2026',
          dateRead: b.read_date,
          summary: 'Read book synced from Goodreads.',
          review: 'Synced from Goodreads profile.',
          keyTakeaways: ['Goodreads live sync'],
          goodreadsUrl: b.link,
          tags: ['Goodreads', 'Read']
        });
      }
    });

    // Append remaining books from local data so books shelf is always full and rich
    booksData.forEach(b => {
      if (!liveBooks.some(lb => lb.id === b.id || lb.title.toLowerCase() === b.title.toLowerCase())) {
        liveBooks.push(b);
      }
    });

    return liveBooks;
  } catch (err) {
    console.warn("getLiveGoodreadsBooks error fallback to booksData:", err);
    return booksData;
  }
}
