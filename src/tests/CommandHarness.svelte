<script lang="ts">
	import { Command } from '#lib';
	import type { CommandFilter } from '#lib';
	import CommandStateProbe from './CommandStateProbe.svelte';

	let {
		value = '',
		search = '',
		loop,
		vimBindings,
		disablePointerSelection,
		shouldFilter,
		filter,
		webItem = false,
		alwaysRender = false,
		onSelect,
		onValueChange
	}: {
		value?: string;
		search?: string;
		loop?: boolean;
		vimBindings?: boolean;
		disablePointerSelection?: boolean;
		shouldFilter?: boolean;
		filter?: CommandFilter;
		webItem?: boolean;
		alwaysRender?: boolean;
		onSelect?: (value: string) => void;
		onValueChange?: (value: string) => void;
	} = $props();

	export function bound() {
		return { value, search };
	}
	export function setValue(next: string) {
		value = next;
	}
</script>

<Command.Root
	data-testid="root"
	class="menu"
	label="Command menu"
	bind:value
	{loop}
	{vimBindings}
	{disablePointerSelection}
	{shouldFilter}
	{filter}
	{onValueChange}
>
	<Command.Input data-testid="input" placeholder="Type a command" bind:value={search} />
	<Command.List data-testid="list">
		<Command.Empty data-testid="empty">No results.</Command.Empty>
		<Command.Group data-testid="fruits" heading="Fruits">
			<Command.Item data-testid="apple" {onSelect}>Apple</Command.Item>
			<Command.Item data-testid="banana" {onSelect}>Banana</Command.Item>
			<Command.Item data-testid="pineapple" value="pineapple" keywords={['tropical']} {onSelect}
				>Pineapple</Command.Item
			>
		</Command.Group>
		<Command.Separator data-testid="separator" {alwaysRender} />
		<Command.Group data-testid="vegetables" heading="Vegetables">
			<Command.Item data-testid="carrot" {onSelect}>Carrot</Command.Item>
			<Command.Item data-testid="cabbage" disabled {onSelect}>Cabbage</Command.Item>
			<Command.Item data-testid="asparagus" {onSelect}>Asparagus</Command.Item>
		</Command.Group>
		<Command.Item data-testid="settings" keywords={['preferences']} {onSelect}>
			Settings
		</Command.Item>
		{#if webItem}
			<Command.Item data-testid="web" forceMount {onSelect}
				>Search the web for "{search}"</Command.Item
			>
		{/if}
		<CommandStateProbe />
	</Command.List>
</Command.Root>
