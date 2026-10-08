<script lang="ts">
	import { Checkbox } from '#lib';
	import { CheckedFixture } from '../checked-state.svelte.js';
	import type { CheckboxCase } from './cases.js';

	let { scenario }: { scenario: CheckboxCase } = $props();
	const box = new CheckedFixture(() => scenario);
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner checked" bind:checked={box.owner} />
	<Checkbox.Root id="tested-checkbox" bind:checked={box.owner} onCheckedChange={box.changed}>
		<Checkbox.Indicator />
		Notifications
	</Checkbox.Root>
{:else if scenario === 'form' || scenario === 'enter'}
	<form onsubmit={box.submitted}>
		<Checkbox.Root
			id="tested-checkbox"
			name="notifications"
			value="yes"
			uncheckedValue="no"
			onCheckedChange={box.changed}
		>
			<Checkbox.Indicator />
			Notifications
		</Checkbox.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Toggle</span>
		<Checkbox.Root id="tested-checkbox" onCheckedChange={box.changed}>
			<Checkbox.Indicator />
			Notifications
		</Checkbox.Root>
	</label>
{:else if scenario === 'native'}
	<Checkbox.Root
		id="tested-checkbox"
		nativeButton
		onCheckedChange={box.changed}
		aria-label="Notifications"
	>
		{#snippet render(props)}
			<button {...props}>Notifications</button>
		{/snippet}
	</Checkbox.Root>
{:else if scenario === 'indeterminate'}
	<Checkbox.Root id="tested-checkbox" indeterminate onCheckedChange={box.changed}>
		<Checkbox.Indicator data-testid="indicator" />
		Notifications
	</Checkbox.Root>
{:else}
	<Checkbox.Root
		id="tested-checkbox"
		bind:checked={box.checked}
		disabled={scenario === 'disabled'}
		readOnly={scenario === 'readonly'}
		onCheckedChange={box.changed}
		onclick={box.prevent}
	>
		<Checkbox.Indicator />
		Notifications
	</Checkbox.Root>
{/if}
<output data-testid="calls">{JSON.stringify(box.calls)}</output>
<output data-testid="values">{JSON.stringify(box.values)}</output>
