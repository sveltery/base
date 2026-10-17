<!--
	A visual indicator that can be styled to match the position of the currently active tab.
	Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/tabs/indicator/TabsIndicator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PrehydrationScript from '../internal/PrehydrationScript.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { indicatorStateAttributesMapping } from './attributes.js';
	import { useTabsListContext, useTabsRootContext } from './context.svelte.js';
	import { indicatorStyle, measureIndicator, type IndicatorGeometry } from './indicator.js';
	import { prehydrationScript } from './prehydration.js';
	import type { TabsIndicatorProps, TabsIndicatorState } from './types.js';

	let {
		renderBeforeHydration = false,
		style,
		render,
		children,
		...elementProps
	}: TabsIndicatorProps = $props();

	const tabs = useTabsRootContext();
	const list = useTabsListContext();

	let geometry = $state<IndicatorGeometry | null>(null);

	// Upstream rerenders from registerIndicatorUpdateListener. This effect re-measures.
	$effect(() => {
		list.trackLayout();
		const selected = tabs.value;
		const listElement = list.listElement;
		const activeTab = selected == null || !listElement ? null : tabs.tabElement(selected);
		geometry = activeTab && listElement ? measureIndicator(activeTab, listElement) : null;
	});

	const display = $derived(geometry != null && geometry.width > 0 && geometry.height > 0);

	const indicatorState: TabsIndicatorState = $derived({
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
		...getStateAttributesProps(indicatorState, indicatorStateAttributesMapping),
		...elementProps
	});

	function joinStyle(vars: string, extra: string | undefined) {
		if (!extra) return vars;
		return `${vars};${extra}`;
	}
</script>

{#if tabs.value != null}
	{#if render}
		{@render render(hostProps, indicatorState, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
	{#if renderBeforeHydration}
		<PrehydrationScript script={prehydrationScript} />
	{/if}
{/if}
