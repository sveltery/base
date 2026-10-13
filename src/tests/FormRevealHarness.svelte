<script lang="ts">
	import { tick } from 'svelte';
	import { Field, Form, type FormFocusInvalidDetail } from '#lib';
	import type { FakeSource } from './fake-form-source.svelte.js';

	let {
		source,
		reveal = true,
		revealAfter,
		focusInCallback = false
	}: {
		source?: FakeSource;
		reveal?: boolean;
		revealAfter?: Promise<void>;
		focusInCallback?: boolean;
	} = $props();

	let step = $state(1);
	let calls = $state<string[]>([]);

	async function revealStep({ control, field }: FormFocusInvalidDetail) {
		calls = [...calls, `${field.name}@${step}`];
		await revealAfter;
		step = Number(control.closest('[data-step]')?.getAttribute('data-step'));
		if (!focusInCallback) return;
		await tick();
		const input = control as HTMLInputElement;
		input.focus();
		input.setSelectionRange(1, 1);
	}
</script>

<Form form={source} onFocusInvalid={reveal ? revealStep : undefined}>
	<section data-step="1" hidden={step !== 1}>
		<Field.Root field={source?.fields.name} name={source ? undefined : 'name'}>
			<Field.Label>Name</Field.Label>
			<Field.Control data-testid="name" />
		</Field.Root>
		<button type="button" onclick={() => (step = 2)}>Next</button>
	</section>
	<section data-step="2" hidden={step !== 2}>
		<Field.Root field={source?.fields.email} name={source ? undefined : 'email'}>
			<Field.Label>Email</Field.Label>
			<Field.Control data-testid="email" required />
		</Field.Root>
	</section>
	<button>Submit</button>
</Form>
<output data-testid="step">{step}</output>
<output data-testid="calls">{calls.join(',')}</output>
