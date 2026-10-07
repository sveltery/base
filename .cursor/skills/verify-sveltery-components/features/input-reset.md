# Input reset

The default Input is uncontrolled. Its reset default is the `defaultValue` ("seed"), not a controlled `value`. Form reset restores that seed. This is the Svelte rule. React's rule, where assigning `value` also becomes the reset default, stays in the React reference and is not the expected Svelte result ([I-02](../../../../docs/upstream-differences.md)).

## Sub-features

- The field starts at `seed`.
- Typing replaces the DOM value.
- "Reset" restores `seed`.
- Reset does not have to emit `onValueChange`. The owner output can stay at its previous value.

## How to get to it (user POV)

Open `/input?case=default`. The field is `#tested-input`. The button labeled "Reset" is the form's native reset.

## Driving it with Playwright

```js
await page.goto(origin + '/input?case=default');
await page.locator('main[data-hydrated="true"]').waitFor();
const field = page.locator('#tested-input');
await field.fill('typed');
await page.getByRole('button', { name: 'Reset' }).click();
```

End state: the input's value is `seed` again.

## Gotchas

- `/input?case=controlled` passes `value` ("owner") and does not pass `defaultValue` unless the scenario name includes `default`. On Svelte, reset then clears to empty. Expecting it to return "owner" is the React reset rule. Do not "fix" the port to match it.
- The field has no accessible name in this fixture. Use `#tested-input`.
- "Programmatic", "Props", and "Replace" are harness buttons. They are not the Input.
