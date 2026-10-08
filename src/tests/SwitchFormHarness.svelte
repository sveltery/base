<script lang="ts">
	import { Switch } from '#lib';
	import { readNamedForm } from '../routes/fixtures/form-log.js';

	let {
		scenario = 'plain'
	}: {
		scenario?: 'plain' | 'external' | 'unchecked-external' | 'disabled' | 'cycle' | 'required';
	} = $props();

	let values = $state<(string | null)[]>([]);
	let submitted = $state(0);

	function onsubmit(event: SubmitEvent) {
		({ submitted, values } = readNamedForm(event, 'test-switch', submitted, values));
	}
</script>

{#if scenario === 'external'}
	<form id="external-form" {onsubmit}>
		<button type="submit">Submit</button>
	</form>
	<Switch.Root name="test-switch" form="external-form" />
{:else if scenario === 'unchecked-external'}
	<form id="external-form" {onsubmit}>
		<button type="submit">Submit</button>
	</form>
	<Switch.Root name="test-switch" form="external-form" uncheckedValue="off" />
{:else if scenario === 'disabled'}
	<form {onsubmit}>
		<Switch.Root name="test-switch" uncheckedValue="off" disabled />
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'cycle'}
	<form {onsubmit}>
		<Switch.Root name="test-switch" value="yes" uncheckedValue="no" />
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'required'}
	<form {onsubmit}>
		<Switch.Root name="test-switch" required />
		<button type="submit">Submit</button>
	</form>
{:else}
	<form {onsubmit}>
		<Switch.Root name="test-switch" />
		<button type="submit">Submit</button>
	</form>
{/if}
<output data-testid="values">{JSON.stringify(values)}</output>
<output data-testid="submitted">{submitted}</output>
