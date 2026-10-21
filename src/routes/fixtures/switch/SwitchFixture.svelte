<script lang="ts">
	import { Switch } from '#lib';
	import { CheckedFixture } from '../checked-state.svelte.js';
	import type { SwitchCase } from './cases.js';

	let { scenario }: { scenario: SwitchCase } = $props();
	const box = new CheckedFixture(() => scenario);
	// The box has no content of its own, so the fixture gives it a size to click.
	const size = 'display: inline-block; width: 16px; height: 16px';
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner checked" bind:checked={box.owner} />
	<Switch.Root
		style={size}
		id="tested-switch"
		bind:checked={box.owner}
		onchange={box.inputChanged}
		aria-label="Notifications"
	>
		<Switch.Thumb />
	</Switch.Root>
{:else if scenario === 'form'}
	<form onsubmit={box.submitted}>
		<Switch.Root
			style={size}
			id="tested-switch"
			name="notifications"
			value="yes"
			uncheckedValue="no"
			onchange={box.inputChanged}
			aria-label="Notifications"
		>
			<Switch.Thumb />
		</Switch.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Toggle</span>
		<Switch.Root
			style={size}
			id="tested-switch"
			onchange={box.inputChanged}
			aria-label="Notifications"
		>
			<Switch.Thumb />
		</Switch.Root>
	</label>
{:else if scenario === 'native'}
	<!-- Sveltery renders a real input, so there is no native button host. -->
	<Switch.Root
		style={size}
		id="tested-switch"
		aria-label="Notifications"
		onchange={box.inputChanged}
	/>
{:else}
	<Switch.Root
		style={size}
		id="tested-switch"
		bind:checked={box.checked}
		disabled={scenario === 'disabled'}
		readonly={scenario === 'readonly'}
		onchange={box.inputChanged}
		onclick={box.clicked}
		aria-label="Notifications"
	>
		<Switch.Thumb />
	</Switch.Root>
{/if}
<output data-testid="calls">{JSON.stringify(box.calls)}</output>
<output data-testid="values">{JSON.stringify(box.values)}</output>
