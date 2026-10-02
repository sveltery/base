# Meter

Meter implements the pinned Base UI v1.8.0 Root, Label, Track, Indicator and Value contracts. Root requires `value: number`, with `min=0` and `max=100`. It supplies `role=meter` and range ARIA attributes. The raw value is clamped for `aria-valuenow` and custom formatting; its independently normalized percentage drives the default percent text and Indicator width.

```svelte
<script lang="ts">
  import { Meter } from '@sveltery/base/meter';
</script>
<Meter.Root value={30} min={20} max={40}>
  <Meter.Label>Battery level</Meter.Label>
  <Meter.Value />
  <Meter.Track><Meter.Indicator /></Meter.Track>
</Meter.Root>
```

With `format`, `Intl.NumberFormat` formats the clamped raw value; without it, the normalized percentage is formatted as a percent. `locale` accepts Intl locales. `getAriaValueText(formattedValue, rawValue)` controls accessible text while Value retains its formatted output. Value's child snippet receives the same formatted string and the original raw number. Its default output has `aria-hidden=true`. Native attributes can override generated defaults independently of state.

All five parts share a frozen empty state object to class/style callbacks and replacement snippets. They generate no status attributes. Indicator supplies inset-inline-start zero, inherited height and a percentage width. Root includes the pinned visually hidden presentation `x` for NVDA. Root, Track and Indicator default to divs; Label and Value default to spans. Track renders independently; Label, Indicator and Value require Root context. Meter has no form submission or reset state.

Label generates a Svelte-stable prefixed ID unless an explicit ID is supplied. It registers after mount, updates when its ID changes and conditionally clears the association on removal. SSR Root omits generated `aria-labelledby`; hydration establishes the relationship. Nested Roots own separate contexts.

Replacement snippets must spread supplied props, including attachment symbols, and render the third children snippet to preserve Root's hidden content or Value's output. Bind `ref` to receive the actual default/replacement host and null on cleanup. React render elements/functions adapt to snippets, CSS objects to strings and className to native ClassValue `class`. Public types are MeterRootProps/State and corresponding Label, Track, Indicator and Value Props/State names. Value children are a `[string, number]` snippet or null.

NaN uses `min` for the raw clamp and zero for fill. Infinities clamp to bounds. Equal, reversed and nonfinite bounds retain the exact pin's arithmetic: equal bounds/value 5 produce raw 5 with zero fill; min 40/max 20/value 30 produce raw 40 with 50% fill. These are source characterizations requiring paired evidence, not permission to correct the behavior. Meter has no indeterminate mode.

Implementation is proposed in [PR #32](https://github.com/sveltery/base/pull/32). Public shared integration and runtime acceptance remain pending; internal imports alone do not establish the public API. See [provenance and count limits](../parity/meter/README.md), [compatibility](../parity/meter/compatibility.md), [verification](../parity/meter/verification.md) and [shared integration](../parity/meter/shared-integration.md). Complete library and assistive-technology parity remain unclaimed.
