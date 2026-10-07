<script lang="ts">
	import { Switch } from '#lib';

	let {
		scenario = 'sibling'
	}: {
		scenario?: 'sibling' | 'switch-id' | 'wrap' | 'native' | 'readonly';
	} = $props();

	let id = $state('switch-input-a');
</script>

{#if scenario === 'sibling'}
	<label for="switch-input">Label</label>
	<Switch.Root id="switch-input" />
{:else if scenario === 'switch-id'}
	<label for="switch-input-a">Label A</label>
	<label for="switch-input-b">Label B</label>
	<Switch.Root {id} />
	<button type="button" onclick={() => (id = 'switch-input-b')}>Toggle</button>
{:else if scenario === 'wrap'}
	<label data-testid="label">
		<Switch.Root />
		Toggle
	</label>
{:else if scenario === 'native'}
	<label data-testid="label" for="mySwitch">Toggle</label>
	<Switch.Root id="mySwitch" nativeButton>
		{#snippet render(props)}
			<button {...props}>Toggle</button>
		{/snippet}
	</Switch.Root>
{:else}
	<label data-testid="label">
		<Switch.Root readOnly />
	</label>
{/if}
