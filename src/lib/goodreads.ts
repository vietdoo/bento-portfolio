export const GOODREADS_USER_ID = "165632513";
export const GOODREADS_FEED_URL = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}`;

export interface GoodreadsBook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  category: "tech" | "selfhelp";
  categoryLabel: string;
  status: "reading" | "completed" | "want-to-read";
  statusLabel: string;
  coverImage: string;
  rating?: number;
  ratingText?: string;
  progress?: number;
  currentChapter?: string;
  pages?: number;
  yearRead: string;
  dateRead?: string;
  monthRead?: number;
  quote?: string;
  summary: string;
  review: string;
  keyTakeaways: string[];
  link: string;
  goodreadsUrl: string;
  tags: string[];
}

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

function formatDate(dateStr: string): { read_date: string; read_year: number; monthRead: number } {
  if (!dateStr) return { read_date: 'Recently', read_year: 2023, monthRead: 5 };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { read_date: dateStr, read_year: 2023, monthRead: 5 };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return {
    read_date: `${m} ${day}`,
    read_year: year,
    monthRead: d.getMonth() + 1
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

function determineCategory(title: string): { category: "tech" | "selfhelp"; categoryLabel: string } {
  const lower = title.toLowerCase();
  if (lower.includes("data") || lower.includes("warehouse") || lower.includes("designing") || lower.includes("programming") || lower.includes("code")) {
    return { category: "tech", categoryLabel: "Tech IT" };
  }
  return { category: "selfhelp", categoryLabel: "Self-Help" };
}

/**
 * Parses raw XML RSS text STRICTLY from Goodreads
 */
export function parseGoodreadsXMLToBooks(xmlText: string): GoodreadsBook[] {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const books: GoodreadsBook[] = [];

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
    if (coverUrl) {
      coverUrl = coverUrl.replace(/\._S[XY]\d+_\./, '._SX318_.');
    }

    const pagesRaw = extractTag(itemXml, 'num_pages') || extractTag(itemXml, 'book_num_pages');
    const pages = pagesRaw ? parseInt(pagesRaw, 10) : 0;

    const ratingRaw = extractTag(itemXml, 'user_rating');
    const rating = ratingRaw ? parseInt(ratingRaw, 10) : 0;

    const readAtRaw = extractTag(itemXml, 'user_read_at') || extractTag(itemXml, 'user_date_created') || extractTag(itemXml, 'pubDate');
    const { read_date, read_year, monthRead } = formatDate(readAtRaw);

    const shelves = extractTag(itemXml, 'user_shelves').toLowerCase();
    const link = extractTag(itemXml, 'link') || `https://www.goodreads.com/user/show/${GOODREADS_USER_ID}`;
    const userReview = extractTag(itemXml, 'user_review');

    const status: "reading" | "completed" | "want-to-read" = shelves.includes('currently-reading')
      ? "reading"
      : shelves.includes('to-read')
      ? "want-to-read"
      : "completed";

    const statusLabel = status === "reading" ? "Đang đọc" : status === "want-to-read" ? "Dự định" : "Đã đọc";
    const { category, categoryLabel } = determineCategory(title);

    books.push({
      id: id || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title,
      author: author || 'Unknown Author',
      category,
      categoryLabel,
      status,
      statusLabel,
      coverImage: coverUrl || 'https://s.gr-assets.com/assets/nophoto/user/u_225x300-26801085688d151294319b635701ce49.png',
      rating: rating > 0 ? rating : undefined,
      ratingText: rating > 0 ? getRatingText(rating) : undefined,
      pages,
      yearRead: read_year.toString(),
      dateRead: read_date,
      monthRead,
      summary: userReview ? userReview : `Book tracked on Goodreads user profile (${GOODREADS_USER_ID}).`,
      review: userReview ? userReview : `Ghi chú và đánh giá được đồng bộ trực tiếp từ Goodreads profile @${GOODREADS_USER_ID}.`,
      keyTakeaways: [
        `Nguồn dữ liệu: Goodreads RSS Feed (Profile ID: ${GOODREADS_USER_ID})`,
        `Trạng thái kệ sách: ${shelves || status}`
      ],
      link,
      goodreadsUrl: link,
      tags: ["Goodreads", categoryLabel]
    });
  }

  return books;
}

/**
 * Fetches STRICTLY live books from Goodreads RSS feed (No manual/fallback books added)
 */
export async function getLiveGoodreadsBooks(): Promise<GoodreadsBook[]> {
  try {
    const response = await fetch(GOODREADS_FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-Goodreads-Only/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Goodreads RSS returned HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    return parseGoodreadsXMLToBooks(xmlText);
  } catch (error) {
    console.error("Strict Goodreads RSS fetch error:", error);
    // Return empty array if unreachable so NO hardcoded non-Goodreads books are ever shown
    return [];
  }
}

/**
 * Parses raw XML RSS text to JSON output format
 */
export function parseGoodreadsXML(xmlText: string): GoodreadsParsedOutput {
  const books = parseGoodreadsXMLToBooks(xmlText);
  const readBooks: ReadBook[] = books.filter(b => b.status === 'completed').map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    cover_url: b.coverImage,
    rating: b.rating,
    ratingText: b.ratingText,
    pages: b.pages || 0,
    read_date: b.dateRead || 'Recently',
    read_year: parseInt(b.yearRead, 10),
    link: b.goodreadsUrl
  }));

  const currentlyReading: CurrentlyReadingBook[] = books.filter(b => b.status === 'reading').map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    cover_url: b.coverImage,
    link: b.goodreadsUrl
  }));

  const currentYear = new Date().getFullYear();
  const totalBooks = readBooks.length;
  const booksThisYear = readBooks.filter(b => b.read_year === currentYear).length;
  const totalPages = readBooks.reduce((acc, b) => acc + (b.pages || 0), 0);
  const estimatedHours = parseFloat(((totalPages * 1.5) / 60).toFixed(1));

  const yearCountsMap: Record<number, number> = {};
  for (const b of readBooks) {
    const yr = b.read_year || 2023;
    yearCountsMap[yr] = (yearCountsMap[yr] || 0) + 1;
  }

  const booksPerYear = [2023, 2024, 2025, 2026].map(yr => ({
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

export async function getParsedGoodreadsData(): Promise<GoodreadsParsedOutput> {
  try {
    const response = await fetch(GOODREADS_FEED_URL);
    const xml = await response.text();
    return parseGoodreadsXML(xml);
  } catch (err) {
    return {
      stats: { total_books: 0, books_this_year: 0, total_pages: 0, estimated_hours: 0, books_per_year: [] },
      currently_reading: [],
      read_books: []
    };
  }
}
