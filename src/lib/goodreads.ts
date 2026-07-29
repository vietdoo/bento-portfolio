import { booksData, type Book } from "../data/books";

/**
 * Technical Goodreads Sync Utility
 * 
 * Goodreads provides public RSS feeds for user shelves:
 * - currently-reading: https://www.goodreads.com/review/list_rss/USER_ID?shelf=currently-reading
 * - read: https://www.goodreads.com/review/list_rss/USER_ID?shelf=read
 * - to-read: https://www.goodreads.com/review/list_rss/USER_ID?shelf=to-read
 */

export interface GoodreadsFeedItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  goodreadsUrl: string;
  userRating?: number;
  userReview?: string;
  shelves: string;
  pubDate?: string;
}

const GOODREADS_USER_ID = "vietdoo"; // Configured profile handle

/**
 * Parses XML text from Goodreads RSS feed into structured items
 */
export function parseGoodreadsRSS(xmlText: string): GoodreadsFeedItem[] {
  const items: GoodreadsFeedItem[] = [];
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

  for (const itemXml of itemMatches) {
    const getTagValue = (tagName: string) => {
      const match = itemXml.match(new RegExp(`<${tagName}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tagName}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const title = getTagValue('title');
    const author = getTagValue('author_name') || getTagValue('author');
    const coverImage = getTagValue('book_large_image_url') || getTagValue('book_image_url') || getTagValue('image_url');
    const goodreadsUrl = getTagValue('link');
    const ratingStr = getTagValue('user_rating');
    const userReview = getTagValue('user_review');
    const bookId = getTagValue('book_id') || getTagValue('guid');

    if (title) {
      items.push({
        id: bookId || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title,
        author: author || 'Unknown Author',
        coverImage: coverImage || '/books/ddia.jpg',
        goodreadsUrl: goodreadsUrl || `https://www.goodreads.com/user/show/${GOODREADS_USER_ID}`,
        userRating: ratingStr ? parseFloat(ratingStr) : undefined,
        userReview: userReview ? userReview.replace(/<[^>]*>/g, '') : undefined,
        shelves: getTagValue('user_shelves'),
        pubDate: getTagValue('pubDate')
      });
    }
  }

  return items;
}

/**
 * Fetches live Goodreads reading lists dynamically
 */
export async function getLiveGoodreadsBooks(): Promise<Book[]> {
  try {
    const rssUrl = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}`;
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Portfolio-Goodreads-Sync/1.0'
      },
      signal: AbortSignal.timeout(4000) // 4 second timeout
    });

    if (!response.ok) {
      throw new Error(`Goodreads RSS returned status ${response.status}`);
    }

    const xmlText = await response.text();
    const liveItems = parseGoodreadsRSS(xmlText);

    if (liveItems.length === 0) {
      return booksData;
    }

    // Merge live Goodreads items with curated data
    return liveItems.map((item) => {
      const existing = booksData.find((b) => b.title.toLowerCase().includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(b.title.toLowerCase()));
      if (existing) {
        return {
          ...existing,
          rating: item.userRating || existing.rating,
          goodreadsUrl: item.goodreadsUrl || existing.goodreadsUrl
        };
      }
      return {
        id: item.id,
        title: item.title,
        author: item.author,
        category: "tech",
        categoryLabel: "Technical Book",
        status: item.shelves.includes("currently-reading") ? "reading" : item.shelves.includes("to-read") ? "want-to-read" : "completed",
        statusLabel: item.shelves.includes("currently-reading") ? "Đang đọc" : item.shelves.includes("to-read") ? "Dự định" : "Đã đọc",
        coverImage: item.coverImage,
        rating: item.userRating,
        summary: item.userReview || "Synced from Goodreads profile.",
        review: item.userReview || "Ghi chú đồng bộ từ Goodreads profile.",
        keyTakeaways: ["Đồng bộ trực tiếp từ Goodreads profile vietdoo"],
        goodreadsUrl: item.goodreadsUrl,
        tags: ["Goodreads", "Synced"]
      };
    });
  } catch (error) {
    console.warn("Goodreads live sync fallback to cached booksData:", error);
    return booksData;
  }
}
