# Fieldset

Groups a shared legend with related controls. Upstream: `packages/react/src/fieldset` (Root, Legend, `FieldsetRootContext`, `useRegisteredLabelId`) at Base UI v1.8.0. Local: `src/lib/fieldset/`.

## Sub-features

- `Fieldset.Root` renders a `<fieldset>`. `disabled` sets the native `disabled` attribute and `data-disabled`.
- Nested roots OR the ancestor disabled flag with their own prop, through Svelte context. An inner root stays disabled while any ancestor is disabled, and re-enables only when every ancestor and its own prop are enabled.
- `Fieldset.Legend` renders a `<div>`, not a `<legend>`. It publishes its id to the nearest root. The root sets `aria-labelledby` to that id.
- A custom `id` is used as given. Otherwise the id is `base-ui-` plus `$props.id()`, which stays stable across hydration.
- Registration runs in an effect, the same point as upstream `useIsoLayoutEffect`. Server HTML includes the legend id and omits `aria-labelledby`. After hydration the attribute appears.
- Removing a legend clears `aria-labelledby`. Changing its id updates the attribute. If two legends are mounted, the later one wins, and unmounting the earlier one does not clear the later id.
- A legend outside `Fieldset.Root` throws `Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.`
- A `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host in both the default element and the snippet.

Differences from React Base UI, all deliberate:

- No `ref`. Use `{@attach}`.
- No `className` or style callbacks. Use native `class` and `style`.
- Generated ids come from `$props.id()` (`base-ui-s1` on the server) rather than React's `useId` (`base-ui-:r1:`). Both are prefixed with `base-ui-` and both end up in `aria-labelledby`.
- `render` is a snippet, not a React element or render function. It does not receive `children`; put the contents in the snippet.

## How to get to it (user POV)

A consumer imports `Fieldset` from `@sveltery/base` or `@sveltery/base/fieldset` and renders `<Fieldset.Root><Fieldset.Legend>Billing</Fieldset.Legend></Fieldset.Root>`. For verification, open `/fixtures/fieldset?case=<case>`, where `<case>` is one of `labelled`, `custom-id`, `disabled`, `nested`, `dynamic`, `labels` or `nested-labels` (`src/routes/fixtures/fieldset/cases.ts`). Add `&reference` for React Base UI with the same markup.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh fieldset
```

Handles used by `src/routes/fixtures/fieldset/fieldset.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Fieldset: `getByTestId('fieldset')`, or `outer` / `inner` when nested
- Legend: `getByTestId('legend')`, or `old` / `new` in the `labels` case
- Input: `getByRole('textbox', { name: 'Name' })`
- Buttons: `Disable outer`, `Enable inner`, `Enable outer`, `Change id`, `Remove legend`, `Show both`, `Show new`

Proof of working order: in both frameworks, `aria-labelledby` equals the legend id only after registration, nested `disabled` and `data-disabled` follow the ancestor OR the local prop, and removing the earlier of two legends leaves the later id in place. The SSR test checks that the server HTML already contains a `base-ui-` legend id and does not contain `aria-labelledby`.

Component tests (`src/lib/fieldset/Fieldset.svelte.spec.ts`) port the upstream root and legend assertions that do not depend on Field, Checkbox, Radio or Slider, plus the registered-label cleanup case. Native-only checks cover the render snippet and consumer attachments.

## Gotchas

- Interacting before `data-hydrated="true"` races hydration: the SSR fieldset exists, but `aria-labelledby` is applied by an effect.
- An input inside a disabled ancestor fieldset is natively disabled even when the inner fieldset forgets its own `disabled` attribute. Tests assert the attribute on the inner fieldset.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.

## Not ported

Field, Checkbox, CheckboxGroup, RadioGroup and Slider reading fieldset `disabled` (the upstream tests that render those roots). The `render` snippet still receives `disabled` in `props` and `state` for a consumer to apply.
