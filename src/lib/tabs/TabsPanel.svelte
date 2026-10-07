<!--
	A panel displayed when the corresponding tab is active. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/panel/TabsPanel.tsx,
	useTransitionStatus (default arguments) and useOpenChangeComplete
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { panelStateAttributesMapping } from './attributes.js';
	import type { TransitionStatus } from '../collapsible/types.js';
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

	let mounted = $state(untrack(() => value === tabs.value));
	let transitionStatus: TransitionStatus = $state(undefined);
	let panelNode: HTMLElement | null = $state(null);

	function registerPanel(element: HTMLElement) {
		panelNode = element;
		const remove = tabs.registerPanelElement(element);
		return () => {
			remove();
			if (panelNode === element) panelNode = null;
		};
	}

	$effect.pre(() => {
		if (open && !mounted) {
			mounted = true;
			transitionStatus = 'starting';
		}
		if (!open && mounted && transitionStatus !== 'ending') {
			transitionStatus = 'ending';
		}
		if (!open && !mounted && transitionStatus === 'ending') {
			transitionStatus = undefined;
		}
	});

	$effect(() => {
		if (!open) return;
		const frame = requestAnimationFrame(() => {
			transitionStatus = undefined;
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const element = panelNode;
		const isOpen = open;
		const isMounted = mounted;
		if (isOpen || !element || !isMounted) return;

		const abort = new AbortController();
		runOnceAnimationsFinish(
			element,
			() => {
				if (!open) mounted = false;
			},
			abort.signal,
			false
		);
		return () => abort.abort();
	});

	$effect(() => {
		const hiddenNow = !mounted;
		if (hiddenNow && !keepMounted) return;
		return tabs.registerPanel(value, panelId);
	});

	const hidden = $derived(!mounted);
	const shouldRender = $derived(keepMounted || mounted);
	const tabId = $derived(tabs.tabIdFor(value));
	const index = $derived(tabs.panelIndex(panelNode));

	const panelState: TabsPanelState = $derived({
		hidden,
		orientation: tabs.orientation,
		tabActivationDirection: tabs.tabActivationDirection,
		transitionStatus
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

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, panelState, content)}
	{:else}
		<div {...hostProps}>{@render content()}</div>
	{/if}
{/if}
