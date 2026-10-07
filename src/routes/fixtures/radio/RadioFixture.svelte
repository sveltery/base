<script lang="ts">
	import { Radio } from '#lib';
	import type { RadioCase } from './cases.js';

	let { scenario }: { scenario: RadioCase } = $props();

	let parentClicks = $state(0);
	let submitted = $state(0);

	function stop(event: MouseEvent) {
		if (scenario === 'stop') event.stopPropagation();
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
	}
</script>

{#if scenario === 'checked'}
	<Radio.Root id="tested-radio" value="">
		<Radio.Indicator data-testid="indicator" />
		Checked
	</Radio.Root>
{:else if scenario === 'disabled' || scenario === 'readonly'}
	<Radio.Root
		id="tested-radio"
		value="blue"
		disabled={scenario === 'disabled'}
		readOnly={scenario === 'readonly'}
	>
		Blue
	</Radio.Root>
{:else if scenario === 'label'}
	<label for="tested-radio">Label</label>
	<Radio.Root id="tested-radio" value="blue">Blue</Radio.Root>
{:else if scenario === 'native'}
	<Radio.Root id="tested-radio" value="blue" nativeButton aria-label="Blue">
		{#snippet render(props)}
			<button {...props}>Blue</button>
		{/snippet}
	</Radio.Root>
{:else if scenario === 'required' || scenario === 'enter'}
	<form {onsubmit}>
		<Radio.Root id="tested-radio" value="blue" required={scenario === 'required'}>Blue</Radio.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'null'}
	<Radio.Root id="tested-radio" value={null}>None</Radio.Root>
{:else if scenario === 'bubble' || scenario === 'stop'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div data-testid="parent" onclick={() => (parentClicks += 1)}>
		<Radio.Root id="tested-radio" value="blue" onclick={stop}>Blue</Radio.Root>
	</div>
{:else}
	<Radio.Root id="tested-radio" value="blue">Blue</Radio.Root>
{/if}
<output data-testid="parent-clicks">{parentClicks}</output>
<output data-testid="submitted">{submitted}</output>
