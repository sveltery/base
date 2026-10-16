# OTP Field

<Subtitle>
  A one-time password input composed of individual character slots.
</Subtitle>

<Meta name="description" content="A one-time password input composed of individual character slots." />

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const OTP_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white">
		Verification code
	</label>
	<OTPField.Root
		{id}
		length={OTP_LENGTH}
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: OTP_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${OTP_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Enter the 6-character code we sent to your device.
	</p>
</div>
```

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

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white"> Recovery code </label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		validationType="alphanumeric"
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Accept letters and numbers for backup codes such as <code class="font-mono">A7C9XZ</code>.
	</p>
</div>
```

### Grouped layouts

Wrap subsets of inputs in your own layout elements and use `<OTPField.Separator>` when you
want the code presented in smaller visual chunks such as `123-456`.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const OTP_LENGTH = 6;
	const id = $props.id();
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white">
		Verification code
	</label>
	<OTPField.Root {id} length={OTP_LENGTH} class="flex w-full items-center gap-2">
		<div class="flex gap-2">
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input
					class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
					aria-label={index === 0 ? undefined : `Character ${index + 1} of ${OTP_LENGTH}`}
				/>
			{/each}
		</div>
		<OTPField.Separator class="h-px w-4 bg-current text-neutral-950 dark:text-white" />
		<div class="flex gap-2">
			{#each { length: 3 } as _, index (index)}
				<OTPField.Input
					class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
					aria-label={`Character ${index + 4} of ${OTP_LENGTH}`}
				/>
			{/each}
		</div>
	</OTPField.Root>
</div>
```

### Placeholder hints

`<OTPField.Input>` is a real input, so native `placeholder` props and CSS work as usual. This
example keeps placeholder hints visible until the active slot receives focus.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white">
		Verification code
	</label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white focus:placeholder:text-transparent dark:border-white dark:text-white dark:placeholder:text-neutral-400"
				placeholder="•"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Placeholder hints can stay visible until the active slot is focused.
	</p>
</div>
```

### Custom normalization

Use `normalizeValue` to normalize accepted values before state updates, such as converting
alphanumeric codes to uppercase. It runs after `validationType` filtering, and the result is filtered
against `validationType` again. Use `validationType="none"` when the normalizer should provide the
full validation rule.

Pair custom rules with `inputmode` for keyboard hints and `onValueInvalid` for rejected characters.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;

	let focusedIndex = $state(0);
	let invalidPulse = $state(0);
	let statusMessage = $state('');
	let invalidTimeout: ReturnType<typeof setTimeout> | undefined;
	let skipClearOnNextValueChange = false;

	$effect(() => () => clearTimeout(invalidTimeout));

	function normalizeRecoveryCode(value: string) {
		return value.toUpperCase();
	}

	function handleValueChange() {
		if (skipClearOnNextValueChange) {
			skipClearOnNextValueChange = false;
			return;
		}
		clearTimeout(invalidTimeout);
		invalidPulse = 0;
		statusMessage = '';
	}

	function handleValueInvalid(value: string) {
		skipClearOnNextValueChange = true;
		invalidPulse += 1;
		statusMessage = `Unsupported characters were ignored from ${value}.`;
		clearTimeout(invalidTimeout);
		invalidTimeout = setTimeout(() => {
			invalidPulse = 0;
		}, 400);
	}

	function invalidClass(index: number) {
		if (invalidPulse === 0 || focusedIndex !== index) return '';
		return invalidPulse % 2 === 0
			? 'border-red-700! outline-2 -outline-offset-1 outline-red-700! focus:outline-red-700! dark:border-red-400! dark:outline-red-400! dark:focus:outline-red-400! animate-[otp-field-shake-b_180ms_ease-in-out]'
			: 'border-red-700! outline-2 -outline-offset-1 outline-red-700! focus:outline-red-700! dark:border-red-400! dark:outline-red-400! dark:focus:outline-red-400! animate-[otp-field-shake-a_180ms_ease-in-out]';
	}
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white"> Recovery code </label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		validationType="alphanumeric"
		normalizeValue={normalizeRecoveryCode}
		onValueChange={handleValueChange}
		onValueInvalid={handleValueInvalid}
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white {invalidClass(
					index
				)}"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
				onfocus={() => (focusedIndex = index)}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Letters and digits only. Letters are converted to uppercase.
	</p>
	<span aria-live="polite" class="sr-only">{statusMessage}</span>
</div>

<style>
	@keyframes -global-otp-field-shake-a {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}

	@keyframes -global-otp-field-shake-b {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}
</style>
```

### Masked entry

Use `mask` when the code should be obscured while it is being typed.

```svelte demo
<script lang="ts">
	import { OTPField } from '@sveltery/base/otp-field';

	const CODE_LENGTH = 6;
	const id = $props.id();
	const descriptionId = `${id}-description`;
</script>

<div class="flex w-full max-w-80 flex-col items-start gap-1">
	<label for={id} class="text-sm font-bold text-neutral-950 dark:text-white"> Access code </label>
	<OTPField.Root
		{id}
		length={CODE_LENGTH}
		mask
		aria-describedby={descriptionId}
		class="flex w-full gap-2"
	>
		{#each { length: CODE_LENGTH } as _, index (index)}
			<OTPField.Input
				class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white dark:bg-neutral-950 text-center font-inherit text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
				aria-label={index === 0 ? undefined : `Character ${index + 1} of ${CODE_LENGTH}`}
			/>
		{/each}
	</OTPField.Root>
	<p id={descriptionId} class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
		Use <code class="font-mono">mask</code> to obscure the code on shared screens.
	</p>
</div>
```

## API reference

### Root

<ApiPart name="otp-field" part="Root" />

| Attribute       | Description                                                                     |
| --------------- | ------------------------------------------------------------------------------- |
| `data-disabled` | Present when the OTP field is disabled.                                         |
| `data-readonly` | Present when the OTP field is readonly.                                         |
| `data-required` | Present when the OTP field is required.                                         |
| `data-valid`    | Present when the OTP field is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`  | Present when the OTP field is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`    | Present when the OTP field's value has changed (when wrapped in Field.Root).    |
| `data-touched`  | Present when the OTP field has been touched (when wrapped in Field.Root).       |
| `data-complete` | Present when all slots are filled.                                              |
| `data-filled`   | Present when the OTP field contains at least one character.                     |
| `data-focused`  | Present when one of the OTP field inputs is focused.                            |

### Input

<ApiPart name="otp-field" part="Input" />

| Attribute       | Description                                                                     |
| --------------- | ------------------------------------------------------------------------------- |
| `data-disabled` | Present when the OTP field is disabled.                                         |
| `data-readonly` | Present when the OTP field is readonly.                                         |
| `data-required` | Present when the OTP field is required.                                         |
| `data-valid`    | Present when the OTP field is in a valid state (when wrapped in Field.Root).    |
| `data-invalid`  | Present when the OTP field is in an invalid state (when wrapped in Field.Root). |
| `data-dirty`    | Present when the OTP field's value has changed (when wrapped in Field.Root).    |
| `data-touched`  | Present when the OTP field has been touched (when wrapped in Field.Root).       |
| `data-complete` | Present when all slots are filled.                                              |
| `data-filled`   | Present when the input contains a character.                                    |
| `data-focused`  | Present when any OTP field input is focused.                                    |

### Separator

<ApiPart name="otp-field" part="Separator" />

| Attribute          | Description                                 |
| ------------------ | ------------------------------------------- |
| `data-orientation` | Indicates the orientation of the separator. |
