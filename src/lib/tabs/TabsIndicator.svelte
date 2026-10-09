<!--
	A visual indicator aligned to the active tab. Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/indicator/TabsIndicator.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The pre-hydration script (`renderBeforeHydration`) is not ported.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ownerWindow } from '../internal/owner.js';
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
	const attachmentKey = createAttachmentKey();

	let geometry = $state<IndicatorGeometry | null>(null);
	let geometryAttachment = $state<Attachment<HTMLElement>>(() => {});

	function observeGeometry(activeTab: HTMLElement | null, listElement: HTMLElement | null) {
		return (node: HTMLElement) => {
			const measure = () => {
				if (!activeTab || !listElement) {
					geometry = null;
					return;
				}
				geometry = measureIndicator(activeTab, listElement);
			};
			const Observer = ownerWindow(node).ResizeObserver;
			if (typeof Observer !== 'function' || !activeTab || !listElement) {
				measure();
				return;
			}
			const observer = new Observer(measure);
			observer.observe(activeTab);
			observer.observe(listElement);
			measure();
			return () => observer.disconnect();
		};
	}

	$effect(() => {
		const selected = tabs.value;
		const listElement = list.listElement;
		const activeTab = selected == null || !listElement ? null : tabs.tabElement(selected);
		geometryAttachment = observeGeometry(activeTab, listElement);
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

	const hostProps: HTMLAttributes<HTMLSpanElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			role: 'presentation',
			...(display && geometry
				? { style: joinStyle(indicatorStyle(geometry), style ?? undefined) }
				: { style: style ?? undefined }),
			...(!display ? { hidden: true } : {}),
			...getStateAttributesProps(indicatorState, indicatorStateAttributesMapping),
			...elementProps,
			...(render ? { [attachmentKey]: geometryAttachment } : {})
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
		<span {...hostProps} {@attach geometryAttachment}>{@render children?.()}</span>
	{/if}
{/if}
