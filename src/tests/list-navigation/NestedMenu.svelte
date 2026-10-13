<!-- One level of upstream's `Menu` test fixture, keyboard only. A nested menu's trigger is an item of its parent. -->
<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ListOrientation } from '@sveltery/floating-ui-svelte';

	export type MenuEntry =
		string | { label: string; orientation?: ListOrientation; entries: MenuEntry[] };

	export interface ParentMenu {
		item: HTMLAttributes<HTMLElement>;
		register: (node: HTMLElement | null) => void;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import Self from './NestedMenu.svelte';
	import { useFloatingNodeId } from '@sveltery/floating-ui-svelte';
	import { ListNavigation } from '@sveltery/floating-ui-svelte';
	import { mergeProps } from './mergeProps.js';
	import { TestFloatingStore } from './TestFloatingStore.svelte.js';

	let {
		label,
		entries,
		orientation = 'vertical',
		parent
	}: {
		label: string;
		entries: MenuEntry[];
		orientation?: ListOrientation;
		parent?: ParentMenu;
	} = $props();

	const store = new TestFloatingStore(
		false,
		untrack(() => parent != null)
	);
	const items: Array<HTMLElement | null> = $state([]);
	let activeIndex = $state<number | null>(null);

	useFloatingNodeId(store);
	const nav = new ListNavigation(store, () => ({
		items: () => items,
		activeIndex,
		onNavigate: (index) => (activeIndex = index),
		nested: parent != null,
		orientation
	}));

	const triggerProps = $derived(parent ? mergeProps(parent.item, nav.reference) : nav.reference);

	function attachTrigger(node: HTMLElement) {
		store.domReferenceElement = node;
		parent?.register(node);
		return () => {
			store.domReferenceElement = null;
			parent?.register(null);
		};
	}
</script>

<button
	type="button"
	role={parent ? 'menuitem' : undefined}
	tabindex={parent ? -1 : 0}
	aria-haspopup="menu"
	aria-expanded={store.open}
	{@attach attachTrigger}
	{...triggerProps}
>
	{label}
</button>
{#if store.open}
	<div
		role="menu"
		aria-label={label}
		aria-orientation={orientation === 'both' ? undefined : orientation}
		tabindex="-1"
		bind:this={store.floatingElement}
		{...nav.floating}
	>
		{#each entries as entry, index (typeof entry === 'string' ? entry : entry.label)}
			{#if typeof entry === 'string'}
				<button type="button" role="menuitem" tabindex="-1" bind:this={items[index]} {...nav.item}>
					{entry}
				</button>
			{:else}
				<Self
					label={entry.label}
					entries={entry.entries}
					orientation={entry.orientation}
					parent={{ item: nav.item, register: (node) => (items[index] = node) }}
				/>
			{/if}
		{/each}
	</div>
{/if}
