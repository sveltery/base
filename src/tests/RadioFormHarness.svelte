<script lang="ts">
	import { Radio } from '#lib';

	let {
		scenario = 'enter'
	}: {
		scenario?: 'enter' | 'required' | 'required-checked';
	} = $props();

	let submitted = $state(0);
	const box = 'display: inline-block; width: 16px; height: 16px';

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
	}
</script>

<form {onsubmit}>
	{#if scenario === 'required-checked'}
		<Radio.Root value="" required defaultChecked aria-label="Checked" style={box} />
	{:else if scenario === 'required'}
		<Radio.Root value="blue" required aria-label="Blue" style={box} />
	{:else}
		<Radio.Root value="blue" aria-label="Blue" style={box} />
	{/if}
	<button type="submit">Submit</button>
</form>
<output data-testid="submitted">{submitted}</output>
