<script lang="ts">
	import { Switch } from '#lib';
	import type { SwitchCase } from './cases.js';

	let { scenario }: { scenario: SwitchCase } = $props();

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
	<Switch.Root id="tested-switch" bind:checked={owner} onCheckedChange={changed}>
		<Switch.Thumb />
		Notifications
	</Switch.Root>
{:else if scenario === 'form'}
	<form onsubmit={submitted}>
		<Switch.Root
			id="tested-switch"
			name="notifications"
			value="yes"
			uncheckedValue="no"
			onCheckedChange={changed}
		>
			<Switch.Thumb />
			Notifications
		</Switch.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Toggle</span>
		<Switch.Root id="tested-switch" onCheckedChange={changed}>
			<Switch.Thumb />
			Notifications
		</Switch.Root>
	</label>
{:else if scenario === 'native'}
	<Switch.Root id="tested-switch" nativeButton onCheckedChange={changed} aria-label="Notifications">
		{#snippet render(props)}
			<button {...props}>Notifications</button>
		{/snippet}
	</Switch.Root>
{:else}
	<Switch.Root
		id="tested-switch"
		bind:checked
		disabled={scenario === 'disabled'}
		readOnly={scenario === 'readonly'}
		onCheckedChange={changed}
		onclick={prevent}
	>
		<Switch.Thumb />
		Notifications
	</Switch.Root>
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
<output data-testid="values">{JSON.stringify(values)}</output>
