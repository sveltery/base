<script lang="ts">
	import { flushSync } from 'svelte';
	import { Field, Form, OTPField } from '#lib';
	import type { FieldRootActions } from '../lib/field/types.js';
	import FieldRegisterProbe from './FieldRegisterProbe.svelte';

	let {
		scenario
	}: {
		scenario:
			| 'otp-digits'
			| 'otp-submit'
			| 'disabled'
			| 'blur-flush'
			| 'blur-trim'
			| 'enter-flush'
			| 'enter-idle';
	} = $props();

	let count = $state(0);
	let code = $state('');
	let disabled = $state(false);
	let text = $state('  hi');
	let fresh = $state('old');
	let calls = $state<string[]>([]);
	let submitted = $state('');
	let actions = $state<FieldRootActions>();

	function record(next: unknown) {
		calls = [...calls, String(next)];
		return null;
	}
</script>

{#if scenario === 'otp-digits'}
	<Field.Root name="code" validate={record} bind:actions>
		<FieldRegisterProbe bind:count />
		<OTPField.Root bind:value={code} length={6}>
			{#each [0, 1, 2, 3, 4, 5] as index (index)}
				<OTPField.Input />
			{/each}
		</OTPField.Root>
	</Field.Root>
	<p data-testid="count">{count}</p>
	<p data-testid="calls">{JSON.stringify(calls)}</p>
	<button type="button" onclick={() => actions?.validate()}>Read</button>
{:else if scenario === 'otp-submit'}
	<Form
		onFormSubmit={(values) => {
			submitted = JSON.stringify(values);
		}}
	>
		<Field.Root name="code" validate={record}>
			<OTPField.Root bind:value={code} length={3}>
				<OTPField.Input />
				<OTPField.Input />
				<OTPField.Input />
			</OTPField.Root>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<p data-testid="calls">{JSON.stringify(calls)}</p>
	<p data-testid="values">{submitted}</p>
{:else if scenario === 'disabled'}
	<Field.Root name="email">
		<FieldRegisterProbe bind:count />
		<Field.Control {disabled} data-testid="control" />
	</Field.Root>
	<p data-testid="count">{count}</p>
	<button type="button" onclick={() => (disabled = true)}>Disable</button>
	<button type="button" onclick={() => (disabled = false)}>Enable</button>
{:else if scenario === 'blur-flush'}
	<Field.Root validationMode="onBlur" validate={record}>
		<Field.Control
			bind:value={text}
			data-testid="control"
			onblur={() => {
				flushSync(() => {
					text = text.trim();
				});
				queueMicrotask(() => {
					flushSync(() => {
						text = 'side';
					});
				});
			}}
		/>
	</Field.Root>
	<p data-testid="calls">{JSON.stringify(calls)}</p>
{:else if scenario === 'blur-trim'}
	<Field.Root
		validationMode="onBlur"
		validate={(value) => {
			calls = [...calls, String(value)];
			return String(value).length < 3 ? 'short' : null;
		}}
	>
		<Field.Control
			bind:value={text}
			data-testid="control"
			onblur={() => {
				text = text.trim();
			}}
		/>
	</Field.Root>
	<p data-testid="calls">{JSON.stringify(calls)}</p>
{:else if scenario === 'enter-flush'}
	<Form
		onFormSubmit={(values) => {
			submitted = JSON.stringify(values);
		}}
	>
		<Field.Root name="email" validate={record}>
			<Field.Control
				bind:value={fresh}
				data-testid="control"
				onkeydown={(event) => {
					if (event.key !== 'Enter') return;
					flushSync(() => {
						fresh = 'fresh';
					});
				}}
			/>
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
	<p data-testid="calls">{JSON.stringify(calls)}</p>
	<p data-testid="values">{submitted}</p>
{:else if scenario === 'enter-idle'}
	<Form>
		<Field.Root name="a" validate={record}>
			<Field.Control defaultValue="x" data-testid="control" />
		</Field.Root>
		<Field.Root name="b">
			<Field.Control />
		</Field.Root>
	</Form>
	<p data-testid="calls">{JSON.stringify(calls)}</p>
{/if}
