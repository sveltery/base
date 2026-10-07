# Toggle pressed state

Uncontrolled Toggle starts released. Each click flips `aria-pressed` and records a press callback. This is the Svelte component, not the React reference mount.

## Sub-features

- Starts at `aria-pressed="false"`.
- First click presses it and appends a callback whose `pressed` is true.
- Second click releases it.

Controlled mode (`/toggle?case=controlled`) is a different owner: the "Owner pressed" checkbox drives `pressed`. Do not treat that checkbox as the Toggle.

## How to get to it (user POV)

Open `/toggle?case=uncontrolled`. The component is the button whose name is exactly "Toggle". Other buttons on the fixture ("Toggle mounting", "Change default", "Change disabled") are harness controls.

## Driving it with Playwright

Wait for `main[data-hydrated="true"]`.

```js
const toggle = page.getByRole('button', { name: 'Toggle', exact: true });
await toggle.click();
```

End state that proves the first click: `aria-pressed="true"` on `#tested-toggle`, and the `calls` output parses to a list whose last item has `pressed: true`. A second click returns `aria-pressed="false"`.

`scripts/drive-toggle.mjs` performs this sequence.

## Gotchas

- `getByRole('button', { name: 'Toggle' })` without `exact: true` also matches "Toggle mounting".
- Do not open `&reference`. That mounts `@base-ui/react` in the same route and is not the library.
- Click only after hydration. The SSR shell has `data-hydrated="false"`.
- Do not set `aria-pressed` from the test. The attribute has to change because the component handled the click.
