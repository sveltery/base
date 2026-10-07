# CSP Provider

Provides a Content Security Policy nonce and an inline-style policy to descendant components. Upstream: `packages/react/src/csp-provider/CSPProvider.tsx` and `packages/react/src/internals/csp-context/CSPContext.tsx` at Base UI v1.8.0 (`47b40521`). Local: `src/lib/csp-provider/`. There was no CSP context on main, so this is the one copy.

## Sub-features

- `CSPProvider` renders no element. It publishes `nonce` and `disableStyleElements` to descendants and renders its children snippet.
- Outside a provider, `useCSPContext().nonce` is `undefined` and `.disableStyleElements` is `false`. That fallback is what lets components render inline style elements by default.
- A mounted provider copies its props through. An omitted `nonce` or `disableStyleElements` stays `undefined`. Upstream does not default `disableStyleElements` in the provider; the documented default `false` is the fallback used only when no provider is mounted. `undefined` is falsy, so a consumer that checks the flag still renders style elements.
- `nonce` is the string descendants put on inline `<style>` and `<script>` tags.
- `disableStyleElements` true tells descendants to skip inline `<style>` elements.
- A nested provider replaces the outer configuration. It does not inherit a missing `nonce` or `disableStyleElements`.
- Changing either prop updates descendants that read the properties in the template or in `$derived`.

Differences from React Base UI, all deliberate:

- `useCSPContext()` returns `{ nonce, disableStyleElements }` with getters. Call it during component init, then read the properties so the provider props stay the source of truth. Nothing copies the props into `$state`.
- No React context object and no `useMemo`. Svelte context holds the getters.
- Upstream `CSPProvider.State` is an empty object. It is omitted. The provider has no host and no state attributes.
- No `className`, `style`, `render`, or `ref`. The provider does not render a DOM node, so it has no `{@attach}` and no `bind:this`.
- Children are a snippet.
- Upstream exports `useCSPContext` from `@base-ui/react/internals/csp-context`. Svelte exports it beside `CSPProvider` from `@sveltery/base` and `@sveltery/base/csp-provider`.

## How to get to it (user POV)

A consumer imports `CSPProvider` and `useCSPContext` from `@sveltery/base` or `@sveltery/base/csp-provider`. A descendant calls `useCSPContext()` and reads `.nonce` and `.disableStyleElements`. For verification, open `/fixtures/csp-provider?case=<case>`, where `<case>` is `outside`, `omitted`, `nonce`, `disabled`, `reactive`, or `nested` (`src/routes/fixtures/csp-provider/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh csp-provider
```

Handles used by `src/routes/fixtures/csp-provider/csp-provider.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Nonce: `getByTestId('csp-nonce')`. Nested case: `getByTestId('outer-nonce')` and `getByTestId('inner-nonce')`.
- Style policy: `getByTestId('csp-styles')`. Nested case: `getByTestId('outer-styles')` and `getByTestId('inner-styles')`.
- Owner of the `reactive` case: `getByRole('button', { name: 'Update CSP' })`

Proof of working order: in both frameworks, a page with no provider shows nonce `undefined` and styles `false`, an omitted provider shows both as `undefined`, `nonce="test-nonce"` shows that nonce, `disableStyleElements` shows `true`, the button swaps nonce and the style flag, and a nested provider shows `outer-nonce` / `false` outside and `undefined` / `true` inside. The SSR test checks that the server HTML already contains those readings before hydration.

Svelte reads `.nonce` and `.disableStyleElements`. React's `useCSPContext()` is the plain object. Both are held to the same text. `undefined` is printed as the word `undefined`.

Component tests (`src/lib/csp-provider/CSPProvider.svelte.spec.ts`) port the upstream default, nonce, and `disableStyleElements` assertions as context readings. Native-only checks cover an omitted prop, nesting, and the absence of a host element.

## Gotchas

- `useCSPContext()` must run during component init. Reading the properties later, from the template or `$derived`, is what sees the next prop value.
- Calling `useCSPContext()` in the provider's own script sees the parent provider, not the one it just published.
- A nested provider does not merge. An inner provider that sets only `disableStyleElements` clears the outer `nonce`.
- `disableStyleElements` is `false` with no provider and `undefined` when the prop is omitted on a mounted provider.

## Not ported

- Wiring `useCSPContext()` into ScrollArea (scrollbar-hiding style element), Select (inline style element), Slider (prehydration script nonce), or Tabs (indicator prehydration script). Those components keep their current markup. Upstream `CSPProvider.test.tsx` asserts the ScrollArea and Select style tags; those DOM checks wait until the consumers read this provider.
