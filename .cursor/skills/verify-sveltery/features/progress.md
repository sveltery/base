# Progress

A progress bar with root, track, indicator, value, and label parts. Upstream: `packages/react/src/progress` at Base UI v1.8.0. Local: `src/lib/progress/`.

## Sub-features

- `Progress.Root` renders `<div role="progressbar">` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`. `value={null}` and any non-finite `value` are indeterminate: no `aria-valuenow`, `aria-valuetext="indeterminate progress"`, and `data-indeterminate`.
- A finite value is clamped into `min`/`max` (defaults 0 and 100). The indicator width, the value text, and `aria-valuetext` use that clamped position. `aria-valuenow` is the clamped value. Reaching or passing `max` sets `data-complete`; otherwise `data-progressing`. `min === max` stays complete with a 0% fill, matching upstream.
- Without `format`, the text is the position formatted as a percent. `format` formats the clamped value with `Intl.NumberFormat`, and `locale` selects the locale. `getAriaValueText(formattedValue, value)` replaces `aria-valuetext`. For indeterminate progress the callback receives `''` and `null` (or the raw non-finite number), while `Progress.Value`'s children snippet receives `'indeterminate'` and that raw value. The default value text is empty while indeterminate.
- `Progress.Label` registers its id on the root as `aria-labelledby` and clears it on destroy. An explicit `id` is used as-is. A generated id is `base-ui-` plus the component id. Removing one label does not clear a newer label's id.
- `Progress.Track` and `Progress.Indicator` share the root status attributes. The indicator's inline style is `inset-inline-start: 0; height: inherit; width: <percent>%` while determinate, and has no fill style while indeterminate. A consumer `style` string is appended so it wins on conflict.
- The default root appends a visually hidden `<span role="presentation">x</span>` so NVDA reads the label (upstream issue 4184).
- A `render` snippet receives `(props, state)` and replaces the host. Consumer `{@attach}` reaches the host through the props spread.

Differences from React Base UI, all deliberate:

- No `ref`. Use `{@attach}`.
- `class` and a string `style` replace `className` and style objects. There are no state callbacks for class or style.
- `Progress.Value` children are a snippet `(formattedValue, value)`. Any snippet replaces the default text. Upstream ignores children that are not a function.
- Generated label ids use `$props.id()` with a `base-ui-` prefix. React uses `useId`.
- Label registration runs in `$effect.pre`, so SSR HTML includes the label `id` and the progress values, and adds `aria-labelledby` after hydration. Upstream does the same with `useLayoutEffect`.

## How to get to it (user POV)

A consumer imports `Progress` from `@sveltery/base` or `@sveltery/base/progress`:

```svelte
<Progress.Root value={30}>
	<Progress.Label>Upload progress</Progress.Label>
	<Progress.Value />
	<Progress.Track>
		<Progress.Indicator />
	</Progress.Track>
</Progress.Root>
```

For verification, open `/fixtures/progress?case=<case>`, where `<case>` is one of `determinate`, `indeterminate`, `cycle`, `range`, `formatted`, `locale`, `aria-text`, `value-child`, `label`, `nonfinite`, or `equal` (`src/routes/fixtures/progress/cases.ts`). Add `&reference` for React Base UI with the same markup.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh progress
```

Handles used by `src/routes/fixtures/progress/progress.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Progress bar: `getByRole('progressbar')`, id `tested-progress`
- Parts: `getByTestId('label' | 'value' | 'track' | 'indicator')`
- Cycle buttons: `Indeterminate`, `Halfway`, `Complete`
- Range buttons: `Over`, `Under`
- Format button: `Switch currency`
- `Clear` sets `value` to `null` for `aria-text` and `value-child`
- Label buttons: `Change id`, `Remove label`

Percent and currency cases pin `locale="en-US"` so the visible text is `30%` or `$30.00` in both frameworks. `locale` uses `de-DE` and expects `70,51`.

## Gotchas

- `getAriaValueText` is called with `''` while indeterminate, and the value snippet is called with `'indeterminate'`. Those strings are the upstream contract.
- The hidden `x` is inside the progress bar. `aria-labelledby` supplies the accessible name once the label has registered.
- Interacting before `data-hydrated="true"` races the React reference mount. Svelte sets that flag in `onMount`, after label registration.
