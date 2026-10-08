<script lang="ts">
	import { Switch } from '#lib';
	import { CheckedFixture } from '../checked-state.svelte.js';
	import type { SwitchCase } from './cases.js';

	let { scenario }: { scenario: SwitchCase } = $props();
	const box = new CheckedFixture(() => scenario);
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner checked" bind:checked={box.owner} />
	<Switch.Root id="tested-switch" bind:checked={box.owner} onCheckedChange={box.changed}>
		<Switch.Thumb />
		Notifications
	</Switch.Root>
{:else if scenario === 'form'}
	<form onsubmit={box.submitted}>
		<Switch.Root
			id="tested-switch"
			name="notifications"
			value="yes"
			uncheckedValue="no"
			onCheckedChange={box.changed}
		>
			<Switch.Thumb />
			Notifications
		</Switch.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Toggle</span>
		<Switch.Root id="tested-switch" onCheckedChange={box.changed}>
			<Switch.Thumb />
			Notifications
		</Switch.Root>
	</label>
{:else if scenario === 'native'}
	<Switch.Root
		id="tested-switch"
		nativeButton
		onCheckedChange={box.changed}
		aria-label="Notifications"
	>
		{#snippet render(props)}
			<button {...props}>Notifications</button>
		{/snippet}
	</Switch.Root>
{:else}
	<Switch.Root
		id="tested-switch"
		bind:checked={box.checked}
		disabled={scenario === 'disabled'}
		readOnly={scenario === 'readonly'}
		onCheckedChange={box.changed}
		onclick={box.prevent}
	>
		<Switch.Thumb />
		Notifications
	</Switch.Root>
{/if}
<output data-testid="calls">{JSON.stringify(box.calls)}</output>
<output data-testid="values">{JSON.stringify(box.values)}</output>
