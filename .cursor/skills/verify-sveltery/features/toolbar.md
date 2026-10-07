# Toolbar

A toolbar of buttons, groups, and links with one roving tab stop. Upstream: `packages/react/src/toolbar/` at Base UI v1.8.0, using the linear composite keyboard path. Local: `src/lib/toolbar/`.

## Sub-features

- `Toolbar.Root` renders `<div role="toolbar">`. `aria-orientation` and `data-orientation` follow `orientation` (`horizontal` by default). `disabled` sets `data-disabled` on the root, the group, and every button.
- `Toolbar.Button` renders `<button type="button">`. `disabled` is the toolbar, the nearest group, or the button. `focusableWhenDisabled` defaults to `true`: a disabled button keeps `aria-disabled` and `data-focusable`, stays in the arrow order, and has no native `disabled`. `focusableWhenDisabled={false}` uses the native `disabled` attribute, omits `aria-disabled` and `data-focusable`, and is skipped. `data-orientation` follows the toolbar.
- Space activates on keydown, including a native button, so keyup does not click again. Enter on a native button is left to the browser. A non-button `render` host (`nativeButton={false}`) gets `role="button"`; Enter and Space each dispatch one click with `detail: 0` and the modifier keys. A consumer `onkeydown` that calls `preventDefault()` skips that activation.
- `Toolbar.Group` renders `<div role="group">`. `disabled` disables buttons inside it and sets `data-disabled`. Links are not disabled by the toolbar or the group.
- `Toolbar.Link` renders `<a>` and joins the arrow order. It exposes `data-orientation` and no disabled state.
- Roving tabindex: one item has `tabindex="0"`, the others `-1`. Arrow keys follow `orientation`. Horizontal arrows swap in RTL (`DirectionProvider`). The other axis does nothing. Home, End, and Shift/Ctrl/Alt/Meta arrows do nothing. `loopFocus` defaults to true. A natively disabled or hidden host is skipped, and a tab stop that becomes disabled moves to the next focusable item. Arrow keys are handled on the root. `preventDefault()` there skips navigation. `preventDefault()` on an item does not.
- The roving behavior is a small class, the same shape as ToggleGroup. It exposes `tabindex`, a focus handler, and a registration attachment. A `render` snippet receives those props.
- Native rendering: a `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host.

Differences from React Base UI, all deliberate:

- No React `ref`. Use `{@attach}`.
- No `className` or `style` state callbacks.
- No `preventBaseUIHandler()`. `preventDefault()` on the toolbar keydown is the skip signal for arrows. On a button keydown it skips activation, not arrows.
- No grid, no scroll-into-view, and no text-field caret exceptions.
- No dev warning when `nativeButton` does not match the host tag.
- Parts used outside `Toolbar.Root` throw the upstream missing-context error.

## How to get to it (user POV)

A consumer imports `Toolbar` and renders `<Toolbar.Root><Toolbar.Button>Bold</Toolbar.Button><Toolbar.Link href="/docs">Docs</Toolbar.Link></Toolbar.Root>`. For verification, open `/fixtures/toolbar?case=<case>`, where `<case>` is one of `keyboard`, `vertical`, `rtl`, `loop`, `disabled`, `focusable`, `skip`, `activate`, or `custom` (`src/routes/fixtures/toolbar/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh toolbar
```

Handles used by `src/routes/fixtures/toolbar/toolbar.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Toolbar: `getByRole('toolbar', { name: 'Tools' })`
- Buttons: `getByRole('button', { name: 'One' | 'Two' | 'Three' | 'Save' })`
- Links: `getByRole('link', { name: 'Link' | 'Docs' })`
- Group: `getByRole('group')`
- Click count: `getByTestId('clicks')`

Proof of working order: in both frameworks, horizontal arrows walk button, link, then grouped buttons and loop, vertical arrows use Down, RTL swaps Left and Right, Home and Shift+Arrow stay put, a disabled toolbar disables buttons but not links, disabled buttons remain arrow targets, a `focusableWhenDisabled={false}` button is skipped, and Space, Enter, and click each increment the count once. The SSR test checks that the server HTML already contains `role="toolbar"`, `aria-orientation="horizontal"`, `data-orientation="horizontal"`, `tabindex="0"`, and `tabindex="-1"`.

`rtl` uses `dir="rtl"` in Svelte and `DirectionProvider` in React. The assertions are the same.

Component tests (`src/lib/toolbar/Toolbar.svelte.spec.ts`) port the upstream root, button, group, and link cases that do not need Input or another overlay. Native-only checks cover one activation per key, the render snippet, the registration attachment, and which `preventDefault()` skips arrows.

## Gotchas

- The disabled e2e click uses `force: true` because Playwright will not click a disabled button. Focusable disabled buttons are not natively disabled, so ordinary clicks reach them and must no-op.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.

## Not ported

`Toolbar.Input`, `Toolbar.Separator`, text-field arrow exceptions, scroll-into-view, grid navigation, Toggle and ToggleGroup nesting, rendering Menu, Dialog, Select, Popover, or Switch through `render`, `className` / `style` state callbacks, and React `ref`.
