<script lang="ts">
	import { Checkbox } from '#lib';

	let {
		scenario = 'plain'
	}: {
		scenario?:
			'plain' | 'external' | 'unchecked-external' | 'disabled' | 'cycle' | 'required' | 'mixed-off';
	} = $props();

	let values = $state<(string | null)[]>([]);
	let submitted = $state(0);

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const value = new FormData(form).get('test-checkbox');
		values = [...values, typeof value === 'string' ? value : null];
	}
</script>

{#if scenario === 'external'}
	<form id="external-form" {onsubmit}>
		<button type="submit">Submit</button>
	</form>
	<Checkbox.Root name="test-checkbox" form="external-form" />
{:else if scenario === 'unchecked-external'}
	<form id="external-form" {onsubmit}>
		<button type="submit">Submit</button>
	</form>
	<Checkbox.Root name="test-checkbox" form="external-form" uncheckedValue="off" />
{:else if scenario === 'disabled'}
	<form {onsubmit}>
		<Checkbox.Root name="test-checkbox" uncheckedValue="off" disabled />
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'cycle'}
	<form {onsubmit}>
		<Checkbox.Root name="test-checkbox" value="yes" uncheckedValue="no" />
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'required'}
	<form {onsubmit}>
		<Checkbox.Root name="test-checkbox" required />
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'mixed-off'}
	<form {onsubmit}>
		<Checkbox.Root name="test-checkbox" indeterminate uncheckedValue="off" />
		<button type="submit">Submit</button>
	</form>
{:else}
	<form {onsubmit}>
		<Checkbox.Root name="test-checkbox" />
		<button type="submit">Submit</button>
	</form>
{/if}
<output data-testid="values">{JSON.stringify(values)}</output>
<output data-testid="submitted">{submitted}</output>
