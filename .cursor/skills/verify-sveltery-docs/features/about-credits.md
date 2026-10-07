# About and credits

The credits page states that the project is independent and links to Base UI and shadcn/ui. It does not open a component.

## Sub-features

- Page title and heading "About & credits".
- Credit links to Base UI and shadcn/ui docs and source.
- Footer on every docs page links here as "Credits, licenses & project status".

## How to get to it (user POV)

From any docs page, use the footer link "Credits, licenses & project status", or the sidebar "About & credits" entry under Overview. Direct URL: `/docs/about`.

## Driving it with Playwright

```js
await page.goto(origin + '/docs');
await page.locator('.sveltery-docs[data-hydrated="true"]').waitFor();
await page.getByRole('link', { name: 'Credits, licenses & project status' }).click();
await page.getByRole('heading', { level: 1, name: 'About & credits' }).waitFor();
```

End state: URL ends with `/docs/about`, the h1 is `About & credits`, and the page exposes links named "Base UI documentation" (`https://base-ui.com/`), "Base UI source" (`https://github.com/mui/base-ui`), "shadcn/ui documentation" (`https://ui.shadcn.com/docs`), and "shadcn/ui source" (`https://github.com/shadcn-ui/ui`).

Do not follow those external links as part of the proof. Assert `href` on the page you already loaded.

## Gotchas

- SSR of every docs route includes the footer credit line and must not include `role="dialog"` (`tests/browser/docs.spec.ts`). `/docs/components/not-implemented` is a 404.
- The footer ampersand is the word "Independent & unofficial" in the layout. The browser test matches the escaped entity `Independent &amp; unofficial` in the raw HTML response.
- This page has no live example. A screenshot of the heading does not prove Dialog.
