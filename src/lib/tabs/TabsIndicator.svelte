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
	import { indicatorStyle, measureIndicator, type IndicatorGeometry } from './indicator.js';
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

	let geometry = $state<IndicatorGeometry | null>(null);

	// The list observer already watches the list and every tab. Upstream rerenders
	// from registerIndicatorUpdateListener; this writes the measured geometry.
	$effect(() => {
		const selected = tabs.value;
		const listElement = list.listElement;
		const activeTab = selected == null || !listElement ? null : tabs.tabElement(selected);
		const measure = () => {
			if (!activeTab || !listElement) {
				geometry = null;
				return;
			}
			geometry = measureIndicator(activeTab, listElement);
		};
		measure();
		return list.registerIndicatorUpdateListener(measure);
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
{/if}
