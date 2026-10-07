# Button

A button that triggers an action. Upstream: `packages/react/src/button/Button.tsx` and the non-composite paths of `packages/react/src/internals/use-button/useButton.ts` at Base UI v1.8.0. Local: `src/lib/button/`.

## Sub-features

- Native `<button type="button">`. An explicit `type` (`submit` / `reset`) and `form` are kept. `tabindex` defaults to `0` and can be overridden.
- `disabled`: native `disabled` and `data-disabled`. Clicks, pointer, and keys do not call the consumer. `Tab` skips the button.
- `focusableWhenDisabled`: no `disabled` attribute. `aria-disabled` and `data-disabled` are set, `tabindex` stays `0`, and `Tab` can leave. Hover, focus, and blur still run. Activation does not.
- `nativeButton={false}`: the `render` snippet hosts a non-button. It gets `role="button"` and `tabindex="0"` (or `-1` when disabled and not focusable). Enter clicks on keydown. Space clicks on keyup and does not scroll. The click carries modifier keys and `detail: 0`. A link keeps the browser's Enter behavior; Space still prevents scrolling and dispatches a click.
- A consumer `onkeydown` / `onkeyup` that calls `preventDefault()` skips that key's synthetic click. `onclick` runs for clicks the button does not ignore.
- State for a `render` snippet is `{ disabled }`. Consumer `{@attach}` reaches the host through the spread props.

Differences from React Base UI, all deliberate:

- No `ref`. Use `{@attach}`.
- No `className` or style objects. Use `class` and `style` strings.
- No `preventBaseUIHandler()`. `preventDefault()` on the key event is the skip signal. Button's click handler has no later action to skip.
- No composite context. Space activates on keyup, including when a composite widget would activate on keydown.
- No dev warning when `nativeButton` does not match the host tag. React's owner stack is unavailable.
- The pinned click is `dispatchEvent(new PointerEvent('click'))`. On an http page that untrusted click still follows a link (`#target`) and can submit a form. `HTMLElement.click()` is not used, because it would drop modifier keys.

Preserved upstream behavior:

- [Issue #66](https://github.com/sveltery/base/issues/66): a disabled `mousedown` does not call `preventDefault`. A chorded press can still focus the host. `pointerdown` and `click` do cancel their defaults.
- A prevented Space `keydown` does not cancel the later `keyup` click. The pinned helper stores nothing between the two events.

## How to get to it (user POV)

A consumer imports `Button` from `@sveltery/base` or `@sveltery/base/button` and renders `<Button onclick={save}>Save</Button>`. For verification, open `/fixtures/button?case=<case>`, where `<case>` is one of `native`, `disabled`, `focusable`, `custom`, `custom-disabled`, `link` or `prevented` (`src/routes/fixtures/button/cases.ts`). Add `&reference` to get React Base UI with identical markup.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh button
```

Handles used by `src/routes/fixtures/button/button.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Button: `getByRole('button', { name: 'Save' })`, or `Go` for `link`. Id `tested-button`.
- Click log: `getByTestId('clicks')`, a JSON list of `{ detail, shiftKey }`.
- Hover count: `getByTestId('moves')`.

Proof of working order: in both frameworks, activation shows up only in the `clicks` log. `disabled` and `prevented` stay empty. `focusable` accepts `Tab` and hover and stays empty after click and keys. `link` records one Space click, `scrollY` stays `0`, and the hash becomes `#target`.

## Gotchas

- The disabled e2e test clicks with `force: true` because Playwright will not click a disabled button.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
- Do not replace the pinned `dispatchEvent` click with `element.click()`. That drops modifier state.
- Playwright treats `aria-disabled="true"` as not enabled, so those clicks use `force: true`.
