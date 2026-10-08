<!--
	A container for the popover contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/popup/PopoverPopup.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { REASONS } from '../internal/event-details.js';
	import {
		FloatingFocusManager,
		useHoverFloatingInteraction
	} from '../internal/floating-ui/index.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { COMPOSITE_KEYS } from './constants.js';
	import { setCloseParts, usePopoverPositioner, usePopoverRoot } from './context.svelte.js';
	import { resolveFocus } from './focus-target.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverPopupProps, PopoverPopupState } from './types.js';

	let {
		initialFocus = undefined,
		finalFocus = undefined,
		render,
		children,
		...elementProps
	}: PopoverPopupProps = $props();

	const store = usePopoverRoot();
	const positioning = usePopoverPositioner();
	const bindKey = createAttachmentKey();

	let closeCount = $state(0);
	setCloseParts({
		get count() {
			return closeCount;
		},
		register() {
			closeCount += 1;
			return () => {
				closeCount = Math.max(0, closeCount - 1);
			};
		}
	});
	store.readCloseCount = () => closeCount;
	store.readFinalFocus = (interaction) => resolveFocus(finalFocus, interaction, store.popupElement);

	useHoverFloatingInteraction(store, () => ({
		enabled: store.openOnHover && !store.triggerDisabled,
		closeDelay: store.closeDelay
	}));

	useOpenChangeComplete(() => ({
		enabled: store.open && store.mounted,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpened();
		}
	}));

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		store.floatingElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
			if (store.floatingElement === node) store.floatingElement = null;
		};
	}

	const popupState: PopoverPopupState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		transitionStatus: store.transitionStatus,
		instant: store.instantType
	});

	function inToolbar(event: KeyboardEvent) {
		const current = event.currentTarget;
		if (current instanceof Element && current.closest('[role="toolbar"]')) return true;
		const trigger = store.activeTriggerElement;
		return trigger instanceof Element && Boolean(trigger.closest('[role="toolbar"]'));
	}

	const resolvedInitial = $derived(
		resolveFocus(initialFocus, store.openMethod ?? store.lastInteraction, store.popupElement)
	);

	const hostProps = $derived(
		asHost<HTMLDivElement>(
			mergeProps(
				loose(elementProps),
				loose(store.dismissFloating),
				loose({
					id: store.floatingId,
					role: 'dialog',
					...FOCUSABLE_POPUP_PROPS,
					...(store.titleElementId ? { 'aria-labelledby': store.titleElementId } : {}),
					...(store.descriptionElementId ? { 'aria-describedby': store.descriptionElementId } : {}),
					onkeydown(event: KeyboardEvent) {
						if (inToolbar(event) && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
					},
					style: store.transitionStatus === 'starting' ? 'transition: none' : undefined,
					...getStateAttributesProps(popupState, popupTransitionStateMapping),
					[bindKey]: bindPopup
				})
			)
		)
	);
</script>

<FloatingFocusManager
	{store}
	disabled={!store.mounted || store.openChangeReason === REASONS.triggerHover}
	initialFocus={resolvedInitial}
	returnFocus={!store.suppressReturnFocus}
	modal={store.focusManagerModal}
>
	{#if render}
		{@render render(hostProps, popupState, content)}
	{:else}
		<div {...hostProps}>{@render content()}</div>
	{/if}
</FloatingFocusManager>

{#snippet content()}
	{@render children?.()}
{/snippet}
