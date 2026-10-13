<!--
	A container for the preview card contents. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/popup/PreviewCardPopup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { useHoverFloatingInteraction } from '@sveltery/floating-ui-svelte';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { usePreviewCardPositioner, usePreviewCardRoot } from './context.svelte.js';
	import type { PreviewCardPopupProps, PreviewCardPopupState } from './types.js';

	let { render, children, ...elementProps }: PreviewCardPopupProps = $props();

	const store = usePreviewCardRoot();
	const positioning = usePreviewCardPositioner();
	const bindKey = createAttachmentKey();

	useOpenChangeComplete(() => ({
		enabled: store.open && store.mounted,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpened();
		}
	}));

	useHoverFloatingInteraction(store, () => ({ closeDelay: store.closeDelay }));

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
		};
	}

	const popupState: PreviewCardPopupState = $derived({
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
				...store.dismissFloating,
				style: toCssStyle({
					...store.popupVars,
					...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(popupState, popupTransitionStateMapping),
				[bindKey]: bindPopup
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, popupState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
