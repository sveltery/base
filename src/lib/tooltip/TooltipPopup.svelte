<!--
	A container for the tooltip contents. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/popup/TooltipPopup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Upstream gives the popup no role, and the trigger no `aria-describedby`. Neither is added here.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { setFloatingPopupScope, useHoverFloatingInteraction } from '@sveltery/floating-ui-svelte';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { useTooltipPositioner, useTooltipRoot } from './context.svelte.js';
	import type { TooltipPopupProps, TooltipPopupState } from './types.js';

	let { render, children, ...elementProps }: TooltipPopupProps = $props();

	const store = useTooltipRoot();
	const positioning = useTooltipPositioner();
	const bindKey = createAttachmentKey();
	setFloatingPopupScope(store);

	useOpenChangeComplete(() => ({
		enabled: store.open && store.mounted,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpened();
		}
	}));

	useHoverFloatingInteraction(store, () => ({
		enabled: !store.disabled,
		closeDelay: store.closeDelay
	}));

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
		};
	}

	const popupState: TooltipPopupState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		instant: store.instantType,
		transitionStatus: store.transitionStatus
	});

	const hostProps = $derived(
		mergeProps(
			{
				...FOCUSABLE_POPUP_PROPS,
				style: toCssStyle({
					...store.popupVars,
					...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(popupState, popupTransitionStateMapping),
				[bindKey]: bindPopup
			},
			store.popupProps,
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, popupState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
