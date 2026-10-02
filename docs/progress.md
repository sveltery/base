# Progress

Progress implements the pinned Base UI v1.8.0 Root, Label, Track, Indicator and Value contracts. Root requires `value: number | null`, with `min=0` and `max=100`. Finite values use the pin's clamped raw value and normalized percentage for ARIA, visible formatting, completion status and indicator width. Null, NaN and infinities are indeterminate. Native attributes override generated defaults independently of state.

```svelte
<script lang="ts">
  import { Progress } from '@sveltery/base/progress';
</script>
<Progress.Root value={30} min={20} max={40}>
  <Progress.Label>Upload</Progress.Label>
  <Progress.Value />
  <Progress.Track><Progress.Indicator /></Progress.Track>
</Progress.Root>
```

A custom `format` formats the clamped raw value using `Intl.NumberFormat`; the default formats the normalized percentage. `locale` accepts Intl locales. `getAriaValueText(formattedValue, rawValue)` receives `''` and the original raw value while indeterminate. Value's child snippet receives `'indeterminate'` and that raw value instead. The default Value renders no text while indeterminate and is `aria-hidden=true`.

All parts receive `{ status }` in class/style callbacks and replacement snippets, and exactly one generated status attribute: `data-progressing`, `data-complete` or `data-indeterminate`. Indicator supplies inset-inline-start, inherited height and percentage width only while determinate; consumer styles remain independently applicable. Root always includes the pinned visually hidden presentation `x` for NVDA. Track defaults to a div, Label and Value to spans.

Label generates a Svelte-stable ID unless `id` is supplied. It registers after mounting, updates its association when the ID changes and conditionally unregisters on removal. SSR Root has no generated `aria-labelledby`; hydration establishes it. This deliberately uses a Progress-local effect rather than Dialog's initialization registration. Nested Roots own separate contexts. Progress has no form submission or reset state.

Replacement snippets must spread the supplied props, including attachment symbols, and render the third children snippet to retain Root's hidden content and Value's output. Bind `ref` to receive the actual default or replacement host, followed by null on cleanup. React render elements/functions adapt to Svelte snippets; CSS objects adapt to strings; React `className` adapts to native `class` and its ClassValue forms. Public types are named `ProgressRootProps`, corresponding part Props/State names and `ProgressStatus`; `Progress.Status` preserves the pinned namespace alias, and the native part subpath also exports `Status`. React component namespace Props/State syntax adapts to the named part types.

Reversed and nonfinite bounds retain the pin's arithmetic without validation or correction. For example min 40/max 20/value 30 yields raw clamp 40 but percentage 50%; equal bounds/value 5 yields complete with 0% fill. These are characterizations, not additional declaration credits or an approval to change behavior.

See [assertion provenance and limits](../parity/progress/README.md), [compatibility](../parity/progress/compatibility.md), [verification](../parity/progress/verification.md) and [serialized shared integration](../parity/progress/shared-integration.md). Public exports are integrated; package consumers and final-head acceptance remain separate gates; complete library or assistive-technology parity is unclaimed.
