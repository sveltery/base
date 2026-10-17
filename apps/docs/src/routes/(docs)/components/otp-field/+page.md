# OTP Field

<Subtitle>
  A one-time password input composed of individual character slots.
</Subtitle>

<Meta name="description" content="A one-time password input composed of individual character slots." />

<DemoOTPFieldHero />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling an OTP field](#labeling-an-otp-field) and the [forms guide](/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';
</script>

<OTPField.Root>
	<OTPField.Input />
	<OTPField.Separator />
</OTPField.Root>
```

## Examples

### Labeling an OTP field

Pass an `id` to `<OTPField.Root>` and use a native `<label>` with a matching `for`. Let the
first input use the field label, and add `aria-label` to the remaining inputs so assistive
technology can announce which slot is focused.

Optionally, add `aria-describedby` when supporting text should be announced with the field.

```svelte title="OTP Field with a native label and description"
<div>
	<label for="verification-code">Verification code</label>
	<OTPField.Root id="verification-code" length={6} aria-describedby="verification-code-description">
		<OTPField.Input />
		<OTPField.Input aria-label="Character 2 of 6" />
		<OTPField.Input aria-label="Character 3 of 6" />
		<OTPField.Input aria-label="Character 4 of 6" />
		<OTPField.Input aria-label="Character 5 of 6" />
		<OTPField.Input aria-label="Character 6 of 6" />
	</OTPField.Root>
	<p id="verification-code-description">Enter the 6-character code we sent to your device.</p>
</div>
```

### Form integration

Use [Field](/components/field) to handle label associations and form integration:

```svelte title="Using OTP Field in a form"
<Form>
	<!-- @highlight -->
	<Field.Root name="verificationCode">
		<Field.Label>Verification code</Field.Label>
		<Field.Description>Enter the 6-character code we sent to your device.</Field.Description>
		<OTPField.Root length={6}>
			<OTPField.Input />
			<OTPField.Input aria-label="Character 2 of 6" />
			<OTPField.Input aria-label="Character 3 of 6" />
			<OTPField.Input aria-label="Character 4 of 6" />
			<OTPField.Input aria-label="Character 5 of 6" />
			<OTPField.Input aria-label="Character 6 of 6" />
		</OTPField.Root>
	</Field.Root>
</Form>
```

Pass `autoSubmit` to submit the owning form automatically when all slots are filled, or use
`onValueComplete` to react to completion without submitting.

### Alphanumeric verification codes

Use `validationType="alphanumeric"` for recovery, backup, or invite codes that mix letters and
numbers.

<DemoOTPFieldAlphanumeric />

### Grouped layouts

Wrap subsets of inputs in your own layout elements and use `<OTPField.Separator>` when you
want the code presented in smaller visual chunks such as `123-456`.

<DemoOTPFieldGrouped />

### Placeholder hints

`<OTPField.Input>` is a real input, so native `placeholder` props and CSS work as usual. This
example keeps placeholder hints visible until the active slot receives focus.

<DemoOTPFieldFocusedPlaceholder />

### Custom normalization

Use `normalizeValue` to normalize accepted values before state updates, such as converting
alphanumeric codes to uppercase. It runs after `validationType` filtering, and the result is filtered
against `validationType` again. Use `validationType="none"` when the normalizer should provide the
full validation rule.

Pair custom rules with `inputmode` for keyboard hints and `onValueInvalid` for rejected characters.

<DemoOTPFieldCustomNormalize />

### Masked entry

Use `mask` when the code should be obscured while it is being typed.

<DemoOTPFieldPassword />

## API reference

<script>
	import { DemoOTPFieldHero } from './demos/hero';
	import { DemoOTPFieldAlphanumeric } from './demos/alphanumeric';
	import { DemoOTPFieldGrouped } from './demos/grouped';
	import { DemoOTPFieldFocusedPlaceholder } from './demos/focused-placeholder';
	import { DemoOTPFieldCustomNormalize } from './demos/custom-sanitize';
	import { DemoOTPFieldPassword } from './demos/password';
	import { TypesOTPField } from './types';
</script>

### Root

<TypesOTPField.Root />

### Input

<TypesOTPField.Input />

### Separator

<TypesOTPField.Separator />
