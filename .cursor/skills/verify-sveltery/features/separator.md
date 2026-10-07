# Separator

A divider exposed to assistive technology. Upstream: `packages/react/src/separator/Separator.tsx` at Base UI v1.8.0. Local: `src/lib/separator/`.

## Sub-features

- Renders a `<div>` with `role="separator"`.
- `orientation` defaults to `horizontal`. `vertical` sets `aria-orientation` and `data-orientation`.
- `data-orientation` comes from `getStateAttributesProps({ orientation })`.
- Consumer element props override `role`, `aria-orientation` and `data-orientation`. That is the upstream `useRenderElement` order (state attributes, then the part props, then the consumer).
- Children render inside the default div.
- Native rendering: a `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host in both the default div and the snippet.

Differences from React Base UI, all deliberate:

- No `className` or `style` state callbacks. Use native `class` and `style` strings.
- No React `render` element and no `cloneElement`. The snippet owns its content; it does not receive `children`.
- No `ref`. Use `{@attach}`.

## How to get to it (user POV)

A consumer imports `Separator` from `@sveltery/base` or `@sveltery/base/separator` and renders `<Separator />` or `<Separator orientation="vertical" />`. For verification, open the fixture `/fixtures/separator?case=<case>`, where `<case>` is one of `horizontal`, `vertical` or `reactive` (`src/routes/fixtures/separator/cases.ts`). Add `&reference` to get React Base UI with the same attributes.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh separator
```

Handles used by `src/routes/fixtures/separator/separator.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Separator: `getByRole('separator')`, id `tested-separator`
- Owner of the `reactive` case: `getByRole('button', { name: 'Flip orientation' })`

Proof of working order: in both frameworks, `aria-orientation` and `data-orientation` match the case, and the reactive case changes both only through the button. The SSR test checks that the server HTML already contains `role="separator"`, `aria-orientation="horizontal"` and `data-orientation="horizontal"` before hydration, and that the vertical case contains both vertical attributes.

Each framework writes style in its own idiom, and both are held to the same assertions. Svelte uses a style string. React uses a style object. Both give the divider a non-zero box.

Component tests (`src/lib/separator/Separator.svelte.spec.ts`) port the upstream role and orientation assertions. Native-only checks cover `data-orientation`, parent-driven orientation changes, element-prop overrides, children, the render snippet and consumer attachments.

## Gotchas

- An unstyled empty `<div>` has zero block size. Playwright's `toBeVisible` treats that as hidden; the upstream testing-library check does not. The role test and the fixture set a 1px size so visibility can be asserted. The component adds no CSS.
- Interacting before `data-hydrated="true"` races hydration: the SSR divider exists but the reactive button has no handler yet.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
