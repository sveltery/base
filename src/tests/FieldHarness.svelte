<script lang="ts">
	import { Field, Form, Fieldset, type FieldValidate } from '#lib';

	let {
		scenario = 'label',
		validate,
		onValueChange
	}: {
		scenario?: string;
		validate?: FieldValidate;
		onValueChange?: (value: string, details: { cancel: () => void }) => void;
	} = $props();

	let submitted = $state(0);
	let values = $state('');
	let controlId = $state('control-id');
	let showFirst = $state(true);
	let controlled = $state('a');
	let late = $state<string | undefined>(undefined);
	let emptyParent = $state<string | undefined>('kept');
	let typed = $state<string | number | null | undefined>();
	let parentErrors = $state<Record<string, string>>({ email: 'stale' });
	let dirty = $state(true);
	let touched = $state(true);
	let calls = $state(0);
	let seen = $state('');
	let actions = $state<{ validate: () => void } | undefined>();
	let outerDisabled = $state(false);

	function accept(formValues: Record<string, unknown>, details: { event: Event }) {
		details.event.preventDefault();
		submitted += 1;
		values = JSON.stringify(formValues);
	}

	function countedValidate(value: unknown, formValues: Record<string, unknown>) {
		calls += 1;
		return validate?.(value, formValues) ?? null;
	}
</script>

