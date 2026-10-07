<script lang="ts">
	import { Field, Form, NumberField } from '#lib';

	let {
		scenario = 'plain',
		onValueChange,
		onValueCommitted
	}: {
		scenario?: string;
		onValueChange?: (value: number | null, details: { cancel: () => void; reason: string }) => void;
		onValueCommitted?: (value: number | null, details: { reason: string }) => void;
	} = $props();

	let bound = $state<number | null>(4);
	let parentErrors = $state<Record<string, string>>({ qty: 'stale' });
	let submitted = $state(0);
	let values = $state('');

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		details.event.preventDefault();
		submitted += 1;
		values = JSON.stringify(formValues);
	}
</script>

{#if scenario === 'plain'}
	<NumberField.Root locale="en-US" defaultValue={4} {onValueChange} {onValueCommitted}>
		<NumberField.Group data-testid="group">
			<NumberField.Decrement />
			<NumberField.Input data-testid="control" />
			<NumberField.Increment />
		</NumberField.Group>
	</NumberField.Root>
{:else if scenario === 'empty'}
	<NumberField.Root locale="en-US" {onValueChange}>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
	</NumberField.Root>
{:else if scenario === 'bound'}
	<NumberField.Root locale="en-US" bind:value={bound}>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
	</NumberField.Root>
	<output data-testid="value">{bound}</output>
{:else if scenario === 'disabled'}
	<NumberField.Root locale="en-US" defaultValue={4} disabled data-testid="root">
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
		<NumberField.Decrement />
	</NumberField.Root>
{:else if scenario === 'increment-disabled'}
	<NumberField.Root locale="en-US" defaultValue={0} {onValueChange}>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment disabled />
	</NumberField.Root>
{:else if scenario === 'readonly'}
	<NumberField.Root locale="en-US" defaultValue={4} readOnly>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
		<NumberField.Decrement />
	</NumberField.Root>
{:else if scenario === 'required'}
	<NumberField.Root locale="en-US" required name="qty">
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if scenario === 'named'}
	<NumberField.Root locale="en-US" name="qty" defaultValue={54.5}>
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if scenario === 'bounds'}
	<NumberField.Root locale="en-US" defaultValue={5} min={0} max={5}>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment />
		<NumberField.Decrement />
	</NumberField.Root>
{:else if scenario === 'format'}
	<NumberField.Root
		locale="de-DE"
		defaultValue={54.5}
		format={{ style: 'currency', currency: 'EUR' }}
		name="price"
	>
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if scenario === 'wheel'}
	<NumberField.Root
		locale="en-US"
		defaultValue={10}
		allowWheelScrub
		{onValueChange}
		{onValueCommitted}
	>
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if scenario === 'paste'}
	<NumberField.Root locale="en-US" defaultValue={10} {onValueChange}>
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if scenario === 'out-of-range'}
	<NumberField.Root locale="en-US" defaultValue={1} max={5} allowOutOfRange {onValueChange}>
		<NumberField.Input data-testid="control" />
		<NumberField.Decrement />
		<NumberField.Increment />
	</NumberField.Root>
{:else if scenario === 'field'}
	<Field.Root data-testid="field">
		<Field.Label data-testid="label">Amount</Field.Label>
		<NumberField.Root locale="en-US" defaultValue={4}>
			<NumberField.Input data-testid="control" />
		</NumberField.Root>
	</Field.Root>
{:else if scenario === 'form-required'}
	<Form onFormSubmit={accept}>
		<Field.Root name="qty">
			<NumberField.Root required>
				<NumberField.Input data-testid="control" />
			</NumberField.Root>
			<Field.Error match="valueMissing" data-testid="error">Required</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'form-values'}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			const form = event.target instanceof HTMLFormElement ? event.target : event.currentTarget;
			if (!(form instanceof HTMLFormElement)) return;
			values = String(new FormData(form).get('qty') ?? '');
			submitted += 1;
		}}
	>
		<NumberField.Root locale="en-US" name="qty" defaultValue={54.5}>
			<NumberField.Input data-testid="control" />
		</NumberField.Root>
		<button type="submit">Submit</button>
	</form>
	<output data-testid="values">{values}</output>
{:else if scenario === 'scrub'}
	<NumberField.Root
		locale="en-US"
		defaultValue={0}
		data-testid="root"
		{onValueChange}
		{onValueCommitted}
	>
		<NumberField.Input data-testid="control" />
		<NumberField.ScrubArea data-testid="scrub">
			<NumberField.ScrubAreaCursor data-testid="cursor">+</NumberField.ScrubAreaCursor>
		</NumberField.ScrubArea>
	</NumberField.Root>
{:else if scenario === 'scrub-touch'}
	<NumberField.Root locale="en-US" defaultValue={0}>
		<NumberField.Input data-testid="control" />
		<NumberField.ScrubArea data-testid="scrub" />
	</NumberField.Root>
{:else if scenario === 'render'}
	<NumberField.Root locale="en-US" defaultValue={1} data-testid="root">
		{#snippet render(props, fieldState, snippetChildren)}
			<div {...props} data-rendered="true" data-value={String(fieldState.value)}>
				{@render snippetChildren()}
			</div>
		{/snippet}
		<NumberField.Input data-testid="control" />
	</NumberField.Root>
{:else if scenario === 'prevent'}
	<NumberField.Root locale="en-US" defaultValue={1}>
		<NumberField.Input data-testid="control" />
		<NumberField.Increment
			onpointerdown={(event) => {
				event.preventDefault();
			}}
		/>
	</NumberField.Root>
{:else if scenario === 'parent'}
	<Form bind:errors={parentErrors}>
		<Field.Root name="qty" validationMode="onChange" data-testid="field" validate={() => 'nope'}>
			<NumberField.Root value={bound}>
				<NumberField.Input data-testid="control" />
			</NumberField.Root>
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
	<button type="button" onclick={() => (bound = 9)}>Set nine</button>
	<output data-testid="errors">{JSON.stringify(parentErrors)}</output>
{:else if scenario === 'orphan'}
	<NumberField.Increment />
{:else if scenario === 'orphan-cursor'}
	<NumberField.Root>
		<NumberField.ScrubAreaCursor />
	</NumberField.Root>
{/if}
