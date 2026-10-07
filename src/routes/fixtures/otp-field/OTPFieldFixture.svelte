<script lang="ts">
	import { Field, Form, OTPField } from '#lib';
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
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else if scenario === 'labelled'}
	<Field.Root>
		<Field.Label data-testid="label">Code</Field.Label>
		<OTPField.Root length={6}>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</Field.Root>
{:else if scenario === 'bound'}
	<OTPField.Root length={6} bind:value>
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
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
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<OTPField.Input />
		{/each}
	</OTPField.Root>
{:else}
	<Form onFormSubmit={accept}>
		<Field.Root name="otp">
			<OTPField.Root length={6} required>
				{#each [0, 1, 2, 3, 4, 5] as index (index)}
					<OTPField.Input />
				{/each}
			</OTPField.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{/if}
