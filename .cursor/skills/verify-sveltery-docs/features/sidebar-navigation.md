# Sidebar and skip link

The desktop sidebar lists four groups and marks the current page. A skip link jumps to the article. "On this page" lists that article's sections.

## Sub-features

- Skip link moves focus to `#docs-content`.
- Grouped links: Overview, Getting started, Handbook, Components.
- Current page sets `aria-current="page"` on its link.
- "On this page" links to section ids such as `#examples` on the Dialog page.

## How to get to it (user POV)

Open `/docs` on a wide window (sidebar is `display: none` at `max-width: 720px`; use Mobile browse below that). The nav is labeled "Documentation". The first keyboard stop is "Skip to content". The Dialog item shows a dot whose title is "Partial implementation".

## Driving it with Playwright

```js
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(origin + '/docs');
await page.locator('.sveltery-docs[data-hydrated="true"]').waitFor();
await page.keyboard.press('Tab');
await page.getByRole('link', { name: 'Skip to content' }).press('Enter');
// #docs-content is focused by the skip link. Assert that; do not call element.focus().
const nav = page.getByRole('navigation', { name: 'Documentation' });
await nav.getByRole('link', { name: 'Dialog' }).click();
```

End state: URL ends with `/docs/components/dialog`, the Dialog link has `aria-current="page"`, the h1 is `Dialog`, and "On this page" contains a link named "Live example" whose href ends with `#examples`.

The home h1 is `Build on a thoughtful base.` The skip-link check in `tests/browser/docs.spec.ts` expects `#docs-content` to be focused after Enter.

## Gotchas

- At widths of 720px and below the Documentation nav is not visible until "Browse docs" is pressed. See `mobile-browse.md`.
- The "On this page" column is `display: none` at `max-width: 1150px` (`.docs-toc` in `docs.css`). Use a viewport wider than 1150px when asserting that column.
- Introduction's sidebar label is "Introduction", not the h1 "Build on a thoughtful base." (`+layout.svelte` special-cases an empty slug).
