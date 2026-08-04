import type { APIRoute } from "astro";
import { GOODREADS_FEED_URL, parseGoodreadsXMLToBooks, parseGoodreadsXML } from "../../lib/goodreads";

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(GOODREADS_FEED_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity-Goodreads-Live/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Goodreads RSS returned HTTP ${response.status}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const xmlText = await response.text();
    const books = parseGoodreadsXMLToBooks(xmlText);
    const parsedData = parseGoodreadsXML(xmlText);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: "165632513",
        fetched_at: new Date().toISOString(),
        books,
        stats: parsedData.stats,
        currently_reading: parsedData.currently_reading,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to fetch Goodreads RSS" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
