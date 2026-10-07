<script lang="ts">
	import { Form } from '#lib';
	import type { FormCase } from './cases.js';

	let { scenario }: { scenario: FormCase } = $props();

	let submitted = $state(0);
	let values = $state('');

	function countSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted += 1;
	}
</script>

{#if scenario === 'render'}
	<Form id="tested-form" onsubmit={countSubmit}>
		{#snippet render(props, _state, children)}
			<form {...props} data-custom="true">{@render children()}</form>
		{/snippet}
		<span>Inside</span>
		<button type="submit">Submit</button>
	</Form>
{:else if scenario === 'values'}
	<Form
		id="tested-form"
		onFormSubmit={(formValues) => {
			values = JSON.stringify(formValues);
		}}
	>
		<button type="submit">Submit</button>
	</Form>
{:else}
	<Form id="tested-form" novalidate={scenario !== 'browser'} onsubmit={countSubmit}>
		{#if scenario === 'unregistered' || scenario === 'browser'}
			<input name="email" required aria-label="Email" />
		{/if}
		<button type="submit">Submit</button>
	</Form>
{/if}
<output data-testid="submitted">{submitted}</output>
<output data-testid="values">{values}</output>
