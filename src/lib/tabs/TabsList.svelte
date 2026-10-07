<!--
	Groups the individual tab buttons. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/list/TabsList.tsx
	and the linear composite keyboard path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Scroll-into-view is not ported.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
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

	const tabs = useTabsRootContext();
	const list = new TabsListModel();
	setTabsListContext(list);

	$effect.pre(() => {
		list.activateOnFocus = activateOnFocus;
		list.roving.loopFocus = loopFocus;
		list.roving.orientation = tabs.orientation;
	});

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
		[list.roving.keyForAttachment()]: attachList
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
