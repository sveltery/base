# Input

A native input that uses `Field.Control`. Upstream: `packages/react/src/input/Input.tsx` at Base UI v1.8.0. Local: `src/lib/input/`. `Input` forwards its props to the `Field.Control` already on main. It does not keep its own field state.

## Sub-features

- The host is an `<input>`. Omit `value` to leave it uncontrolled, starting from `defaultValue`. `bind:value` shares the value with the parent. `onValueChange` runs first; `eventDetails.cancel()` vetoes the change and restores the controlled DOM value.
- Inside `Field.Root`, the input gets that field's id, name, disabled flag, and `data-disabled`, `data-invalid`, `data-dirty`, `data-filled`, `data-touched`, and `data-focused` when those states are set. `Field.Label` points `for` at the input id.
- `Field.Root` `name` wins for form submission. `getValue()` reads the input. An empty `required` input blocks submit and shows `Field.Error`.
- A `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host through the spread props. Element access inside `Field.Control` uses `bind:this`.

Differences from React Base UI, all deliberate:

- No `ref`. The host element is the `<input>`, or whatever element the `render` snippet returns. Use `{@attach}` on `Input`, or `bind:this` on your own element.
- No `className` or style objects. Use `class` and `style` strings.
- `value` is one `$bindable`, matching `Field.Control`. Pass it, or `bind:value`, for a controlled input.
- `Input` must sit inside `Field.Root`. Upstream `Input` renders alone because `Field.Control` reads a default field context. The landed `Field.Control` throws when that context is missing, and `Input` does not replace it with a stub.

## How to get to it (user POV)

A consumer imports `Input` from `@sveltery/base` or `@sveltery/base/input` and renders `<Field.Root><Field.Label>Email</Field.Label><Input /></Field.Root>`. For verification, open `/fixtures/input?case=<case>`, where `<case>` is one of `plain`, `labelled`, `bound`, `disabled`, `invalid`, `required`, or `values` (`src/routes/fixtures/input/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh input
```

Handles used by `src/routes/fixtures/input/input.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Input: `getByTestId('control')`. The plain case id is `tested-input`. The labelled textbox name is `Email`.
- Label: `getByTestId('label')`
- Bound value: `getByTestId('value')`
- Required submit: `getByRole('button', { name: 'Submit' })`, `getByText('Required')`, `getByTestId('submitted')`
- Values: `getByTestId('values')`

Proof of working order: in both frameworks, the plain input keeps its id and placeholder, the label `for` equals the input `id`, typing in `bound` updates the output, a disabled input is disabled, `invalid` sets `data-invalid` and `aria-invalid`, an empty required input blocks submit and shows `Required`, and submit reports `{"username":"ada"}`. The SSR test checks that the server HTML already contains the same `base-ui-` id on the label's `for` and the input's `id`.

`bound` is `bind:value` in Svelte and controlled `value` plus `onValueChange` in React.

Component tests (`src/lib/input/Input.svelte.spec.ts`) port the upstream conformance checks that apply without a React ref: the host is an `HTMLInputElement`, props and `style` reach it, and a `render` snippet can host a `textarea`. Field state tests show the input is the real `Field.Control`.

## Gotchas

- Rendering `Input` outside `Field.Root` throws `FieldRootContext is missing`.
- Playwright's `fill()` replaces the whole value. A canceled `onValueChange` puts the controlled value back.
- `toHaveAttribute` compares the attribute string. A regex is not a pattern match in the Vitest browser project. The Playwright e2e tests do accept a regex.

## Not ported

- The upstream default field context that lets `Input` render outside `Field.Root`.
- `className` and `style` state callbacks.
- React `ref` forwarding.
