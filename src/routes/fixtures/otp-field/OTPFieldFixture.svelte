<script lang="ts">
	import OtpInputs from '../OtpInputs.svelte';
	import OtpRequired from './OtpRequired.svelte';
	import { Field, OTPField } from '#lib';
	import type { OTPFieldCase } from './cases.js';

	let { scenario }: { scenario: OTPFieldCase } = $props();

	let value = $state('');
	let submitted = $state(0);

	function accept(_formValues: Record<string, unknown>, details: { event: Event }) {
		details.event.preventDefault();
		submitted += 1;
	}
</script>

{#if scenario === 'plain'}
	<OTPField.Root length={6}>
		<OtpInputs />
	</OTPField.Root>
{:else if scenario === 'labelled'}
	<Field.Root>
		<Field.Label data-testid="label">Code</Field.Label>
		<OTPField.Root length={6}>
			<OtpInputs />
		</OTPField.Root>
	</Field.Root>
{:else if scenario === 'bound'}
	<OTPField.Root length={6} bind:value>
		<OtpInputs />
	</OTPField.Root>
	<output data-testid="value">{value}</output>
{:else if scenario === 'grouped'}
	<OTPField.Root length={6} defaultValue="123456" data-testid="root">
		<div>
			<OTPField.Input />
			<OTPField.Input />
			<OTPField.Input />
		</div>
		<OTPField.Separator>-</OTPField.Separator>
		<div>
			<OTPField.Input />
			<OTPField.Input />
			<OTPField.Input />
		</div>
	</OTPField.Root>
{:else if scenario === 'disabled'}
	<OTPField.Root length={6} disabled data-testid="root">
		<OtpInputs />
	</OTPField.Root>
{:else}
	<OtpRequired {accept} {submitted} />
{/if}
