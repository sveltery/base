<script lang="ts">
	import { Checkbox } from '#lib';
	import type { CheckboxCase } from './cases.js';

	let { scenario }: { scenario: CheckboxCase } = $props();

	let owner = $state(false);
	let checked = $state(false);
	let calls = $state<{ checked: boolean; reason: string; canceled: boolean }[]>([]);
	let values = $state<(string | null)[]>([]);

	function changed(
		next: boolean,
		details: { reason: string; isCanceled: boolean; cancel: () => void }
	) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ checked: next, reason: details.reason, canceled: details.isCanceled });
	}

	function prevent(event: MouseEvent) {
		if (scenario === 'prevented') event.preventDefault();
	}

	function submitted(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const value = new FormData(form).get('notifications');
		values.push(typeof value === 'string' ? value : null);
	}
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner checked" bind:checked={owner} />
	<Checkbox.Root id="tested-checkbox" bind:checked={owner} onCheckedChange={changed}>
		<Checkbox.Indicator />
		Notifications
	</Checkbox.Root>
{:else if scenario === 'form' || scenario === 'enter'}
	<form onsubmit={submitted}>
		<Checkbox.Root
			id="tested-checkbox"
			name="notifications"
			value="yes"
			uncheckedValue="no"
			onCheckedChange={changed}
		>
			<Checkbox.Indicator />
			Notifications
		</Checkbox.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Toggle</span>
		<Checkbox.Root id="tested-checkbox" onCheckedChange={changed}>
			<Checkbox.Indicator />
			Notifications
		</Checkbox.Root>
	</label>
{:else if scenario === 'native'}
	<Checkbox.Root
		id="tested-checkbox"
		nativeButton
		onCheckedChange={changed}
		aria-label="Notifications"
	>
		{#snippet render(props)}
			<button {...props}>Notifications</button>
		{/snippet}
	</Checkbox.Root>
{:else if scenario === 'indeterminate'}
	<Checkbox.Root id="tested-checkbox" indeterminate onCheckedChange={changed}>
		<Checkbox.Indicator data-testid="indicator" />
		Notifications
	</Checkbox.Root>
{:else}
	<Checkbox.Root
		id="tested-checkbox"
		bind:checked
		disabled={scenario === 'disabled'}
		readOnly={scenario === 'readonly'}
		onCheckedChange={changed}
		onclick={prevent}
	>
		<Checkbox.Indicator />
		Notifications
	</Checkbox.Root>
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="values">{JSON.stringify(values)}</output>
