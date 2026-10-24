# Input OTP

<Subtitle>
  A one-time password input that types into one input and draws each character in its own slot.
</Subtitle>

<Meta name="description" content="A one-time password input that types into one input and draws each character in its own slot." />

<DemoInputOTPHero />

InputOTP ports [input-otp](https://github.com/guilhermerodz/input-otp) 1.4.2, which Sveltery UI's input OTP is built on. One real `<input>` sits over the slots, so typing, paste, selection and autofill are the browser's own. For the Base UI part with one input per slot, see [OTP Field](/components/otp-field).

## Anatomy

Import the component and draw the slots from its state:

```svelte title="Anatomy"
<script lang="ts">
	import { InputOTP } from '@sveltery/base/input-otp';
</script>

<InputOTP.Root maxlength={6}>
	{#snippet render({ slots })}
		{#each slots as slot}
			<div>{slot.char}</div>
		{/each}
	{/snippet}
</InputOTP.Root>
```

## Examples

### Slots as children

Without `render`, `children` renders. A slot component reads the state with `getInputOTPContext()`:

```svelte title="Slot.svelte"
<script lang="ts">
	import { getInputOTPContext } from '@sveltery/base/input-otp';

	let { index }: { index: number } = $props();

	const otp = getInputOTPContext();
	const slot = $derived(otp.slots[index]);
</script>

<div data-active={slot.isActive}>{slot.char}</div>
```

### Patterns

`pattern` drops input that doesn't match. `REGEXP_ONLY_DIGITS`, `REGEXP_ONLY_CHARS` and `REGEXP_ONLY_DIGITS_AND_CHARS` are exported:

```svelte title="Letters and digits"
<InputOTP.Root maxlength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} inputmode="text">
	<!-- slots -->
</InputOTP.Root>
```

### Reading the input

Rest props go to the input, attachments included:

```svelte title="Focus on mount"
<InputOTP.Root maxlength={6} {@attach (input) => input.focus()}>
	<!-- slots -->
</InputOTP.Root>
```

## API reference

<script>
	import { DemoInputOTPHero } from './demos/hero';
	import { TypesInputOTP } from './types';
</script>

### Root

<TypesInputOTP.Root />
