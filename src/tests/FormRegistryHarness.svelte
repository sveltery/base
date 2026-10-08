<script lang="ts">
	import { Form, type FormActions, type FormErrors, type FormSubmitEventDetails } from '#lib';
	import FormErrorControls from './FormErrorControls.svelte';
	import FormField from './FormField.svelte';

	let { scenario }: { scenario: string } = $props();

	let actions = $state<FormActions | undefined>(undefined);
	let errors = $state<FormErrors | undefined>(undefined);
	let names = $state(['a', 'b']);
	let valid = $state<boolean | null>(true);
	let calls = $state<string[]>([]);
	let values = $state('');
	let prevented = $state<boolean | null>(null);
	let reason = $state('');
	let hostA = $state<HTMLDivElement | null>(null);
	let hostB = $state<HTMLDivElement | null>(null);
	let slotA = $state<HTMLDivElement | null>(null);
	let slotB = $state<HTMLDivElement | null>(null);

	function note(label: string) {
		calls = [...calls, label];
	}

	function submitted(formValues: Record<string, unknown>, details: FormSubmitEventDetails) {
		values = JSON.stringify(formValues);
		prevented = details.event.defaultPrevented;
		reason = details.reason;
	}

	function nativeSubmit(event: SubmitEvent) {
		note('native');
		event.preventDefault();
	}

	$effect(() => {
		if (scenario !== 'shadow' || !hostA || !hostB || !slotA || !slotB) return;
		const shadowA = hostA.shadowRoot ?? hostA.attachShadow({ mode: 'open' });
		const shadowB = hostB.shadowRoot ?? hostB.attachShadow({ mode: 'open' });
		shadowA.append(slotA);
		shadowB.append(slotB);
	});
</script>

{#if scenario === 'shadow'}
	<div bind:this={hostA}></div>
	<div bind:this={hostB}></div>
{/if}

<Form
	bind:actions
	bind:errors
	novalidate={scenario !== 'browser'}
	onsubmit={scenario === 'native' || scenario === 'unregistered' || scenario === 'browser'
		? nativeSubmit
		: undefined}
	onFormSubmit={scenario === 'native' ? undefined : submitted}
>
	{#if scenario === 'blocked' || scenario === 'textarea'}
		<FormField
			id="custom"
			name="custom"
			valid={false}
			tag={scenario === 'textarea' ? 'textarea' : 'input'}
			onValidate={() => note('custom')}
		/>
		<FormField id="native" name="native" valid={false} onValidate={() => note('native-field')} />
	{:else if scenario === 'document-order'}
		<button type="button" onclick={() => (names = ['b', 'a'])}>Reorder</button>
		{#each names as name (name)}
			<FormField id={name} {name} valid={false} />
		{/each}
	{:else if scenario === 'shadow'}
		<div bind:this={slotA}>
			<FormField id="a" name="a" valid={false} />
		</div>
		<div bind:this={slotB}>
			<FormField id="b" name="b" valid={false} />
		</div>
	{:else if scenario === 'values'}
		<FormField id="username" name="username" value="alice132" onValidate={() => note('username')} />
		<FormField id="quantity" name="quantity" value={5} onValidate={() => note('quantity')} />
	{:else if scenario === 'unnamed'}
		<FormField id="blank" valid={false} />
	{:else if scenario === 'no-control'}
		<FormField id="missing" name="missing" valid={false} tag="none" />
	{:else if scenario === 'pending'}
		<FormField id="pending" name="pending" valid={null} value="later" />
	{:else if scenario === 'actions'}
		<FormField id="username" name="username" onValidate={() => note('username')} />
		<FormField id="quantity" name="quantity" onValidate={() => note('quantity')} />
	{:else if scenario === 'same-name'}
		<FormField id="first" name="email" onValidate={() => note('first')} />
		<FormField id="second" name="email" onValidate={() => note('second')} />
	{:else if scenario === 'submit-count'}
		<FormField id="counted" name="counted" onValidate={(count) => note(String(count))} />
	{:else if scenario === 'errors-focus'}
		<FormField id="a" name="a" {valid} value="kept" />
	{:else if scenario === 'errors-name'}
		<FormField id="control-id" name="username" {valid} value="kept" />
	{:else if scenario === 'clear'}
		<FormField id="a" name="a" />
		<FormErrorControls />
	{:else if scenario === 'unregistered' || scenario === 'browser'}
		<input required data-testid="raw" name="raw" />
	{/if}
	<button type="submit">Submit</button>
</Form>

{#if scenario === 'actions' || scenario === 'same-name'}
	<button type="button" onclick={() => actions?.validate()}>Validate all</button>
	<button type="button" onclick={() => actions?.validate('quantity')}>Validate quantity</button>
	<button type="button" onclick={() => actions?.validate('email')}>Validate email</button>
	<button type="button" onclick={() => actions?.validate('missing')}>Validate missing</button>
{/if}

{#if scenario === 'errors-focus'}
	<button
		type="button"
		onclick={() => {
			valid = false;
			errors = { a: 'nope' };
		}}>Apply errors</button
	>
{/if}

{#if scenario === 'errors-name'}
	<button type="button" onclick={() => (errors = { username: 'nope' })}>Apply named error</button>
{/if}

{#if scenario === 'clear'}
	<button type="button" onclick={() => (errors = { a: 'bad', b: 'also' })}>Set errors</button>
{/if}

<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="values">{values}</output>
<output data-testid="prevented">{prevented === null ? '' : String(prevented)}</output>
<output data-testid="reason">{reason}</output>
<output data-testid="errors">{JSON.stringify(errors ?? null)}</output>
