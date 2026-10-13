<script lang="ts">
	import OtpInputs from '../routes/fixtures/OtpInputs.svelte';
	import { OTPField } from '#lib';
	import type { OTPFieldRootProps } from '#lib/otp-field/types.js';

	let props: Omit<OTPFieldRootProps, 'length'> = $props();
</script>

<OTPField.Root {...props} length={6}>
	<OtpInputs />
</OTPField.Root>
