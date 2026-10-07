# Meter

A labeled gauge for a value in a range. Upstream: `packages/react/src/meter` at Base UI v1.8.0. Local: `src/lib/meter/`.

## Sub-features

- `Meter.Root` renders `<div role="meter">` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`. `value` is required and owned by the parent. `min` defaults to 0 and `max` to 100.
- The displayed number is the clamped value. `NaN` falls back to `min` before clamping. A non-finite percentage falls back to 0, then the percentage is clamped to 0–100. `min === max` yields a 0% fill and `aria-valuenow` equal to that bound.
- Without `format`, the text is `percentage / 100` formatted with `{ style: 'percent' }`. With `format`, `formatNumber` formats the clamped value. `locale` is passed through to `Intl.NumberFormat`.
- `getAriaValueText(formattedValue, value)` replaces only `aria-valuetext`. The second argument is the raw `value`, including values outside the range. An author `aria-valuetext` attribute overrides that text.
- `Meter.Indicator` sets inline `inset-inline-start: 0`, `height: inherit` and `width: <percentage>%`. A consumer `style` string is appended so its declarations win.
- `Meter.Value` is `aria-hidden` and shows the formatted value. A children snippet receives `(formattedValue, rawValue)`.
- `Meter.Label` is `role="presentation"`. Its id is registered on the root as `aria-labelledby`. A generated id is `$props.id()` prefixed with `base-ui-`. Cleanup clears the association only when this label's id is still the registered one, so an older label does not wipe a newer one.
- The root appends a visually hidden `x` (`role="presentation"`) so NVDA reads the label. That text is the upstream workaround, kept as-is.
- `Meter.Track` is a `<div>` and does not read meter context.
- A `render` snippet receives `(props, state, children)`. State is empty. `{@attach}` on the part reaches the host through the props spread.

## Source correspondence

| Upstream                                                               | Local                                                          | Review                                                                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `MeterRoot.tsx` value math (`valueToPercent`, `clamp`, `formatNumber`) | `MeterRoot.svelte` `$derived` calls to the shared helpers      | Same branches, including the NaN fallback and raw `getAriaValueText` argument                                        |
| `MeterRootContext` / `useMeterRootContext`                             | `context.ts` `setContext` / `getContext`                       | Same missing-context error string                                                                                    |
| `useRegisteredLabelId` + `useBaseUiId`                                 | `MeterLabel.svelte` `$effect` plus `$props.id()`               | Same cleanup comparison. Id text differs from React `useId` because Svelte's SSR-stable id is the native primitive   |
| `useRenderElement`                                                     | `{#if render}` snippet branch, otherwise the intrinsic element | No `UseRender`, refs, or style/class callbacks                                                                       |
| `visuallyHidden` style object                                          | Style attribute string on the hidden span                      | Shared helper already uses `px` for nonzero lengths                                                                  |
| `Meter.Value` children render function                                 | Children snippet `(formattedValue, value)`                     | A static Svelte child is a snippet, so it renders. React ignores non-function children and shows the formatted value |
| `forwardRef`                                                           | Consumer `{@attach}` spread onto the host                      | No ref prop                                                                                                          |

Differences from React Base UI, all deliberate:

- No `ref`. Use `{@attach}`.
- `class` and `style` are strings. Indicator styles are CSS text; later declarations override earlier ones, which is the native equivalent of Base UI's style-object merge.
- `render` is a snippet, not a React element or render function.
- Generated label ids use `$props.id()` with a `base-ui-` prefix. The association behavior matches; the id characters do not.
- The dev and production missing-context error is the descriptive string. Upstream production builds throw a numeric code instead.

## How to get to it (user POV)

A consumer imports `Meter` from `@sveltery/base` or `@sveltery/base/meter` and renders `Meter.Root` with `Meter.Label`, `Meter.Value`, `Meter.Track` and `Meter.Indicator`. For verification, open `/fixtures/meter?case=<case>`, where `<case>` is one of `basic`, `range`, `live`, `currency`, `clamp`, `label`, `locale` or `aria` (`src/routes/fixtures/meter/cases.ts`). Add `&reference` to get React Base UI with the same cases.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh meter
```

Handles used by `src/routes/fixtures/meter/meter.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Meter: `getByRole('meter')`, id `tested-meter`
- Value: `#meter-value`
- Indicator: `#meter-indicator`, read `element.style.width`
- `live`: `getByRole('button', { name: 'Set 77' })`
- `label`: `getByRole('button', { name: 'Change id' })` and `Remove label`

Proof of working order: in both frameworks, `aria-valuenow`, `aria-valuetext`, the value text and the indicator width move together when the parent changes `value`. Clamped values report the bound, not the raw number. `getAriaValueText` changes only the spoken text. Label id changes and removal update `aria-labelledby`. The SSR test checks that the server HTML already contains `role="meter"`, the range attributes and `40%` before hydration. `aria-labelledby` is applied when the label effect runs, which matches upstream's layout effect (it is absent from the server HTML).

## Gotchas

- The hidden `x` is real text inside the meter. It is how upstream forces NVDA to announce the label.
- Removing the newer of two labels clears `aria-labelledby` even if an older label is still mounted. That is the upstream cleanup rule; the port does not "fix" it. The covered case is the opposite: removing the older label keeps the newer id.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
