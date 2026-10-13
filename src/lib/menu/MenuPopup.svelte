<!--
	A container for the menu items. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopup.tsx and
	packages/react/src/internals/resolvePopupLabel.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The filter variant (`Menu.List`, virtual focus handoff) is not ported.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { createChangeEventDetails } from '@sveltery/utils';
	import { FloatingFocusManager, useHoverFloatingInteraction } from '@sveltery/floating-ui-svelte';
	import { COMPOSITE_KEYS } from '../internal/composite-keys.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { MENU_REASONS } from './constants.js';
	import { useMenuPositioner, useMenuRoot } from './context.svelte.js';
	import type { MenuChangeReason, MenuPopupProps, MenuPopupState } from './types.js';

	let { finalFocus = undefined, render, children, ...elementProps }: MenuPopupProps = $props();

	const root = useMenuRoot();
	const store = root.store;
	const positioning = useMenuPositioner();
	const bindKey = createAttachmentKey();

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

	const returnFocusDefault = $derived(
		store.activeTriggerElement != null ||
			parentType === undefined ||
			parentType === 'context-menu' ||
			(parentType === 'menubar' && store.openChangeReason !== MENU_REASONS.outsidePress)
	);

	function focusReturn(closeType: string | null): boolean | HTMLElement | null | void {
		const spec = finalFocus;
		if (typeof spec !== 'function') return spec;
		return spec(closeType ?? '');
	}

	const hostProps = $derived(
		mergeProps(
			store.popupProps,
			{
				id: store.floatingId,
				role: 'menu' as const,
				...(root.orientation === 'horizontal' ? { 'aria-orientation': 'horizontal' as const } : {}),
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				onkeydown(event: KeyboardEvent) {
					const current = event.currentTarget;
					const inToolbar =
						current instanceof Element && current.closest('[role="toolbar"]') != null;
					const trigger = store.domReferenceElement;
					const triggerInToolbar =
						trigger instanceof Element && trigger.closest('[role="toolbar"]') != null;
					if ((inToolbar || triggerInToolbar) && COMPOSITE_KEYS.has(event.key)) {
						event.stopPropagation();
					}
				},
				style: toCssStyle({
					...store.popupVars,
					...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(popupState, popupTransitionStateMapping),
				[bindKey]: bindPopup
			},
			elementProps,
			{ 'data-rootownerid': store.rootId }
		)
	);
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
