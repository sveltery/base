<script lang="ts">
	import BaseOTPInput from './BaseOTPInput.svelte';
	import type { InputOTPCase } from './cases.js';

	let { scenario }: { scenario: InputOTPCase } = $props();

	let disabled = $state(false);
</script>

{#if scenario === 'base'}
	<BaseOTPInput />
{:else if scenario === 'props'}
	<BaseOTPInput data-testid="input-otp-1" disabled />
	<BaseOTPInput data-testid="input-otp-2" inputmode="numeric" />
	<BaseOTPInput data-testid="input-otp-3" inputmode="text" />
	<BaseOTPInput data-testid="input-otp-4" containerClass="testclassname" />
	<BaseOTPInput data-testid="input-otp-5" maxlength={3} />
	<BaseOTPInput data-testid="input-otp-6" id="testid" name="testname" />
	<BaseOTPInput data-testid="input-otp-7" pattern=" " />
{:else if scenario === 'with-on-complete'}
	<BaseOTPInput onComplete={() => (disabled = true)} {disabled} />
{:else}
	<BaseOTPInput autofocus />
{/if}
