# Forms

Read the current docs before you write form code:

- [handbook/forms](https://base.sveltery.dev/handbook/forms.md): labeling, validation, server errors, Superforms, TanStack Form.
- [handbook/sveltekit](https://base.sveltery.dev/handbook/sveltekit.md): form actions, remote forms, server rendering.
- [components/field](https://base.sveltery.dev/components/field.md), [components/fieldset](https://base.sveltery.dev/components/fieldset.md), [components/form](https://base.sveltery.dev/components/form.md).

## Rules that hold today

- **Wrap each control in `Field.Root`** with `Field.Label`, `Field.Description`, and `Field.Error`. Field links the `for`, `aria-labelledby`, and `aria-describedby` ids for you.
- **Put `name` on `Field.Root`**, not on the control, so the value submits with the form. The name is a path, such as `address.city` or `members[0].email`.
- **Label every control.** `Input`, `NumberField`, `OTPField`, `Autocomplete`, `Checkbox`, `Radio`, and `Switch` take `Field.Label` or a native `<label>`. `Select` uses `Select.Label`, `Slider` uses `Slider.Label`, and a `Combobox` whose input is inside the popup uses `Combobox.Label`.
- **Group related controls with `Fieldset.Root` and `Fieldset.Legend`.** A `CheckboxGroup` or `RadioGroup` renders its own `<fieldset>`, so put the `Fieldset.Legend` inside it.
- **Checkbox, Switch and Radio are real inputs.** Read `event.currentTarget.checked` in the native `onchange`, or use `bind:checked` and a `RadioGroup`'s `bind:value`. They have no `onCheckedChange`, and `RadioGroup` has no `onValueChange`.
- **Select, Slider, and NumberField submit through native inputs.** Use `bind:value`, or read the value in the native `oninput` and `onchange` on the root: `event.currentTarget.value` for Select, `valueAsNumber` for Slider and NumberField. They have no `onValueChange` or `onValueCommitted`. Native input props on the root, such as `required` and `form`, go to that input. On Slider and NumberField, `host` sends element attributes such as `data-testid` to the root element. Select.Root renders no element, so put those on `Select.Trigger`.
- **Spread a remote form field on these controls** with `.as('select')` (or `.as('select multiple')`), `.as('range')`, or `.as('number')`. A range slider takes one `.as('range')` per `Slider.Thumb`, such as `price[0]` and `price[1]`. Without a spread, the control binds itself to its `Field.Root name`.
- **Validate with the native constraint attributes** (`required`, `minlength`, `pattern`, ...) or the `validate` prop on `Field.Root`. `Field.Error` with `match` shows a message for one validity state.
- **Pass a SvelteKit remote form to `Form`'s `form` prop**, as `<Form form={signup}>`. Each `Field.Root name` shows the issues at its path. Do not pass `errors`, `values`, or `onsubmit` with it.
- **Pass form action errors to `Form`'s `errors` prop** and the submitted values to `values`, keyed by field `name`. Each `Field.Error` finds its message through context.
- **Show form-level messages with `Form.Error`**: `errors['']`, or a remote form's `invalid('message')`.
- **Read submitted values from `FormData` in `onsubmit`.** The browser's constraint check blocks an invalid submit before `onsubmit` runs, with and without JavaScript. Validate on the server too.

```svelte
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Form } from '@sveltery/base/form';
	import { Input } from '@sveltery/base/input';
</script>

<Form>
	<Field.Root name="email">
		<Field.Label>Email</Field.Label>
		<Input type="email" required />
		<Field.Description>We never share it.</Field.Description>
		<Field.Error />
	</Field.Root>
</Form>
```
