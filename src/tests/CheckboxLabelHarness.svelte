<script lang="ts">
	import { Checkbox } from '#lib';

	let {
		scenario = 'sibling'
	}: {
		scenario?: 'sibling' | 'checkbox-id' | 'wrap' | 'native' | 'readonly';
	} = $props();

	let id = $state('checkbox-input-a');
</script>

{#if scenario === 'sibling'}
	<label for="checkbox-input">Label</label>
	<Checkbox.Root id="checkbox-input" />
{:else if scenario === 'checkbox-id'}
	<label for="checkbox-input-a">Label A</label>
	<label for="checkbox-input-b">Label B</label>
	<Checkbox.Root {id} />
	<button type="button" onclick={() => (id = 'checkbox-input-b')}>Toggle</button>
{:else if scenario === 'wrap'}
	<label data-testid="label">
		<Checkbox.Root />
		Toggle
	</label>
{:else if scenario === 'native'}
	<label data-testid="label" for="myCheckbox">Toggle</label>
	<Checkbox.Root id="myCheckbox" nativeButton>
		{#snippet render(props)}
			<button {...props}>Toggle</button>
		{/snippet}
	</Checkbox.Root>
{:else}
	<label data-testid="label">
		<Checkbox.Root readOnly />
	</label>
{/if}
