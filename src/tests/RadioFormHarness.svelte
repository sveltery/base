<script lang="ts">
	import { Radio } from '#lib';

	let {
		scenario = 'enter'
	}: {
		scenario?: 'enter' | 'required' | 'required-checked';
	} = $props();

	let submitted = $state(0);

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
	}
</script>

<form {onsubmit}>
	{#if scenario === 'required-checked'}
		<Radio.Root value="" required>Checked</Radio.Root>
	{:else if scenario === 'required'}
		<Radio.Root value="blue" required>Blue</Radio.Root>
	{:else}
		<Radio.Root value="blue">Blue</Radio.Root>
	{/if}
	<button type="submit">Submit</button>
</form>
<output data-testid="submitted">{submitted}</output>
