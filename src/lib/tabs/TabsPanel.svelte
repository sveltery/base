<!--
	A panel displayed when the corresponding tab is active. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/panel/TabsPanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import { panelStateAttributesMapping } from './attributes.js';
	import { useTabsRootContext } from './context.svelte.js';
	import type { TabsPanelProps, TabsPanelState } from './types.js';

	const uid = $props.id();
	const panelKey = createAttachmentKey();

	let {
		value,
		keepMounted = false,
		id,
		render,
		children,
		...elementProps
	}: TabsPanelProps = $props();

	const tabs = useTabsRootContext();
	const generatedId = $derived(`base-ui-${uid}`);
	const panelId = $derived(id ?? generatedId);
	const open = $derived(value === tabs.value);

	const transition = new TransitionStatus(() => open);
	let panelNode: HTMLElement | null = $state(null);

	function registerPanel(element: HTMLElement) {
		panelNode = element;
		const remove = tabs.panels.register(element);
		return () => {
			remove();
			if (panelNode === element) panelNode = null;
		};
	}

	transition.unmountAfterExit(() => panelNode);

	$effect(() => {
		const hiddenNow = !transition.mounted;
		if (hiddenNow && !keepMounted) return;
		return tabs.registerPanel(value, panelId);
	});

	const hidden = $derived(!transition.mounted);
	const shouldRender = $derived(keepMounted || transition.mounted);
	const tabId = $derived(tabs.tabIdFor(value));
	const index = $derived(tabs.panels.indexOf(panelNode));

	const panelState: TabsPanelState = $derived({
		hidden,
		orientation: tabs.orientation,
		tabActivationDirection: tabs.tabActivationDirection,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			id: panelId,
			role: 'tabpanel',
			tabindex: open ? 0 : -1,
			...(tabId ? { 'aria-labelledby': tabId } : {}),
			...(hidden ? { hidden: true } : {}),
			...(!open ? { inert: true } : {}),
			'data-index': String(index),
			...getStateAttributesProps(panelState, panelStateAttributesMapping),
			...elementProps,
			[panelKey]: registerPanel
		});
</script>

{#if shouldRender}
	{#if render}
		{@render render(hostProps, panelState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
{/if}
