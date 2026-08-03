export type BlogLang = "en" | "vi";

export const BLOG_LANG_KEY = "portfolio:blog-lang";

export const BLOG_LANGS: BlogLang[] = ["en", "vi"];

export type TranslatableBlogPost = {
  id: string;
  data: {
    lang: BlogLang;
    translationKey?: string;
  };
};

export function getCanonicalBlogId<T extends TranslatableBlogPost>(
  post: T,
): string {
  return post.data.translationKey ?? post.id;
}

export function getBlogPostHref<T extends TranslatableBlogPost>(
  post: T,
  lang: BlogLang = post.data.lang,
): string {
  const query = lang === "vi" ? "?lang=vi" : "";
  return `/blog/${getCanonicalBlogId(post)}${query}`;
}

export function getLocalizedPost<T extends TranslatableBlogPost>(
  posts: T[],
  canonicalId: string,
  lang: BlogLang,
): T | undefined {
  return (
    posts.find(
      (post) =>
        getCanonicalBlogId(post) === canonicalId && post.data.lang === lang,
    ) ??
    posts.find(
      (post) =>
        getCanonicalBlogId(post) === canonicalId && post.data.lang === "en",
    )
  );
}

export function getBlogPostPaths<T extends TranslatableBlogPost>(
  posts: T[],
): { params: { id: string } }[] {
  return [...new Set(posts.map(getCanonicalBlogId))].map((id) => ({
    params: { id },
  }));
}
