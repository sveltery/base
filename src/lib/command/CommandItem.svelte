<!--
	An item in the command menu. Renders a `<div>` element.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { cmdk } from './utils.js';
	import PartAnchor from './PartAnchor.svelte';
	import { findGroup, ItemModel } from './item-state.svelte.js';
	import { usePart } from './parts.svelte.js';
	import { getCommand } from './root-state.svelte.js';
	import type { CommandItemProps } from './types.js';

	let {
		value,
		keywords,
		disabled = false,
		forceMount,
		onSelect,
		onclick,
		onpointermove,
		children,
		...rest
	}: CommandItemProps = $props();

	const generated = $props.id();
	const root = getCommand();
	const item = new ItemModel(root, findGroup(), {
		anchor: generated,
		view,
		id: generated,
		get value() {
			return value;
		},
		get keywords() {
			return keywords;
		},
		get disabled() {
			return disabled;
		},
		get forceMount() {
			return forceMount;
		},
		get onSelect() {
			return onSelect;
		}
	});
	const container = usePart(root, item, () => root.register(item));
</script>

{#snippet view()}
	<div
		{...rest}
		id={item.id}
		{...cmdk.item}
		role="option"
		aria-disabled={disabled}
		aria-selected={item.selected}
		data-disabled={disabled}
		data-selected={item.selected}
		data-value={item.value}
		onpointermove={(event) => {
			onpointermove?.(event);
			if (event.defaultPrevented) return;
			item.hover();
		}}
		onclick={(event) => {
			onclick?.(event);
			if (event.defaultPrevented) return;
			item.activate();
		}}
		{@attach item.attach}
	>
		{@render children?.()}
	</div>
{/snippet}

<PartAnchor
	part={item}
/>{#if !container && (!root.view || root.view.visibleItems.has(item))}{@render view()}{/if}
