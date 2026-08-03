import { db, BlogComment as BlogCommentTable, eq, desc } from "astro:db";
import type { APIRoute } from "astro";
import sanitizeHtml from "sanitize-html";

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Blog post slug parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const comments = await db
      .select({
        id: BlogCommentTable.id,
        postSlug: BlogCommentTable.postSlug,
        name: BlogCommentTable.name,
        website: BlogCommentTable.website,
        content: BlogCommentTable.content,
        createdAt: BlogCommentTable.createdAt,
      })
      .from(BlogCommentTable)
      .where(eq(BlogCommentTable.postSlug, slug))
      .orderBy(desc(BlogCommentTable.createdAt));

    return new Response(JSON.stringify({ comments }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=10, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching blog comments:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch comments" }),
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
    const { postSlug, name, email, website, content } = data;

    if (!postSlug || !name || !content) {
      return new Response(
        JSON.stringify({ error: "postSlug, name, and content are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const cleanName = sanitizeHtml(name.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 100);

    const cleanContent = sanitizeHtml(content.trim(), {
      allowedTags: ["b", "i", "em", "strong", "code", "a"],
      allowedAttributes: {
        a: ["href", "target", "rel"],
      },
    }).slice(0, 2000);

    const cleanWebsite = website
      ? sanitizeHtml(website.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        }).slice(0, 200)
      : undefined;

    const cleanEmail = email
      ? sanitizeHtml(email.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        }).slice(0, 150)
      : undefined;

    if (!cleanName || !cleanContent) {
      return new Response(
        JSON.stringify({ error: "Invalid comment content" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = await db
      .insert(BlogCommentTable)
      .values({
        postSlug: postSlug.trim(),
        name: cleanName,
        email: cleanEmail,
        website: cleanWebsite,
        content: cleanContent,
        createdAt: new Date(),
      })
      .returning();

    const created = result[0];

    return new Response(
      JSON.stringify({
        id: created.id,
        postSlug: created.postSlug,
        name: created.name,
        website: created.website,
        content: created.content,
        createdAt: created.createdAt,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error posting blog comment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to post comment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
