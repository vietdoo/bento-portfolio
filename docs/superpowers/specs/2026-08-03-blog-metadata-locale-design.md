# Blog Metadata and Locale URL Design

## Goal

Improve the blog detail header with a clean editorial metadata card and replace language-specific blog slugs with a query-string locale.

## Scope

- Display an editorial card immediately below the post title.
- Source the author name from the shared site configuration.
- Show the publication date and reading time in the card.
- Support English by default and Vietnamese through `?lang=vi`.
- Generate blog and language-switch links using the stable post id plus the locale query string.

## URL Behavior

- The canonical post route is `/blog/{id}`.
- English is selected when `lang` is omitted.
- Vietnamese is selected only when `lang=vi`.
- Any unsupported `lang` value falls back to English.
- Switching languages preserves the post id and replaces only the `lang` parameter.
- Existing links that use a `-vi` suffix are replaced rather than preserved as an alternate public route.

## Detail Header

The header keeps the existing back action and title. Directly beneath the title, it renders a compact bordered editorial card:

- An author identity area labeled for the current locale, using the configured author name.
- A publication-date value formatted for the selected locale.
- The calculated reading-time value.

The card uses a clear two-row hierarchy on wide screens and wraps without overflow on small screens. It is presentation-only and does not alter article content.

## Content and Data Flow

The blog route reads `Astro.url.searchParams` to determine the selected locale. It resolves the selected localized title, description, and content from the existing bilingual blog data, then passes locale-aware labels and values into the post layout. Blog listing rows and language controls use a shared URL-building convention so their locale links stay consistent.

## Error Handling

Unsupported or absent language values are treated as English. A missing blog id or entry retains the current not-found behavior.

## Validation

- Run Astro's type/content validation.
- Run the production build.
- Manually verify the English and Vietnamese detail URLs, language switching, and responsive metadata card.
