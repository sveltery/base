<!--
	Groups the individual tab buttons. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/list/TabsList.tsx
	and the linear composite keyboard path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Scroll-into-view is not ported.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { isSkipped } from '../internal/composite-skip.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { tabsStateAttributesMapping } from './attributes.js';
	import { setTabsListContext, TabsListModel, useTabsRootContext } from './context.svelte.js';
	import type { TabsListProps, TabsListState } from './types.js';

	let {
		activateOnFocus = false,
		loopFocus = true,
		render,
		children,
		...elementProps
	}: TabsListProps = $props();

	const reading = useDirection();
	const tabs = useTabsRootContext();
	const roving: CompositeRoot = new CompositeRoot({
		orientation: () => tabs.orientation,
		loopFocus: () => loopFocus,
		direction: () => reading.direction,
		isItemDisabled: (element) => isSkipped(element),
		isItemSelected: (element): boolean => {
			const meta = roving.meta(element);
			const current = tabs.value;
			if (meta.disabled || current == null || !('value' in meta)) return false;
			return meta.value === current;
		},
		disabledHoldsStop: true,
		keys: 'composite',
		homeEnd: true,
		stopPropagation: false,
		replacement: 'index',
		keydown: 'item'
	});
	const list = new TabsListModel(roving, () => activateOnFocus);
	setTabsListContext(list);

	function attachList(element: HTMLElement) {
		return list.attachList(element);
	}

	$effect(() => {
		return () => list.disconnect();
	});

	const state: TabsListState = $derived({
		orientation: tabs.orientation,
		tabActivationDirection: tabs.tabActivationDirection
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'tablist',
		...(tabs.orientation === 'vertical' ? { 'aria-orientation': 'vertical' as const } : {}),
		...getStateAttributesProps(state, tabsStateAttributesMapping),
		...elementProps,
		[list.roving.attachmentKey]: attachList
	});
</script>

{#snippet empty()}{/snippet}

{#if render}
	{@render render(hostProps, state, children ?? empty)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
