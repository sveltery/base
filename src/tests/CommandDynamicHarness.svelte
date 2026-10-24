<script lang="ts">
	import { Command } from '#lib';
	import type { CommandFilter } from '#lib';
	import CommandThrower from './CommandThrower.svelte';

	let {
		shouldFilter,
		filter,
		value = '',
		onValueChange
	}: {
		shouldFilter?: boolean;
		filter?: CommandFilter;
		value?: string;
		onValueChange?: (value: string) => void;
	} = $props();

	let items = $state(['one', 'two', 'three']);
	let text = $state('Draft');
	let search = $state('');
	let broken = $state(false);

	export function setItems(next: string[]) {
		items = next;
	}
	export function setText(next: string) {
		text = next;
	}
	export function setBroken(next: boolean) {
		broken = next;
	}
	export function bound() {
		return { value, search };
	}
</script>

<Command.Root bind:value {shouldFilter} {filter} {onValueChange}>
	<Command.Input data-testid="input" bind:value={search} />
	<Command.List>
		<Command.Empty data-testid="empty">Nothing</Command.Empty>
		{#each items as item (item)}
			<Command.Item data-testid={item} value={item}>{item}</Command.Item>
		{/each}
		{#if broken}
			<svelte:boundary>
				<Command.Item data-testid="ghost" value="ghost">ghost</Command.Item>
				<CommandThrower />
				{#snippet failed()}<span data-testid="failed">failed</span>{/snippet}
			</svelte:boundary>
		{/if}
		<Command.Item data-testid="text">{text}</Command.Item>
	</Command.List>
</Command.Root>
