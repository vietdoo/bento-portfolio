import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/blog" }),
  schema: rssSchema.extend({
    lang: z.enum(["en", "vi"]).default("en"),
    translationKey: z.string().optional(),
    category: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
