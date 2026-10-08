# Form

A native `<form>` that collects registered fields, blocks submit when one is invalid, and focuses the first invalid control. Upstream: `packages/react/src/form/Form.tsx` and `packages/react/src/internals/form-context/FormContext.ts` at Base UI v1.8.0. Local: `src/lib/form/`.

## Sub-features

- Renders a `<form novalidate>`. `novalidate={false}` leaves the attribute off so the browser can block submit.
- On submit, every registered field's `validate()` runs, then the first invalid control is focused. An `input` also gets `select()`. A textarea is focused and not selected.
- Invalid fields are ordered by document position. Separate shadow roots stay in registration order.
- An invalid field with no control still blocks submit.
- `valid: null` (a validator that has not finished) does not block. Validation is not awaited.
- `onsubmit` runs only when nothing blocked the submit. `onFormSubmit` then receives named field values and a details object whose event is already `defaultPrevented`, with reason `none`.
- `bind:errors` holds external errors keyed by field name. After a submit that was not blocked, the next errors object focuses the first control that is invalid or whose name is a key, even when that control's id is different. `clearErrors` drops one key.
- `bind:actions` exposes `validate()` for every field, or the first field with a given name.
- Fields outside `<Form>` share one fallback registry, matching the upstream default context.
- A `render` snippet receives `(props, state, children)`. Consumer `{@attach}` reaches the host through the spread props.

Differences from React Base UI, all deliberate:

- No `actionsRef`. Use `bind:actions`.
- No element `ref`. Consumers pass `{@attach}`. The default host uses `bind:this`. A `render` host records the element through the spread props. Fields register on `fields`, the submit count is `submitCount`, and a field's focusable element is `control`.
- No `className` or style callbacks. Use `class` and `style` strings.
- The submit listener is the native `onsubmit`. `preventDefault()` does not skip `onFormSubmit`.
- `render` receives a children snippet. Spread `props` onto the host and render that snippet inside it.

## How to get to it (user POV)

A consumer imports `Form` from `@sveltery/base` or `@sveltery/base/form` and renders `<Form onFormSubmit={save}>...</Form>`. For verification, open `/fixtures/form?case=<case>`, where `<case>` is one of `default`, `unregistered`, `browser`, `values` or `render` (`src/routes/fixtures/form/cases.ts`). Add `&reference` to get React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh form
```

Handles used by `src/routes/fixtures/form/form.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Form: `#tested-form`
- Submit: `getByRole('button', { name: 'Submit' })`
- Counts: `getByTestId('submitted')` and `getByTestId('values')`
- Email input on `unregistered` and `browser`: `getByRole('textbox', { name: 'Email' })`

Proof of working order: in both frameworks, the default form has `novalidate` and a click increments the submit count. An unregistered required input still submits. `browser` omits `novalidate` and the count stays `0`. `values` reports `{}`. `render` keeps `novalidate`, `data-custom="true"` and the text `Inside`. The SSR test checks that the server HTML already contains `novalidate` on the default form and omits it on the `browser` form tag.

Component tests (`src/lib/form/Form.svelte.spec.ts`) cover the registry: blocked submit, document order, shadow roots, values, actions, errors and attachments. A field is a test double that writes the upstream registry entry. It is not Field.

## Not ported

- Checkbox, NumberField and Switch. Their Form tests (error text, `aria-invalid`, async validators, disabled fieldset exclusion, strict-mode registration) wait for those components. Field registers itself; its tests live with Field.
- `className` and `style` state callbacks.
- React `actionsRef` and element `ref` props.
