<script lang="ts">
	import { Field, Form, Input } from '#lib';
	import FormSubmit from '../routes/fixtures/FormSubmit.svelte';
	import { takeForm } from '../routes/fixtures/form-log.js';

	let {
		scenario = 'plain',
		onValueChange
	}: {
		scenario?: string;
		onValueChange?: (value: string, details: { cancel: () => void; reason: string }) => void;
	} = $props();

	let bound = $state('a');
	let host = $state<HTMLElement | null>(null);
	let submitted = $state(0);
	let values = $state('');

	function capture(node: HTMLElement) {
		host = node;
		return () => {
			host = null;
		};
	}

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		({ submitted, values } = takeForm(formValues, details, submitted));
	}
</script>

{#if scenario === 'plain'}
	<Field.Root>
		<Input />
	</Field.Root>
{:else if scenario === 'props'}
	<Field.Root>
		<Input
			lang="fr"
			data-foobar="token"
			style="color: green"
			class="name-input"
			data-testid="control"
		/>
	</Field.Root>
{:else if scenario === 'render'}
	<Field.Root disabled>
		<Input data-testid="control" class="from-props">
			{#snippet render(props, state)}
				<input {...props} data-custom="true" data-state-disabled={String(state.disabled)} />
			{/snippet}
		</Input>
	</Field.Root>
{:else if scenario === 'textarea'}
	<Field.Root>
		<Input>
			{#snippet render(props)}
				<textarea {...props} data-testid="control"></textarea>
			{/snippet}
		</Input>
	</Field.Root>
{:else if scenario === 'attach'}
	<Field.Root>
		<Input class="default-host" {@attach capture} />
	</Field.Root>
	<output data-testid="host">{host ? `${host.tagName}:${host.className}` : 'none'}</output>
{:else if scenario === 'labelled'}
	<Field.Root data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Input data-testid="control" />
	</Field.Root>
{:else if scenario === 'disabled'}
	<Field.Root disabled data-testid="field">
		<Input data-testid="control" />
	</Field.Root>
{:else if scenario === 'invalid'}
	<Field.Root invalid data-testid="field">
		<Input data-testid="control" />
	</Field.Root>
{:else if scenario === 'filled'}
	<Field.Root data-testid="field">
		<Input defaultValue="hello" data-testid="control" />
	</Field.Root>
{:else if scenario === 'empty'}
	<Field.Root data-testid="field">
		<Input value="" data-testid="control" />
	</Field.Root>
{:else if scenario === 'dirty'}
	<Field.Root data-testid="field">
		<Input defaultValue="a" data-testid="control" />
	</Field.Root>
{:else if scenario === 'standalone'}
	<Input bind:value={bound} data-testid="control" />
	<output data-testid="value">{bound}</output>
{:else if scenario === 'form-required'}
	<Form
		onFormSubmit={(formValues) => {
			values = JSON.stringify(formValues);
		}}
	>
		<Input required name="q" data-testid="control" />
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="values">{values}</output>
{:else if scenario === 'form-named'}
	<Form
		onFormSubmit={(formValues) => {
			values = JSON.stringify(formValues);
		}}
	>
		<Input name="q" defaultValue="z" data-testid="control" />
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="values">{values}</output>
{:else if scenario === 'pair'}
	<Input data-testid="one" />
	<Input data-testid="two" />
{:else if scenario === 'inert-state'}
	<Input data-testid="control" />
{:else if scenario === 'bound'}
	<Field.Root data-testid="field">
		<Input bind:value={bound} data-testid="control" {onValueChange} />
	</Field.Root>
	<output data-testid="value">{bound}</output>
	<button type="button" onclick={() => (bound = 'program')}>Set</button>
{:else}
	<FormSubmit {accept} {submitted} {values}>
		<Field.Root name="username">
			<Input defaultValue="ada" data-testid="control" />
		</Field.Root>
	</FormSubmit>
{/if}
