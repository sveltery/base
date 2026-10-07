# Direction Provider

Provides a reading direction to descendant components. Upstream: `packages/react/src/direction-provider/DirectionProvider.tsx` and `packages/react/src/internals/direction-context/DirectionContext.tsx` at Base UI v1.8.0 (`47b40521`). Local: `src/lib/direction-provider/`. There was no direction context on main, so this is the one copy.

## Sub-features

- `DirectionProvider` renders no element. It publishes `direction` to descendants and renders its children snippet.
- `direction` defaults to `ltr`. `rtl` is the other value.
- `useDirection()` reads the nearest provider. Outside a provider, `.direction` is `ltr`.
- A nested provider replaces the outer direction for its own descendants. The outer reading stays on components that sit beside the inner provider.
- Changing `direction` updates descendants that read `.direction` in the template or in `$derived`.

Differences from React Base UI, all deliberate:

- `useDirection()` returns `{ direction }`. Upstream returns the string. Call it during component init, then read `.direction` so the provider prop stays the source of truth. Nothing copies the prop into `$state`.
- No React context object and no `useMemo`. Svelte context holds the getter.
- Upstream `DirectionProvider.State` is an empty object. It is omitted. The provider has no host and no state attributes.
- No `className`, `style`, `render`, or `ref`. The provider does not render a DOM node, so it has no `{@attach}` and no `bind:this`.
- Children are a snippet.

## How to get to it (user POV)

A consumer imports `DirectionProvider` and `useDirection` from `@sveltery/base` or `@sveltery/base/direction-provider`. A descendant calls `useDirection()` and reads `.direction`. For verification, open `/fixtures/direction-provider?case=<case>`, where `<case>` is `outside`, `rtl`, `omitted`, `reactive`, or `nested` (`src/routes/fixtures/direction-provider/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh direction-provider
```

Handles used by `src/routes/fixtures/direction-provider/direction-provider.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Reading: `getByTestId('direction')`. Nested case: `getByTestId('outer')` and `getByTestId('inner')`.
- Owner of the `reactive` case: `getByRole('button', { name: 'Flip direction' })`

Proof of working order: in both frameworks, a page with no provider shows `ltr`, an omitted prop shows `ltr`, `direction="rtl"` shows `rtl`, the button swaps `rtl` and `ltr`, and a nested provider shows `rtl` outside and `ltr` inside. The SSR test checks that the server HTML already contains those readings before hydration.

Svelte reads `.direction`. React's `useDirection()` is the string. Both are held to the same text.

Component tests (`src/lib/direction-provider/DirectionProvider.svelte.spec.ts`) port the upstream default and update assertions. Native-only checks cover an omitted prop, nesting, and the absence of a host element.

## Gotchas

- `useDirection()` must run during component init. Reading `.direction` later, from the template or `$derived`, is what sees the next prop value.
- Calling `useDirection()` in the provider's own script sees the parent provider, not the one it just published.
- Components ported before this provider still read CSS `direction`. This provider does not change them.

## Not ported

- Wiring `useDirection()` into Slider, ScrollArea, Toolbar, Tabs, ToggleGroup, or RadioGroup. Those components keep their CSS `direction` reading.
