import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import { getBlogPostHref } from "../lib/blog-lang";
import { SITE } from "../site-config";
const parser = new MarkdownIt();

export async function GET(context) {
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  return rss({
    title: `${SITE.author.fullNameVi} (${SITE.author.fullName}) — Engineering Blog`,
    description: SITE.site.description,
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      content: sanitizeHtml(parser.render(post.body)),
      link: getBlogPostHref(post),
    })),
  });
}
