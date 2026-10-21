<script lang="ts">
	import { Checkbox } from '#lib';
	import { CheckedFixture } from '../checked-state.svelte.js';
	import type { CheckboxCase } from './cases.js';

	let { scenario }: { scenario: CheckboxCase } = $props();
	const box = new CheckedFixture(() => scenario);
	// The box has no content of its own, so the fixture gives it a size to click.
	const size = 'display: inline-block; width: 16px; height: 16px';
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner checked" bind:checked={box.owner} />
	<Checkbox.Root
		style={size}
		id="tested-checkbox"
		bind:checked={box.owner}
		onchange={box.inputChanged}
		aria-label="Notifications"
	>
		<Checkbox.Indicator />
	</Checkbox.Root>
{:else if scenario === 'form' || scenario === 'enter'}
	<form onsubmit={box.submitted}>
		<Checkbox.Root
			style={size}
			id="tested-checkbox"
			name="notifications"
			value="yes"
			uncheckedValue="no"
			onchange={box.inputChanged}
			aria-label="Notifications"
		>
			<Checkbox.Indicator />
		</Checkbox.Root>
		<button type="submit">Submit</button>
	</form>
{:else if scenario === 'label'}
	<label data-testid="label">
		<span>Toggle</span>
		<Checkbox.Root
			style={size}
			id="tested-checkbox"
			onchange={box.inputChanged}
			aria-label="Notifications"
		>
			<Checkbox.Indicator />
		</Checkbox.Root>
	</label>
{:else if scenario === 'native'}
	<!-- Sveltery renders a real input, so there is no native button host. -->
	<Checkbox.Root
		style={size}
		id="tested-checkbox"
		aria-label="Notifications"
		onchange={box.inputChanged}
	/>
{:else if scenario === 'indeterminate'}
	<Checkbox.Root
		style={size}
		id="tested-checkbox"
		indeterminate
		onchange={box.inputChanged}
		aria-label="Notifications"
	>
		<Checkbox.Indicator data-testid="indicator" />
	</Checkbox.Root>
{:else}
	<Checkbox.Root
		style={size}
		id="tested-checkbox"
		bind:checked={box.checked}
		disabled={scenario === 'disabled'}
		readonly={scenario === 'readonly'}
		onchange={box.inputChanged}
		onclick={box.clicked}
		aria-label="Notifications"
	>
		<Checkbox.Indicator />
	</Checkbox.Root>
{/if}
<output data-testid="calls">{JSON.stringify(box.calls)}</output>
<output data-testid="values">{JSON.stringify(box.values)}</output>
