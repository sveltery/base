<script lang="ts">
	import { Field, Form, type FormErrors, type FormValidationMode } from '#lib';
	import type { EnhanceInstance } from '../lib/form/source.js';
	import type { FakeSource } from './fake-form-source.svelte.js';

	let {
		source,
		mode,
		required = false,
		byName,
		bio = false,
		errors,
		errorRole,
		cancelReset = false,
		enhance,
		onFormSubmit
	}: {
		source?: FakeSource;
		mode?: FormValidationMode;
		required?: boolean;
		byName?: string;
		bio?: boolean;
		errors?: FormErrors;
		errorRole?: string;
		cancelReset?: boolean;
		enhance?: (instance: EnhanceInstance) => unknown;
		onFormSubmit?: () => void;
	} = $props();

	let resets = $state(0);

	function onreset(event: Event) {
		resets += 1;
		if (cancelReset) event.preventDefault();
	}
</script>

<Form
	form={source}
	validationMode={mode}
	{errors}
	{enhance}
	{onFormSubmit}
	{onreset}
	data-testid="form"
>
	<Field.Root field={source?.fields.name} name={source ? undefined : 'name'}>
		<Field.Label>Name</Field.Label>
		<Field.Control data-testid="name" {required} />
		<Field.Error data-testid="name-error" />
	</Field.Root>
	<Field.Root field={source?.fields.age} type="number">
		<Field.Label>Age</Field.Label>
		<Field.Control data-testid="age" />
		<Field.Error data-testid="age-error" />
	</Field.Root>
	{#if byName}
		<Field.Root name={byName}>
			<Field.Label>Nickname</Field.Label>
			<Field.Control data-testid="named" />
			<Field.Error data-testid="named-error" />
		</Field.Root>
	{/if}
	{#if bio}
		<Field.Root field={source?.fields.bio}>
			<Field.Label>Bio</Field.Label>
			<Field.Control data-testid="bio">
				{#snippet render(props)}
					<textarea {...props}></textarea>
				{/snippet}
			</Field.Control>
			<Field.Error data-testid="bio-error" />
		</Field.Root>
	{/if}
	<Form.Error data-testid="form-error" role={errorRole} />
	<button>Submit</button>
	<button type="reset">Reset</button>
</Form>
<output data-testid="resets">{resets}</output>
