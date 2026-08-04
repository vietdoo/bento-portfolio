import { db, Guestbook as GuestbookTable, desc, count } from "astro:db";
import type { APIRoute } from "astro";
import { normalizeWebsiteUrl } from "../../lib/guestbook";

const ITEMS_PER_PAGE = 10;

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));

    const totalResult = await db
      .select({ total: count() })
      .from(GuestbookTable);
    const total = totalResult[0]?.total ?? 0;

    const entries = await db
      .select()
      .from(GuestbookTable)
      .orderBy(desc(GuestbookTable.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset((page - 1) * ITEMS_PER_PAGE);

    return new Response(
      JSON.stringify({
        entries,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching guestbook entries:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch guestbook entries" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, message, website } = data;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!trimmedName || !trimmedMessage) {
      return new Response(
        JSON.stringify({ error: "Name and message are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const cleanWebsite = normalizeWebsiteUrl(website);

    const result = await db
      .insert(GuestbookTable)
      .values({
        name: trimmedName.slice(0, 100),
        message: trimmedMessage.slice(0, 1000),
        website: cleanWebsite ? cleanWebsite.slice(0, 200) : undefined,
        heartCount: 0,
        createdAt: new Date(),
      })
      .returning();

    return new Response(JSON.stringify(result[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating guestbook entry:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create guestbook entry" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

