<script lang="ts">
	import { Field, Select } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';
	import { takeForm } from '../form-log.js';
	import { fruits, type SelectCase } from './cases.js';

	let { scenario }: { scenario: SelectCase } = $props();

	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#snippet parts()}
	<Select.Trigger data-testid="control">
		<Select.Value data-testid="value" placeholder="Pick a fruit" />
		<Select.Icon />
	</Select.Trigger>
	<Select.Portal>
		<Select.Positioner data-testid="positioner">
			<Select.Popup data-testid="popup">
				{#each Object.entries(fruits) as [value, label] (value)}
					<Select.Item {value}>
						<Select.ItemText data-testid="text-{value}">{label}</Select.ItemText>
					</Select.Item>
				{/each}
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
{/snippet}

{#if scenario === 'plain'}
	<Select.Root items={fruits}>{@render parts()}</Select.Root>
{:else if scenario === 'multiple'}
	<Select.Root items={fruits} multiple>{@render parts()}</Select.Root>
{:else if scenario === 'form'}
	<FormSubmit {accept} {submitted} {values}>
		<Field.Root name="fruit" data-testid="field">
			<Field.Label data-testid="label">Fruit</Field.Label>
			<Select.Root items={fruits} required>{@render parts()}</Select.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
	</FormSubmit>
{:else if scenario === 'reset'}
	<form>
		<Select.Root items={fruits} name="fruit" defaultValue="apple">{@render parts()}</Select.Root>
		<button type="reset">Reset</button>
	</form>
{:else if scenario === 'disabled'}
	<Select.Root items={fruits} defaultValue="apple" disabled>{@render parts()}</Select.Root>
{:else if scenario === 'readonly'}
	<Select.Root items={fruits} defaultValue="apple" readonly>{@render parts()}</Select.Root>
{:else}
	<div style="padding-top: 200px">
		<Select.Root items={fruits} defaultValue="banana">{@render parts()}</Select.Root>
	</div>
{/if}
