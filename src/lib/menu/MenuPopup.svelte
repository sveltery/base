<!--
	A container for the menu items. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopup.tsx and
	packages/react/src/internals/resolvePopupLabel.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The filter variant (`Menu.List`, virtual focus handoff) is not ported.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { untrack } from 'svelte';
	import {
		activeElement,
		contains,
		createChangeEventDetails,
		ownerDocument
	} from '@sveltery/utils';
	import { FloatingFocusManager, useHoverFloatingInteraction } from '@sveltery/floating-ui-svelte';
	import { COMPOSITE_KEYS } from '../internal/composite-keys.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { MENU_REASONS } from './constants.js';
	import { liveStyle } from './live-style.js';
	import { useMenuPositioner, useMenuRoot } from './context.svelte.js';
	import type { MenuChangeReason, MenuPopupProps, MenuPopupState } from './types.js';

	let { finalFocus = undefined, render, children, ...elementProps }: MenuPopupProps = $props();

	const root = useMenuRoot();
	const store = root.store;
	const positioning = useMenuPositioner();
	const bindKey = createAttachmentKey();
	const styleKey = createAttachmentKey();
	const ownStyle = liveStyle(() => ({
		...store.popupVars,
		...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
	}));

	useOpenChangeComplete(() => ({
		enabled: store.open && store.mounted,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpenChangeComplete(true);
		}
	}));

	// An item press anywhere in the menu tree closes every menu in it.
	$effect(() => {
		const events = store.tree?.events;
		if (!events) return;
		return events.on('close', (data) => {
			const event = data as { domEvent: Event | undefined; reason: MenuChangeReason };
			store.setOpen(false, createChangeEventDetails(event.reason, event.domEvent));
		});
	});

	useHoverFloatingInteraction(store, () => ({
		enabled:
			store.hoverEnabled &&
			!store.disabled &&
			store.parent.type !== 'context-menu' &&
			store.parent.type !== 'menubar',
		closeDelay: store.closeDelay
	}));

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		store.floatingElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
			if (store.floatingElement === node) store.floatingElement = null;
		};
	}

	const parentType = $derived(store.parent.type);

	const popupState: MenuPopupState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		transitionStatus: store.transitionStatus,
		nested: parentType === 'menu',
		instant: store.instantType
	});

	// The trigger names the menu unless the consumer labels it.
	const labelledBy = $derived.by(() => {
		if (elementProps['aria-labelledby'] != null || elementProps['aria-label']) return undefined;
		const trigger = store.activeTriggerElement;
		return trigger ? trigger.id || undefined : store.resolvedActiveTriggerId() || undefined;
	});

	// Upstream's focus manager returns focus to the element focused before an open with no
	// interaction type (a programmatic or hover open) ahead of the trigger. The shared manager
	// always prefers the trigger, so the popup names that element itself. It is a snapshot of
	// focus at the moment of opening, so it cannot be derived.
	let previousFocus = $state<HTMLElement | null>(null);
	let wasOpen = false;
	$effect.pre(() => {
		const open = store.open;
		if (open === wasOpen) return;
		wasOpen = open;
		if (!open) return;
		const doc = ownerDocument(untrack(() => store.domReferenceElement) ?? null);
		const active = activeElement(doc);
		previousFocus =
			untrack(() => store.openMethod) == null &&
			active instanceof HTMLElement &&
			active !== doc.body
				? active
				: null;
	});

	/** The boolean `returnFocus` path, aimed at `previousFocus`: return only while focus is inside. */
	function returnToPreviousFocus(): HTMLElement | false {
		const target = previousFocus;
		if (!target?.isConnected) return false;
		const doc = ownerDocument(target);
		const active = activeElement(doc);
		const inside = contains(store.floatingElement, active) || active === doc.body || active == null;
		return inside ? target : false;
	}

	const returnFocusDefault = $derived.by(() => {
		const returns =
			store.activeTriggerElement != null ||
			parentType === undefined ||
			parentType === 'context-menu' ||
			(parentType === 'menubar' && store.openChangeReason !== MENU_REASONS.outsidePress);
		return returns && previousFocus ? returnToPreviousFocus : returns;
	});

	function focusReturn(closeType: string | null): boolean | HTMLElement | null | void {
		const spec = finalFocus;
		if (typeof spec !== 'function') return spec;
		const resolved = spec(closeType ?? '');
		return (resolved === true || resolved === null) && previousFocus?.isConnected
			? previousFocus
			: resolved;
	}

	function stopInToolbar(event: KeyboardEvent) {
		const current = event.currentTarget;
		const inToolbar = current instanceof Element && current.closest('[role="toolbar"]') != null;
		const trigger = store.domReferenceElement;
		const triggerInToolbar =
			trigger instanceof Element && trigger.closest('[role="toolbar"]') != null;
		if ((inToolbar || triggerInToolbar) && COMPOSITE_KEYS.has(event.key)) {
			event.stopPropagation();
		}
	}

	const hostProps = $derived.by(() => {
		const { onkeydown: popupKeyDown, ...popupProps } = store.popupProps;
		const { onkeydown: consumerKeyDown, ...consumerProps } = elementProps;
		return mergeProps(
			popupProps,
			{
				id: store.floatingId,
				role: 'menu' as const,
				...(root.orientation === 'horizontal' ? { 'aria-orientation': 'horizontal' as const } : {}),
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				// An item prevents the keys it handles, such as Space, before they bubble here.
				// `mergeProps` would read that as the consumer opting out, so the chain is explicit:
				// only a `preventDefault()` in the consumer's own handler skips the menu's handlers.
				onkeydown(event: KeyboardEvent) {
					const preventedBefore = event.defaultPrevented;
					consumerKeyDown?.(event as never);
					if (!preventedBefore && event.defaultPrevented) return;
					stopInToolbar(event);
					popupKeyDown?.(event as never);
				},
				...getStateAttributesProps(popupState, popupTransitionStateMapping),
				[bindKey]: bindPopup,
				[styleKey]: ownStyle
			},
			consumerProps,
			{ 'data-rootownerid': store.rootId }
		);
	});
</script>

<FloatingFocusManager
	{store}
	modal={parentType === 'context-menu'}
	disabled={!store.mounted}
	initialFocus={parentType !== 'menu'}
	returnFocus={finalFocus === undefined
		? returnFocusDefault
		: typeof finalFocus === 'function'
			? focusReturn
			: finalFocus}
	restoreFocus={true}
	previousFocusableElement={store.activeTriggerElement instanceof HTMLElement
		? store.activeTriggerElement
		: null}
>
	{#if render}
		{@render render(hostProps, popupState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
</FloatingFocusManager>
