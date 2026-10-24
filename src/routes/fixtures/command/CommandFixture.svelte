<script lang="ts">
	import { Command } from '#lib';
	import type { CommandCase } from './cases.js';

	let { scenario }: { scenario: CommandCase } = $props();

	// svelte-ignore state_referenced_locally
	const preset = scenario === 'preset';
	let search = $state(preset ? 'c' : '');
	let value = $state(preset ? 'Carrot' : '');
	let selected = $state<string[]>([]);

	const onSelect = (picked: string) => selected.push(picked);
</script>

<Command.Root label="Command menu" bind:value loop={scenario === 'loop'}>
	<Command.Input placeholder="Type a command" bind:value={search} />
	<Command.List>
		<Command.Empty>No results.</Command.Empty>
		<Command.Group heading="Fruits">
			<Command.Item {onSelect}>Apple</Command.Item>
			<Command.Item {onSelect}>Banana</Command.Item>
			<Command.Item value="pineapple" keywords={['tropical']} {onSelect}>Pineapple</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Vegetables">
			<Command.Item {onSelect}>Carrot</Command.Item>
			<Command.Item disabled {onSelect}>Cabbage</Command.Item>
			<Command.Item {onSelect}>Asparagus</Command.Item>
		</Command.Group>
		<Command.Item keywords={['preferences']} {onSelect}>Settings</Command.Item>
	</Command.List>
</Command.Root>
<output data-testid="value">{value}</output>
<output data-testid="selected">{JSON.stringify(selected)}</output>
