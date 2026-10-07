# Mobile browse menu

On a narrow viewport the sidebar is hidden. "Browse docs" shows it. Escape from search returns focus to that button.

## Sub-features

- "Browse docs" is visible; the Documentation nav is not.
- Activating the button reveals the nav (`aria-expanded` becomes true, sidebar gains `docs-menu-open`).
- Ctrl+K focuses search. Escape clears the query, closes the menu, and focuses "Browse docs".

## How to get to it (user POV)

Resize to a phone width (the CSS breakpoint is `max-width: 720px`). Open `/docs`. The header button reads "Browse docs".

## Driving it with Playwright

```js
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(origin + '/docs/components/dialog');
await page.locator('.sveltery-docs[data-hydrated="true"]').waitFor();
const menu = page.getByRole('button', { name: 'Browse docs' });
await menu.click();
const nav = page.getByRole('navigation', { name: 'Documentation' });
await nav.waitFor();
await page.keyboard.press('Control+k');
await page.keyboard.press('Escape');
```

End state, matching `tests/browser/docs.spec.ts`: before the click the Documentation nav is not visible; after the click it is visible; after Escape, "Browse docs" is focused.

The same spec then opens the live Dialog from this width with "Explore a dialog" and expects `getByRole('dialog')` visible. That overlaps Live Dialog; run it when the change touches the narrow layout.

## Gotchas

- "Browse docs" is `display` not set to inline-block until `max-width: 720px`. A 1280px viewport does not show this path.
- Escape returns focus to the menu button only when that button is visible (`offsetParent !== null` in `+layout.svelte`). On a wide viewport Escape still clears the query but does not move focus to a hidden button.
- Opening the menu does not navigate. The page URL stays put until a link is chosen.
