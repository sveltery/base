# Slider

A slider with one or more thumbs. Upstream: `packages/react/src/slider` at Base UI v1.8.0 (`47b40521`). Local: `src/lib/slider/`.

`clamp` and `valueToPercent` come from `src/lib/internal`. Thumb order is a local list, the same registration CompositeList does for this component. Arrow keys change the thumb value. They do not move focus between thumbs.

## Sub-features

- `Slider.Root` renders `<div role="group">`. Omit `value` to leave it uncontrolled, starting from `defaultValue` (`min` when that is omitted). `bind:value` shares a number or a readonly number array with the parent. `onValueChange` runs first; `eventDetails.cancel()` vetoes the change. `onValueCommitted` runs after a keyboard or input change that stuck, and on pointer or touch release when the gesture changed the value.
- `Slider.Control` is the pointer target. `Slider.Track` is `position: relative`. `Slider.Indicator` draws the filled range. `Slider.Thumb` is the draggable tip and owns a visually hidden `input[type=range]`. `Slider.Value` is an `<output>`. `Slider.Label` is a non-native label.
- Keyboard: Arrow keys step by `step` (horizontal arrows flip in RTL), Shift+arrow and Page Up/Page Down step by `largeStep`, Home/End jump to `min`/`max` or to the neighbour plus `minStepsBetweenValues`. A consumer `onkeydown` that calls `preventDefault()` skips the change. Arrow, Home, and End do not bubble, so a parent composite does not take them.
- Pointer: a left press on the track sets the closest thumb and commits on release with reason `track-press`. A press that starts on a thumb does not change the value until the pointer moves (`drag`). Touch waits for more than two moves before `data-dragging`. Disabled thumbs are ignored. `thumbCollisionBehavior` is `push`, `swap`, or `none`.
- Inside `Field.Root`, the focused range input is the registered control. A single thumb uses the field control id so `Field.Label` focuses it. `Form` submits the clamped number or the clamped array.

Differences from React Base UI, all deliberate:

- No `ref` or `inputRef`. Use `{@attach}` on the part, or `bind:this` on your own element.
- No `className` or style objects. Use `class` and a `style` string. Length zeros are written as `0px`.
- `value` is one `$bindable`. There is no separate controlled lock.
- A consumer handler skips the part with `event.preventDefault()`.
- Text direction is `useDirection().direction`. Outside a provider it is `ltr`.
- Thumb indexes come from DOM order in the slider model. There is no generic composite tag switch.
- `setPointerCapture` is ignored when the browser rejects a synthetic pointer id, so the gesture still runs.
- `onValueChange` keeps the original event. The next value is the first argument. The event target stays the element that fired it.

## How to get to it (user POV)

A consumer imports `Slider` from `@sveltery/base` or `@sveltery/base/slider` and renders `Slider.Root` with `Control`, `Track`, `Thumb`, and the other parts they need. For verification, open `/fixtures/slider?case=<case>`, where `<case>` is one of `plain`, `labelled`, `range`, `bound`, `disabled`, or `vertical` (`src/routes/fixtures/slider/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh slider
```

Handles used by `src/routes/fixtures/slider/slider.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Slider input: `getByRole('slider')`. The labelled name is `Volume`.
- Label: `getByTestId('label')`. Range text: `getByTestId('value')`.
- Disabled root: `getByTestId('root')`.

Proof of working order: in both frameworks, ArrowRight moves 30 to 31 and ArrowLeft moves it back, the label id is `aria-labelledby` on the input after hydration, the range output reads `40 – 65`, a bound increment updates the output, a disabled slider is disabled and stays at 30, and ArrowUp moves a vertical slider from 30 to 31. The SSR test checks that the label and root ids exist and that `aria-labelledby` is absent before hydration.

`bound` is `bind:value` in Svelte and controlled `value` plus `onValueChange` in React.

`Slider.Label` uses an author `id` when one is passed, and otherwise `${rootId}-label`. If two labels are mounted, the later one wins, and unmounting the earlier one does not clear the later id.

Component tests (`src/lib/slider/Slider.svelte.spec.ts`) cover ARIA, keyboard, pointer and touch, collision utilities, Field state, Form submit, cancellation, and the missing-context error.

## Gotchas

- `Slider` parts throw `SliderRootContext is missing` outside `Slider.Root`.
- Displayed values are clamped and, for a range, sorted. User changes write the stored value only after `onValueChange`. A parent `bind:value` updates the stored value without that callback.
- `thumbAlignment="edge"` includes the upstream prehydration script on the last thumb. `edge-client-only` measures on the client and omits the script.
- A range `Slider.Label` click does not guess which thumb to focus.

## Not ported

- React `ref`, `inputRef`, and `className` / `style` state callbacks.
- A CSS `direction` on the slider does not change the thumb. `DirectionProvider` does.
- A generic composite/roving-focus system. Slider does not rove focus between thumbs.
