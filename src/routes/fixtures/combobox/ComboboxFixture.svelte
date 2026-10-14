<!--
	Fixture cases for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Combobox, Field } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';
	import { takeForm } from '../form-log.js';
	import { fruits, gridRows, type ComboboxCase } from './cases.js';

	let { scenario }: { scenario: ComboboxCase } = $props();

	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#snippet list()}
	<Combobox.Portal>
		<Combobox.Positioner data-testid="positioner">
			<Combobox.Popup data-testid="popup">
				{#if scenario === 'popup-input'}<Combobox.Input data-testid="input" />{/if}
				<Combobox.Empty data-testid="empty">No fruits found</Combobox.Empty>
				<Combobox.List>
					<Combobox.Collection>
						{#snippet children(item: string)}
							<Combobox.Item value={item}>{item}</Combobox.Item>
						{/snippet}
					</Combobox.Collection>
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
{/snippet}

{#snippet control()}
	<Combobox.InputGroup>
		<Combobox.Input data-testid="input" />
		<Combobox.Clear data-testid="clear" aria-label="Clear" />
		<Combobox.Trigger data-testid="trigger" aria-label="Open" />
	</Combobox.InputGroup>
	{@render list()}
{/snippet}

{#if scenario === 'plain'}
	<Combobox.Root items={fruits}>{@render control()}</Combobox.Root>
{:else if scenario === 'multiple'}
	<Combobox.Root items={fruits} multiple>
		<Combobox.Chips data-testid="chips">
			<Combobox.Value>
				{#snippet children(selected)}
					{#each selected as string[] as fruit (fruit)}
						<Combobox.Chip data-testid="chip-{fruit}">
							{fruit}
							<Combobox.ChipRemove aria-label="Remove {fruit}" />
						</Combobox.Chip>
					{/each}
				{/snippet}
			</Combobox.Value>
			<Combobox.Input data-testid="input" />
		</Combobox.Chips>
		{@render list()}
	</Combobox.Root>
{:else if scenario === 'popup-input'}
	<Combobox.Root items={fruits}>
		<Combobox.Trigger data-testid="trigger">
			<Combobox.Value placeholder="Pick a fruit" />
		</Combobox.Trigger>
		{@render list()}
	</Combobox.Root>
{:else if scenario === 'grid'}
	<Combobox.Root grid>
		<Combobox.Input data-testid="input" aria-label="Color" />
		<Combobox.Portal>
			<Combobox.Positioner data-testid="positioner">
				<Combobox.Popup data-testid="popup">
					<Combobox.List>
						{#each gridRows as row (row[0])}
							<Combobox.Row>
								{#each row as color (color)}
									<Combobox.Item value={color}>{color}</Combobox.Item>
								{/each}
							</Combobox.Row>
						{/each}
					</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{:else if scenario === 'form'}
	<FormSubmit {accept} {submitted} {values}>
		<Field.Root name="fruit" data-testid="field">
			<Field.Label data-testid="label">Fruit</Field.Label>
			<Combobox.Root items={fruits} required>{@render control()}</Combobox.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
	</FormSubmit>
{:else if scenario === 'reset'}
	<form>
		<Combobox.Root items={fruits} name="fruit" defaultValue="Apple"
			>{@render control()}</Combobox.Root
		>
		<button type="reset">Reset</button>
	</form>
{:else if scenario === 'disabled'}
	<Combobox.Root items={fruits} defaultValue="Apple" disabled>{@render control()}</Combobox.Root>
{:else}
	<Combobox.Root items={fruits} defaultValue="Apple" readonly>{@render control()}</Combobox.Root>
{/if}
