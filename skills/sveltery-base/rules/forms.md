# Forms

Field, Fieldset, and Form are being reworked to match Base UI exactly, so this file stays short. Read the current docs before you write form code:

- [handbook/forms](https://base.sveltery.dev/handbook/forms.md): labeling, validation, server errors, Superforms, TanStack Form.
- [handbook/sveltekit](https://base.sveltery.dev/handbook/sveltekit.md): form actions, remote forms, server rendering.
- [components/field](https://base.sveltery.dev/components/field.md), [components/fieldset](https://base.sveltery.dev/components/fieldset.md), [components/form](https://base.sveltery.dev/components/form.md).

## Rules that hold today

- **Wrap each control in `Field.Root`** with `Field.Label`, `Field.Description`, and `Field.Error`. Field links the `for`, `aria-labelledby`, and `aria-describedby` ids for you.
- **Put `name` on `Field.Root`**, not on the control, so the value submits with the form.
- **Label every control.** `Input`, `NumberField`, `OTPField`, `Autocomplete`, `Checkbox`, `Radio`, and `Switch` take `Field.Label` or a native `<label>`. `Select` uses `Select.Label`, `Slider` uses `Slider.Label`, and a `Combobox` whose input is inside the popup uses `Combobox.Label`.
- **Group related controls with `Fieldset.Root` and `Fieldset.Legend`**, such as the radios in a `RadioGroup` or the boxes in a `CheckboxGroup`.
- **Validate with the native constraint attributes** (`required`, `minlength`, `pattern`, ...) or the `validate` prop on `Field.Root`. `Field.Error` with `match` shows a message for one validity state.
- **Pass server errors to `Form`'s `errors` prop**, keyed by field `name`. Each `Field.Error` finds its message through context.
- **Validate on the server too.** `Form` renders `novalidate`, so a form posted before hydration or with JavaScript off is unchecked.

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
