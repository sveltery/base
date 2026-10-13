<script lang="ts">
	import OtpInputs from '../routes/fixtures/OtpInputs.svelte';
	import { OTPField } from '#lib';
	import type { OTPFieldRootProps } from '#lib/otp-field/types.js';

	let props: OTPFieldRootProps = $props();
</script>

<OTPField.Root length={6} {...props}>
	<OtpInputs />
</OTPField.Root>
