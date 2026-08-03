# Vietnamese Font and Author Avatar Design

## Goal

Ensure Vietnamese text renders consistently across the site and show the provided GitHub image as the blog author avatar.

## Design

- Add a Vietnamese-capable system font fallback to the shared body and heading font stacks in `BasicLayout.astro`.
- Preserve the preferred Satoshi and Cabinet Grotesk fonts where they contain the required glyphs.
- Use `Arial` before the generic sans-serif fallback to supply Vietnamese glyphs when the preferred fonts do not.
- Replace the blog metadata card's letter monogram with `https://avatars.githubusercontent.com/u/64247567`, cropped to a circle and labeled with the configured author name.

## Validation

- Run Astro's type/content check and production build.
- Verify a Vietnamese article displays full Vietnamese characters in the title and body, and the author card loads the GitHub avatar.
