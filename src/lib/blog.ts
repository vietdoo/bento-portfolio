import { getCollection, type CollectionEntry } from "astro:content";
import type { BlogLang } from "./blog-lang";

export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) =>
      (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0),
  );
}

export function findTranslation(
  posts: CollectionEntry<"blog">[],
  post: CollectionEntry<"blog">,
  lang: BlogLang,
): CollectionEntry<"blog"> | undefined {
  if (post.data.lang === lang) return post;
  if (!post.data.translationKey) return undefined;
  return posts.find(
    (candidate) =>
      candidate.data.translationKey === post.data.translationKey &&
      candidate.data.lang === lang,
  );
}
