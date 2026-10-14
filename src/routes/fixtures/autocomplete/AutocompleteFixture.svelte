<!--
	Fixture cases for the Autocomplete port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Autocomplete, Field } from '#lib';
	import FormSubmit from '../FormSubmit.svelte';
	import { takeForm } from '../form-log.js';
	import { tags, type AutocompleteCase } from './cases.js';

	let { scenario }: { scenario: AutocompleteCase } = $props();

	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#snippet control()}
	<Autocomplete.InputGroup>
		<Autocomplete.Input data-testid="input" />
		<Autocomplete.Clear data-testid="clear" aria-label="Clear" />
		<Autocomplete.Trigger data-testid="trigger" aria-label="Open" />
	</Autocomplete.InputGroup>
	<Autocomplete.Portal>
		<Autocomplete.Positioner data-testid="positioner">
			<Autocomplete.Popup data-testid="popup">
				<Autocomplete.Empty data-testid="empty">No tags found</Autocomplete.Empty>
				<Autocomplete.List>
					<Autocomplete.Collection>
						{#snippet children(tag: string)}
							<Autocomplete.Item value={tag}>{tag}</Autocomplete.Item>
						{/snippet}
					</Autocomplete.Collection>
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
{/snippet}

{#if scenario === 'plain'}
	<Autocomplete.Root items={tags}>{@render control()}</Autocomplete.Root>
{:else if scenario === 'inline'}
	<Autocomplete.Root items={tags} mode="both">{@render control()}</Autocomplete.Root>
{:else if scenario === 'form'}
	<FormSubmit {accept} {submitted} {values}>
		<Field.Root name="tag" data-testid="field">
			<Field.Label data-testid="label">Tag</Field.Label>
			<Autocomplete.Root items={tags} required>{@render control()}</Autocomplete.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
	</FormSubmit>
{:else if scenario === 'reset'}
	<form>
		<Autocomplete.Root items={tags} name="tag" defaultValue="docs"
			>{@render control()}</Autocomplete.Root
		>
		<button type="reset">Reset</button>
	</form>
{:else if scenario === 'disabled'}
	<Autocomplete.Root items={tags} defaultValue="docs" disabled
		>{@render control()}</Autocomplete.Root
	>
{:else}
	<Autocomplete.Root items={tags} defaultValue="docs" readonly
		>{@render control()}</Autocomplete.Root
	>
{/if}
