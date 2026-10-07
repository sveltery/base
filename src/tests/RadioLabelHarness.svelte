<script lang="ts">
	import { Radio } from '#lib';

	let {
		scenario = 'sibling'
	}: {
		scenario?: 'sibling' | 'radio-id' | 'wrap' | 'native';
	} = $props();

	let id = $state('radio-input-a');
</script>

{#if scenario === 'sibling'}
	<label for="radio-input">Label</label>
	<Radio.Root id="radio-input" value="a" />
{:else if scenario === 'radio-id'}
	<label for="radio-input-a">Label A</label>
	<label for="radio-input-b">Label B</label>
	<Radio.Root {id} value="a" />
	<button type="button" onclick={() => (id = 'radio-input-b')}>Toggle</button>
{:else if scenario === 'wrap'}
	<label data-testid="label">
		<Radio.Root value="a" />
		Toggle
	</label>
{:else}
	<label data-testid="label" for="myRadio">Toggle</label>
	<Radio.Root id="myRadio" value="a" nativeButton>
		{#snippet render(props)}
			<button {...props}>Toggle</button>
		{/snippet}
	</Radio.Root>
{/if}
