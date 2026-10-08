<script lang="ts">
	import { Field, OTPField } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';
	import OtpInputs from '../OtpInputs.svelte';

	let {
		accept,
		submitted
	}: {
		accept: (formValues: Record<string, unknown>, details: { event: Event }) => void;
		submitted: number;
	} = $props();
</script>

<FormSubmit {accept} {submitted}>
	<Field.Root name="otp">
		<OTPField.Root length={6} required>
			<OtpInputs />
		</OTPField.Root>
		<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
	</Field.Root>
</FormSubmit>
