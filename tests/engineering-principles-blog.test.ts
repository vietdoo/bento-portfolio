import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const thumbnail = "/blog/engineering-principles-million-requests.svg";
const posts = [
  {
    file: "engineering-principles-million-requests-en.md",
    lang: "en",
    headings: [
      "## 1. Simplicity over cleverness",
      "## 2. Scale by design",
      "## 3. Measure before optimize",
      "## 4. Automate everything repeatable",
      "## 5. Clean code survives longer",
    ],
  },
  {
    file: "engineering-principles-million-requests-vi.md",
    lang: "vi",
    headings: [
      "## 1. Đơn giản hơn thông minh phô diễn",
      "## 2. Thiết kế sẵn đường để scale",
      "## 3. Đo trước khi tối ưu",
      "## 4. Tự động hoá mọi thứ lặp lại",
      "## 5. Code sạch sống lâu hơn",
    ],
  },
] as const;

describe("engineering principles bilingual blog post", () => {
  it.each(posts)("publishes a complete $lang article", ({ file, lang, headings }) => {
    const post = readFileSync(resolve(root, "src/data/blog", file), "utf8");

    expect(post).toContain(`lang: "${lang}"`);
    expect(post).toContain('translationKey: "engineering-principles-million-requests"');
    expect(post).toContain("pubDate: 2026-07-20");
    expect(post).toContain('category: "architecture"');
    expect(post).toContain("draft: false");
    expect(post).toContain(`](${thumbnail})`);
    headings.forEach((heading) => expect(post).toContain(heading));
    expect((post.match(/### Before/g) ?? []).length).toBe(5);
    expect((post.match(/### After/g) ?? []).length).toBe(5);
    expect((post.match(/<svg /g) ?? []).length).toBe(5);
    expect((post.match(/role="img"/g) ?? []).length).toBe(5);
    expect((post.match(/aria-label="/g) ?? []).length).toBe(5);
  });

  it("ships the original thumbnail", () => {
    expect(existsSync(resolve(root, "public", thumbnail.slice(1)))).toBe(true);
  });
});
