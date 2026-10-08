# Field

Labels, describes, and validates one control. Upstream: `packages/react/src/field` (Root, Label, Control, Description, Error, Item, Validity) at Base UI v1.8.0. Local: `src/lib/field/`. `Field.Control` is a real `<input>`. `Input` wraps that control.

## Sub-features

- `Field.Root` renders a `<div>`. `disabled` ORs with an ancestor `Fieldset.Root`. `invalid` forces `data-invalid` and does not set `aria-invalid` while the field is disabled.
- `Field.Label` renders a `<label>`. Its `for` and the control's `id` share the root's generated `base-ui-` id before a control claims an explicit id. The label id is published once during that render, so controls rendered after the label already have `aria-labelledby` in the server HTML. A later id change publishes again. Unmounting the label clears `aria-labelledby` when it still points at that label. `null` would omit `for`. A non-native label focuses the control and does not set `for`.
- `Field.Description` and a visible `Field.Error` append their ids to `aria-describedby`, after an author id, with duplicates removed.
- `Field.Control` renders an `<input>`. A `render` snippet can host another element with a `value`, including `<textarea>`. Omit `value` to leave it uncontrolled, starting from `defaultValue`. `bind:value` shares the value with the parent. `onValueChange` runs first; `eventDetails.cancel()` vetoes the change. `preventDefault()` on the input event skips clearing form errors and validation. Validation and submission read that element's value, or the controllable value when the render produced no element.
- Validation modes are `onSubmit` (default), `onBlur`, and `onChange`. `onChange` can wait `validationDebounceTime`. After a submit, later edits validate immediately. `valueMissing` stays quiet until the field is marked dirty. A custom `validate` result runs after native errors pass, or on every change once change-validation is active. An empty result is valid. A promise publishes `valid: null` (or keeps a native or custom error) and ignores a stale resolution. A rejection keeps the published state. Enter inside the surrounding form waits one task. That task commits the input value when the form did not submit, and skips the commit when submit already ran. Enter outside the form commits immediately. Blur in `onBlur` mode flushes, then commits the value written during that blur.
- The control registers once through the shared field helper. `getValue()` reads the live value, so a later edit is what `validate` and `formValues` see. Root `name` wins over the control `name`. An invalid field blocks submit and is focused. Async validation does not block the submit that started it. A disabled control is not registered.
- `Field.Error` shows when `match` is true, when a string `match` equals that validity flag, or (when `match` is omitted or false) when there is a form error or `valid === false`. An error array longer than one item renders a list. Closing keeps the element mounted with `data-ending-style` until animations finish.
- `Field.Validity` calls its children snippet with `validity`, `error`, `errors`, `value`, `initialValue`, and `transitionStatus`.
- `Field.Item` has its own labelable scope and `disabled` flag for the item, label, and description. It does not disable `Field.Control`.
- `bind:actions` exposes `validate()`. A `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host.

Differences from React Base UI, all deliberate:

- No `actionsRef` or element `ref`. Use `bind:actions` and `{@attach}`.
- `value` is one `$bindable`. Pass it, or `bind:value`, for a controlled input. Omit it and pass `defaultValue` for the uncontrolled initial value.
- No `className` or style callbacks. Use `class` and `style`.
- Generated ids come from `$props.id()`. The transition status type is `FieldTransitionStatus` so it does not collide with Collapsible.

## How to get to it (user POV)

A consumer imports `Field` from `@sveltery/base` or `@sveltery/base/field` and renders `<Field.Root><Field.Label>Email</Field.Label><Field.Control /></Field.Root>`. For verification, open `/fixtures/field?case=<case>`, where `<case>` is one of `labelled`, `described`, `required`, `disabled`, `invalid`, or `values` (`src/routes/fixtures/field/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh field
```

Handles used by `src/routes/fixtures/field/field.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Label and control: `getByTestId('label')` and `getByTestId('control')`. The textbox name is `Email`.
- Description: `getByTestId('description')`
- Required submit: `getByRole('button', { name: 'Submit' })`, `getByText('Required')`, `getByTestId('submitted')`
- Values: `getByTestId('values')`

Proof of working order: in both frameworks, the label `for` equals the control `id`, the description id follows the author id in `aria-describedby`, an empty required control blocks submit and shows `Required`, a disabled control is disabled, `invalid` sets `data-invalid` and `aria-invalid`, and submit reports `{"username":"ada"}`. The SSR test checks that the server HTML already contains the same `base-ui-` id on the label's `for` and the input's `id`.

Component tests (`src/lib/field/Field.svelte.spec.ts`) port the upstream root, label, control, error, and validity assertions that do not need Checkbox, Radio, or NumberField. `src/lib/field/validity.spec.ts` covers combined validity without a document.

## Gotchas

- `Field.Error` stays mounted through `data-ending-style` until its animations finish. A count of error nodes can include the exiting one for a frame.
- Vitest browser locators have no `blur()` or `press()`. Dispatch a `FocusEvent` or use `userEvent`.
- Playwright's `fill()` dispatches an input event that is not cancelable, so a capture `preventDefault()` does not stick. Dispatch a cancelable `InputEvent` to cover that path.
- `toHaveAttribute` compares the attribute string. A regex is not a pattern match.

## Not ported

- Checkbox, Radio, RadioGroup, NumberField, and Select as field controls. `Input` wraps `Field.Control`.
- `className` and `style` state callbacks.
- React `actionsRef` and element `ref` props.
- React 17 id fallbacks, StrictMode double-mount, and render-count tests.
