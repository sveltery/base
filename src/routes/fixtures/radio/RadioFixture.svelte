<script lang="ts">
	import { Radio } from '#lib';
	import type { RadioCase } from './cases.js';

	let { scenario }: { scenario: RadioCase } = $props();

	let parentClicks = $state(0);
	let submitted = $state(0);
	// The box has no content of its own, so the fixture gives it a size to click.
	const size = 'display: inline-block; width: 16px; height: 16px';

	function stop(event: MouseEvent) {
		if (scenario === 'stop') event.stopPropagation();
	}

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
	}
</script>

{#if scenario === 'checked'}
	<!-- Sveltery: a radio without a group follows its own checked state, not an empty value. -->
	<Radio.Root id="tested-radio" value="" defaultChecked aria-label="Checked" style={size}>
		<Radio.Indicator data-testid="indicator" />
	</Radio.Root>
{:else if scenario === 'disabled' || scenario === 'readonly'}
	<Radio.Root
		id="tested-radio"
		value="blue"
		disabled={scenario === 'disabled'}
		readonly={scenario === 'readonly'}
		aria-label="Blue"
		style={size}
	/>
{:else if scenario === 'label'}
	<label for="tested-radio">Label</label>
	<Radio.Root id="tested-radio" value="blue" style={size} />
{:else if scenario === 'required' || scenario === 'enter'}
	<form {onsubmit}>
		<Radio.Root
			id="tested-radio"
			value="blue"
			required={scenario === 'required'}
			aria-label="Blue"
			style={size}
		/>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'null'}
	<Radio.Root id="tested-radio" value={null} aria-label="None" style={size} />
{:else if scenario === 'bubble' || scenario === 'stop'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div data-testid="parent" onclick={() => (parentClicks += 1)}>
		<Radio.Root id="tested-radio" value="blue" onclick={stop} aria-label="Blue" style={size} />
	</div>
{:else}
	<!-- Sveltery renders a real input, so the `native` case has no native button host. -->
	<Radio.Root id="tested-radio" value="blue" aria-label="Blue" style={size} />
{/if}
<output data-testid="parent-clicks">{parentClicks}</output>
<output data-testid="submitted">{submitted}</output>
