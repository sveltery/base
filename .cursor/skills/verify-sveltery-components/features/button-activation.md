# Button activation

The custom Button renders a `span` with `role="button"` and the name "Save". Keyboard and pointer activation both count as a click. The host is not a native `<button>` in this scenario; that is the replacement snippet, which is the Svelte `render` prop, not React `UseRender`.

## Sub-features

- Host is a `span` with `role="button"` and `tabindex="0"`.
- Enter and Space each activate it.
- The fixture `calls` output increments `click` for each activation.

## How to get to it (user POV)

Open `/button?case=custom` (also the default when `case` is omitted). Tab to "Save" or click it. The id is `tested-button`.

## Driving it with Playwright

```js
await page.goto(origin + '/button?case=custom');
await page.locator('main[data-hydrated="true"]').waitFor();
const button = page.getByRole('button', { name: 'Save' });
await button.focus();
await page.keyboard.press('Enter');
await page.keyboard.press('Space');
```

End state: `calls` JSON has `click` equal to 2, and the same count on `capture`, `render`, and `ancestor` (`tests/browser/button.spec.ts` scenario `custom`). The element stays a `span`.

## Gotchas

- `/button?case=link` renders an anchor named "Go" instead. Do not assert `span` there.
- `&reference` is the React button. Leave it off when checking the port.
- A missing `UseRender` component is not a failure. Parts take a `render` snippet or render their own element.
