# Engineering Principles Million Requests Article Design

## Goal

Publish a practical, bilingual article in the voice of a senior developer explaining five engineering principles that help code remain dependable under millions of requests.

## Content

- Add matching English and Vietnamese Markdown posts with the shared translation key `engineering-principles-million-requests`.
- Publish both versions on 2026-07-20 in the `architecture` category with `draft: false`.
- Localize each version for its audience rather than translating sentence-for-sentence.
- Open with the operational cost of clever but fragile code, then cover these five principles in order:
  1. Simplicity over cleverness
  2. Scale by design
  3. Measure before optimize
  4. Automate everything repeatable
  5. Clean code survives longer
- Every principle includes a production-shaped problem, a concise Before/After refactor, the reasoning behind it, the trade-off, and a warning against applying the rule mechanically.
- End with a compact production-readiness checklist that turns the principles into a review habit.

## Visual System

- Create one original SVG thumbnail under the existing asset convention. It depicts a request flow passing through five blueprint-like principle layers.
- Include five inline SVG diagrams, one per principle, using the same dark, blue-accented visual language as the existing technical article.
- Each SVG has an accurate `role="img"` and localized `aria-label`; no stock art, external image source, or runtime image dependency is introduced.

## Integration

- Reuse the existing blog collection schema and canonical locale handling.
- The English article is available at `/blog/engineering-principles-million-requests`.
- The Vietnamese article is selected by `/blog/engineering-principles-million-requests?lang=vi`.
- No renderer, route, listing, or locale-helper change is required: the existing collection and static client-side locale selector discover the new translation pair.

## Validation

- Verify both frontmatter entries satisfy the blog schema and use the same translation key.
- Run the existing unit tests, Astro check, and production build.
- Browser-check the English and Vietnamese URLs for correct localized title, content, thumbnail/diagrams, and locale selection.
