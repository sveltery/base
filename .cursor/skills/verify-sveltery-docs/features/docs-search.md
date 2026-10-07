# Docs search

The sidebar search field filters docs pages by title, description, and group. It is not a full-text index.

## Sub-features

- Focus the field with Ctrl+K (also ⌘K).
- Type a query and read the count in the status line.
- Open a hit.
- Escape clears the query.

## How to get to it (user POV)

Open `/docs`. The field is labeled "Find a page" with the hint "⌘ / Ctrl K", placeholder "Search documentation…". Ctrl+K also opens the mobile sidebar so the field is reachable when the sidebar is hidden.

## Driving it with Playwright

```js
await page.goto(origin + '/docs');
await page.locator('.sveltery-docs[data-hydrated="true"]').waitFor();
await page.keyboard.press('Control+k');
const search = page.getByRole('searchbox');
await search.fill('Dialog');
await page.getByRole('status').getByText('1 page found').waitFor();
await page
  .getByRole('navigation', { name: 'Search results' })
  .getByRole('link', { name: 'Dialog' })
  .click();
```

End state: URL ends with `/docs/components/dialog`, and the Documentation nav's Dialog link has `aria-current="page"`.

Empty query check from `tests/browser/docs.spec.ts`: fill `no-page-with-this-name`, status reads `0 pages found`, Escape leaves the searchbox value empty.

## Gotchas

- The status text is `1 page found` or `N pages found` (`apps/fixtures/src/lib/docs` layout). Match that string, not "1 result".
- While a query is non-empty the Documentation nav is replaced by "Search results". Clearing the query brings the grouped nav back.
- Search matches title, description, and group only (`content.ts` fields), so a word that appears only in a paragraph will not hit.