{#if scenario === 'disabled'}
	<Field.Root disabled data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control data-testid="control" />
		<Field.Description data-testid="description">Help</Field.Description>
	</Field.Root>
{:else if scenario === 'invalid-disabled'}
	<Field.Root disabled invalid data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control data-testid="control" />
		<Field.Description data-testid="description">Help</Field.Description>
	</Field.Root>
{:else if scenario === 'form-error-disabled'}
	<Form errors={{ name: 'Server error' }}>
		<Field.Root name="name" disabled>
			<Field.Control data-testid="control" />
		</Field.Root>
	</Form>
{:else if scenario === 'label'}
	<Field.Root>
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'explicit-id'}
	<Field.Root>
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control id={controlId} data-testid="control" />
	</Field.Root>
	<button type="button" onclick={() => (controlId = 'next-id')}>Change id</button>
	<button type="button" onclick={() => (controlId = undefined as unknown as string)}
		>Clear id</button
	>
{:else if scenario === 'native-label-false'}
	<Field.Root>
		<Field.Label nativeLabel={false} data-testid="label">
			{#snippet render(props)}
				<span {...props}>Email</span>
			{/snippet}
		</Field.Label>
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'label-div'}
	<Field.Root>
		<Field.Label data-testid="label">
			{#snippet render(props)}
				<div {...props}>Email</div>
			{/snippet}
		</Field.Label>
		<Field.Control />
	</Field.Root>
{:else if scenario === 'label-forced'}
	<Field.Root>
		<Field.Label nativeLabel={false} data-testid="label">Email</Field.Label>
		<Field.Control />
	</Field.Root>
{:else if scenario === 'description'}
	<Field.Root>
		<Field.Control data-testid="control" aria-describedby="author" />
		<Field.Description data-testid="description">Help</Field.Description>
	</Field.Root>
{:else if scenario === 'required'}
	<Form onFormSubmit={accept}>
		<Field.Root>
			<Field.Control required data-testid="control" />
			<Field.Error data-testid="error">Required</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'match'}
	<Form onFormSubmit={accept}>
		<Field.Root validate={(value) => (value === 'ab' ? 'custom error' : null)}>
			<Field.Control required data-testid="control" />
			<Field.Error match="valueMissing">value missing</Field.Error>
			<Field.Error match="customError">custom error</Field.Error>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
{:else if scenario === 'form-error'}
	<Form errors={{ email: 'Email is already taken' }}>
		<Field.Root>
			<Field.Control name="email" data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
{:else if scenario === 'form-error-list'}
	<Form errors={{ email: ['One', 'Two'] }}>
		<Field.Root name="email">
			<Field.Control data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
{:else if scenario === 'form-error-single'}
	<Form errors={{ email: ['Only'] }}>
		<Field.Root name="email">
			<Field.Control />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
{:else if scenario === 'inherited'}
	<Form errors={{}}>
		<Field.Root name="constructor">
			<Field.Control data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
{:else if scenario === 'idle'}
	<Field.Root validate={countedValidate}>
		<Field.Control data-testid="control" />
		<Field.Error data-testid="error" />
	</Field.Root>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'on-change'}
	<Field.Root validationMode="onChange" validate={countedValidate}>
		<Field.Control data-testid="control" />
		<Field.Error data-testid="error" />
	</Field.Root>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'debounce'}
	<Field.Root
		validationMode="onChange"
		validationDebounceTime={60}
		validate={(value) => {
			calls += 1;
			return value === 'ok' ? null : 'bad';
		}}
	>
		<Field.Control data-testid="control" />
		<Field.Error data-testid="error" />
	</Field.Root>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'empty-validate'}
	<Form onFormSubmit={accept}>
		<Field.Root name="field" validationMode="onChange" {validate}>
			<Field.Control data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
{:else if scenario === 'async'}
	<Form onFormSubmit={accept}>
		<Field.Root name="username" validationMode="onChange" {validate}>
			<Field.Control data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="submitted">{submitted}</output>
	<output data-testid="values">{values}</output>
{:else if scenario === 'filled'}
	<Field.Root data-testid="field">
		<Field.Control defaultValue="hello" data-testid="control" />
	</Field.Root>
{:else if scenario === 'filled-controlled'}
	<Field.Root data-testid="field">
		<Field.Control value="" data-testid="control" />
	</Field.Root>
{:else if scenario === 'dirty'}
	<Field.Root data-testid="field">
		<Field.Control defaultValue="a" data-testid="control" />
	</Field.Root>
{:else if scenario === 'controlled-dirty'}
	<Field.Root dirty data-testid="field">
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'controlled-dirty-flag'}
	<Field.Root {dirty} data-testid="field">
		<Field.Control required data-testid="control" />
	</Field.Root>
	<button type="button" onclick={() => (dirty = false)}>Clean</button>
	<button type="submit" form="unused">noop</button>
{:else if scenario === 'touched'}
	<Field.Root {touched} data-testid="field">
		<Field.Control data-testid="control" />
	</Field.Root>
{:else if scenario === 'actions'}
	<Field.Root bind:actions validate={() => 'bad'} data-testid="field">
		<Field.Control data-testid="control" />
		<Field.Error data-testid="error" />
	</Field.Root>
	<button type="button" onclick={() => actions?.validate()}>Validate</button>
{:else if scenario === 'logical'}
	<Field.Root bind:actions {validate} data-testid="field">
		<Field.Error data-testid="error" />
	</Field.Root>
	<button type="button" onclick={() => actions?.validate()}>Validate</button>
{:else if scenario === 'names'}
	<Form onFormSubmit={accept}>
		<Field.Root name="username">
			<Field.Control name="email" defaultValue="ada" data-testid="control" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="values">{values}</output>
{:else if scenario === 'name-fallback'}
	<Form onFormSubmit={accept}>
		<Field.Root>
			<Field.Control name="email" defaultValue="ada" data-testid="control" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="values">{values}</output>
{:else if scenario === 'item'}
	<Field.Root data-testid="field">
		<Field.Item disabled data-testid="item">
			<Field.Label data-testid="label">Apple</Field.Label>
			<Field.Description data-testid="description">Crisp</Field.Description>
			<Field.Control data-testid="control" />
		</Field.Item>
	</Field.Root>
{:else if scenario === 'validity'}
	<Form onFormSubmit={accept}>
		<Field.Root validationMode="onBlur" {validate}>
			<Field.Control data-testid="control" />
			<Field.Validity>
				{#snippet children(validity)}
					<output data-testid="validity">
						{validity.validity.valid === null
							? 'unknown'
							: String(validity.validity.valid)}|{validity.error}|{validity.errors.join(',')}
					</output>
				{/snippet}
			</Field.Validity>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
{:else if scenario === 'render'}
	<Field.Root data-testid="field" class="from-props">
		{#snippet render(props, fieldState)}
			<div {...props} data-custom="true" data-valid={String(fieldState.valid)}>
				<Field.Control data-testid="control" />
			</div>
		{/snippet}
	</Field.Root>
{:else if scenario === 'attach'}
	<Field.Root data-testid="field" class="hosted">
		<Field.Control data-testid="control" class="control-host" />
	</Field.Root>
{:else if scenario === 'fieldset'}
	<Fieldset.Root disabled={outerDisabled}>
		<Field.Root data-testid="field">
			<Field.Control data-testid="control" />
		</Field.Root>
	</Fieldset.Root>
	<button type="button" onclick={() => (outerDisabled = !outerDisabled)}>Toggle fieldset</button>
{:else if scenario === 'enter'}
	<Field.Root validate={countedValidate}>
		<Field.Control defaultValue="a" data-testid="control" />
	</Field.Root>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'cancel'}
	<Field.Root validationMode="onChange" validate={countedValidate} data-testid="field">
		<Field.Control data-testid="control" {onValueChange} />
	</Field.Root>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'prevent'}
	<Form errors={{ message: 'Server error' }}>
		<Field.Root name="message" validationMode="onChange" validate={countedValidate}>
			<Field.Control data-testid="control" {onValueChange} />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'on-blur'}
	<Field.Root validationMode="onBlur" validate={countedValidate} data-testid="field">
		<Field.Control data-testid="control" />
		<Field.Error data-testid="error" />
	</Field.Root>
	<output data-testid="calls">{calls}</output>
{:else if scenario === 'parent'}
	<Form bind:errors={parentErrors}>
		<Field.Root name="email" validationMode="onChange" data-testid="field" validate={() => 'nope'}>
			<Field.Control value={controlled} data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
	<button type="button" onclick={() => (controlled = 'next')}>Set next</button>
	<output data-testid="errors">{JSON.stringify(parentErrors)}</output>
{:else if scenario === 'late'}
	<Form bind:errors={parentErrors} onFormSubmit={accept}>
		<Field.Root name="email" validationMode="onChange" data-testid="field" validate={() => null}>
			<Field.Control value={late} data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<button type="button" onclick={() => (late = 'later')}>Set later</button>
	<output data-testid="errors">{JSON.stringify(parentErrors)}</output>
	<output data-testid="values">{values}</output>
{:else if scenario === 'empty'}
	<Form bind:errors={parentErrors}>
		<Field.Root
			name="email"
			validationMode="onChange"
			data-testid="field"
			validate={(value) => (value === '' ? 'empty' : null)}
		>
			<Field.Control value={emptyParent} data-testid="control" />
			<Field.Error data-testid="error" />
		</Field.Root>
	</Form>
	<button type="button" onclick={() => (emptyParent = '')}>Clear</button>
	<button type="button" onclick={() => (emptyParent = undefined)}>Unset</button>
	<output data-testid="errors">{JSON.stringify(parentErrors)}</output>
{:else if scenario === 'reset'}
	<Form onFormSubmit={accept} data-testid="form">
		<Field.Root
			name="email"
			validationMode="onSubmit"
			validate={(value) => {
				calls += 1;
				seen = value == null ? '' : String(value);
				return null;
			}}
		>
			<Field.Control data-testid="control" />
		</Field.Root>
		<button type="reset">Reset</button>
		<button type="submit">Submit</button>
	</Form>
	<output data-testid="seen">{seen}</output>
	<output data-testid="values">{values}</output>
{:else if scenario === 'typed'}
	<Field.Root>
		<Field.Control bind:value={typed} data-testid="control" />
	</Field.Root>
	<output data-testid="typed">{typed ?? 'none'}</output>
{:else if scenario === 'controlled'}
	<Field.Root validationMode="onChange" validate={countedValidate} data-testid="field">
		<Field.Control bind:value={controlled} data-testid="control" {onValueChange} />
	</Field.Root>
	<output data-testid="value">{controlled}</output>
	<output data-testid="calls">{calls}</output>
	<button type="button" onclick={() => (controlled = 'program')}>Set</button>
{:else if scenario === 'swap'}
	<Field.Root>
		<Field.Label data-testid="label">Email</Field.Label>
		{#if showFirst}
			<Field.Control id="first" data-testid="control" />
		{:else}
			<Field.Control id="second" data-testid="control" />
		{/if}
	</Field.Root>
	<button type="button" onclick={() => (showFirst = false)}>Swap</button>
{:else}
	<Field.Root>
		<Field.Label>Email</Field.Label>
		<Field.Control />
	</Field.Root>
{/if}
