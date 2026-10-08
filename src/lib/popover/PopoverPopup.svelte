<!--
	A container for the popover contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/popup/PopoverPopup.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { REASONS } from '../internal/event-details.js';
	import { toCssStyle } from '../internal/css-style.js';
	import {
		FloatingFocusManager,
		useHoverFloatingInteraction
	} from '../internal/floating-ui/index.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { COMPOSITE_KEYS } from '../internal/composite-keys.js';
	import { FOCUSABLE_POPUP_PROPS, resolveFocus } from '../internal/popups/index.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { setCloseParts, usePopoverPositioner, usePopoverRoot } from './context.svelte.js';
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

	// Plain count. A $state increment inside the close attachment both reads and
	// writes that state, so the attachment effect never settles.
	let closeCount = 0;
	setCloseParts({
		get count() {
			return closeCount;
		},
		register() {
			closeCount += 1;
			store.focusTrap = closeCount > 0;
			return () => {
				closeCount -= 1;
				store.focusTrap = closeCount > 0;
			};
		}
	});

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

	function focusIn(openType: string) {
		return resolveFocus(initialFocus, openType, store.popupElement);
	}

	// Close interaction comes from the shared manager. `null` falls back to the trigger there.
	function focusReturn(closeType: string | null): boolean | HTMLElement | null | void {
		const spec = finalFocus;
		if (typeof spec !== 'function') return spec;
		return spec(closeType ?? '');
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
		const trigger = store.domReferenceElement;
		return trigger instanceof Element && Boolean(trigger.closest('[role="toolbar"]'));
	}

	const hostProps = $derived(
		mergeProps(elementProps, store.dismissFloating, {
			id: store.floatingId,
			role: 'dialog' as const,
			...FOCUSABLE_POPUP_PROPS,
			...(store.titleElementId ? { 'aria-labelledby': store.titleElementId } : {}),
			...(store.descriptionElementId ? { 'aria-describedby': store.descriptionElementId } : {}),
			onkeydown(event: KeyboardEvent) {
				if (inToolbar(event) && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
			},
			style: toCssStyle({
				...store.popupVars,
				...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
			}),
			...getStateAttributesProps(popupState, popupTransitionStateMapping),
			[bindKey]: bindPopup
		})
	);
</script>

<FloatingFocusManager
	{store}
	disabled={!store.mounted || store.openChangeReason === REASONS.triggerHover}
	initialFocus={focusIn}
	returnFocus={typeof finalFocus === 'function' ? focusReturn : finalFocus}
	modal={store.focusManagerModal}
	restoreFocus="popup"
>
	{#if render}
		{@render render(hostProps, popupState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
</FloatingFocusManager>
