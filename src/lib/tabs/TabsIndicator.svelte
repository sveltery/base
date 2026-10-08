<!--
	A visual indicator aligned to the active tab. Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/indicator/TabsIndicator.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The pre-hydration script (`renderBeforeHydration`) is not ported.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { indicatorStateAttributesMapping } from './attributes.js';
	import { useTabsListContext, useTabsRootContext } from './context.svelte.js';
	import { indicatorStyle, measureIndicator } from './indicator.js';
	import type { TabsIndicatorProps, TabsIndicatorState } from './types.js';

	let {
		renderBeforeHydration: _renderBeforeHydration = false,
		style,
		render,
		children,
		...elementProps
	}: TabsIndicatorProps = $props();

	const tabs = useTabsRootContext();
	const list = useTabsListContext();

	const geometry = $derived.by(() => {
		void list.resizeRevision;
		const selected = tabs.value;
		const listElement = list.listElement;
		if (selected == null || !listElement) return null;
		const activeTab = tabs.tabElement(selected);
		if (!activeTab) return null;
		return measureIndicator(activeTab, listElement);
	});

	const display = $derived(geometry != null && geometry.width > 0 && geometry.height > 0);

	const state: TabsIndicatorState = $derived({
		orientation: tabs.orientation,
		tabActivationDirection: tabs.tabActivationDirection,
		activeTabPosition: geometry
			? { left: geometry.left, right: geometry.right, top: geometry.top, bottom: geometry.bottom }
			: null,
		activeTabSize: geometry ? { width: geometry.width, height: geometry.height } : null
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		role: 'presentation',
		...(display && geometry
			? { style: joinStyle(indicatorStyle(geometry), style ?? undefined) }
			: { style: style ?? undefined }),
		...(!display ? { hidden: true } : {}),
		...getStateAttributesProps(state, indicatorStateAttributesMapping),
		...elementProps
	});

	function joinStyle(vars: string, extra: string | undefined) {
		if (!extra) return vars;
		return `${vars};${extra}`;
	}
</script>

{#if tabs.value != null}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
