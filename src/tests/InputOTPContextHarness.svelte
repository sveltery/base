<script lang="ts">
	import { InputOTP } from '../lib/input-otp/index.js';
	import InputOTPContextSlot from './InputOTPContextSlot.svelte';

	let { defaultValue = '' }: { defaultValue?: string } = $props();
</script>

<InputOTP.Root maxlength={4} {defaultValue}>
	{#each { length: 4 } as _, index (index)}
		<InputOTPContextSlot {index} />
	{/each}
</InputOTP.Root>
