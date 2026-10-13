<!--
	A container for the menu items. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopup.tsx,
	packages/react/src/menu/filter-root/MenuFilterPopup.tsx and
	packages/react/src/internals/resolvePopupLabel.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A filterable menu's popup is a `dialog` that holds the input and the list. A portaled submenu
	relays its keys and focus here through `relayKeyDown` and `relayFocusIn`.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import {
		REASONS,
		activeElement,
		contains,
		createChangeEventDetails,
		ownerDocument
	} from '@sveltery/utils';
	import {
		FloatingFocusManager,
		useHoverFloatingInteraction,
		type OpenChangePayload
	} from '@sveltery/floating-ui-svelte';
	import { COMPOSITE_KEYS } from '../internal/composite-keys.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { liveStyle } from './live-style.js';
	import { useMenuPositioner, useMenuRoot } from './context.svelte.js';
	import { isConsumerPrevented } from './filter-keydown.js';
	import { MenuFilterPopupBehavior, useVirtualFocusParentHandoff } from './filter-popup.svelte.js';
	import type { MenuChangeReason, MenuPopupProps, MenuPopupState } from './types.js';

	let { finalFocus = undefined, render, children, ...elementProps }: MenuPopupProps = $props();

	const root = useMenuRoot();
	const store = root.store;
	const positioning = useMenuPositioner();
	const bindKey = createAttachmentKey();
	const styleKey = createAttachmentKey();
	const direction = useDirection();
	const filterPopup = store.filter
		? new MenuFilterPopupBehavior(store, () => ({
				orientation: root.orientation,
				rtl: direction.direction === 'rtl'
			}))
		: null;
	const handoff = useVirtualFocusParentHandoff(store);
	const ownStyle = liveStyle(
		() => ({
			...store.popupVars,
			...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
		}),
		() => elementProps.style
	);

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
		store.popupDomId = node.id;
		const observer = new MutationObserver(() => {
			if (store.popupElement === node) store.popupDomId = node.id;
		});
		observer.observe(node, { attributes: true, attributeFilter: ['id'] });
		return () => {
			observer.disconnect();
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

	// A rendered plain `Menu.List` carries the `menu` semantics instead.
	const listElement = $derived(store.listElement);

	// The trigger names the menu unless the consumer labels it.
	const labelledBy = $derived.by(() => {
		if (elementProps['aria-labelledby'] != null || elementProps['aria-label']) return undefined;
		const trigger = store.activeTriggerElement;
		return trigger ? trigger.id || undefined : store.resolvedActiveTriggerId() || undefined;
	});

	// Upstream returns focus nowhere when a hover menu closes because the pointer left, whatever
	// `finalFocus` says. The manager resolves `returnFocus` in an effect teardown, where Svelte
	// reads state as it was before the close. This flag is set during the close, so it is a plain
	// variable that `returnFocus` reads when the manager calls it.
	let leftByPointer = false;
	// Read at call time for the same reason: an outside press closed the menu.
	let closedByOutsidePress = false;
	// Tracks only `store.open`, so it runs once per opening.
	$effect.pre(() => {
		if (!store.open) return;
		leftByPointer = false;
		closedByOutsidePress = false;
	});

	$effect(() => {
		const stop = store.events.on('openchange', (data) => {
			const { open, reason, nativeEvent } = data as OpenChangePayload;
			if (!open) closedByOutsidePress = reason === REASONS.outsidePress;
			if (!open && reason === REASONS.triggerHover && nativeEvent?.type === 'mouseleave') {
				leftByPointer = true;
			}
		});
		return () => {
			stop();
		};
	});

	/** The manager's boolean `returnFocus` rule: return only while focus is still inside. */
	function focusInside(): boolean {
		const doc = ownerDocument(store.floatingElement);
		const active = activeElement(doc);
		return contains(store.floatingElement, active) || active === doc.body || active == null;
	}

	const returnFocusDefault = $derived(
		store.activeTriggerElement != null ||
			parentType === undefined ||
			parentType === 'context-menu' ||
			// `returnFocus` drops this case after an outside press.
			parentType === 'menubar'
	);

	const returnSpec = $derived(finalFocus === undefined ? returnFocusDefault : finalFocus);

	/**
	 * The internal return target of a submenu next to a filterable menu: the parent's input, or the
	 * element a filterable submenu returns to. It is not a consumer target, so focus that already
	 * moved out stays.
	 */
	function dynamicReturnElement(): HTMLElement | null | undefined {
		if (finalFocus !== undefined || parentType !== 'menu') return undefined;
		if (store.submenu) return store.submenu.getReturnElement();
		if (handoff) return handoff.returnElement;
		return undefined;
	}

	function returnFocus(closeType: string | null): boolean | HTMLElement | null | void {
		if (leftByPointer) return false;
		const dynamic = dynamicReturnElement();
		if (dynamic) return focusInside() ? dynamic : false;
		// Upstream's default returns focus from a triggerless menubar menu unless an outside press
		// closed it.
		if (
			finalFocus === undefined &&
			parentType === 'menubar' &&
			store.activeTriggerElement == null &&
			closedByOutsidePress
		) {
			return false;
		}
		const spec = returnSpec;
		if (typeof spec === 'function') return spec(closeType ?? '');
		// The manager treats a function result as explicit, so `true` keeps its inside check here.
		// A `null` spec does not move focus.
		return spec === true ? focusInside() : (spec ?? false);
	}

	const initialFocus = $derived.by(() => {
		if (filterPopup) return filterPopup.initialFocus();
		const list = listElement;
		if (list && parentType !== 'menu') {
			// A keyboard or screen reader open highlights an item, which list navigation focuses.
			// Otherwise the list holds the `menu` role, so a pointer open focuses it.
			return () => (store.activeIndex !== null ? false : list);
		}
		return parentType !== 'menu';
	});

	function ownKeyDown(event: KeyboardEvent) {
		store.submenu?.onPopupKeyDown(event);
		stopInToolbar(event);
	}

	function relayFocusIn(event: FocusEvent) {
		handoff?.focusIn();
		const parent = store.parent;
		if (parent.type === 'menu') parent.store.relayFocusIn?.(event);
	}

	// A portaled submenu's keys and focus reach this popup's handlers as they would through
	// React's tree upstream.
	$effect(() => {
		const node = store.popupElement;
		if (!filterPopup && !store.submenu && !handoff) return;
		const relayKeyDown = (event: KeyboardEvent) => {
			const run = (handler: ((event: KeyboardEvent) => void) | undefined) => {
				if (!event.cancelBubble) handler?.(event);
			};
			run((nested) => store.listKeyDown?.(nested, true));
			run((nested) => filterPopup?.keyDown(nested));
			run(store.submenu?.onPopupKeyDown);
			run(store.interactions?.popupKeyDown);
		};
		const relayNestedFocusIn = (event: FocusEvent) => {
			if (node) filterPopup?.focusIn(event, node);
			relayFocusIn(event);
		};
		store.relayKeyDown = relayKeyDown;
		store.relayFocusIn = relayNestedFocusIn;
		return () => {
			if (store.relayKeyDown === relayKeyDown) store.relayKeyDown = undefined;
			if (store.relayFocusIn === relayNestedFocusIn) store.relayFocusIn = undefined;
		};
	});

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

	const roleProps = $derived.by(() => {
		if (listElement) return { role: 'presentation' as const };
		return {
			role: 'menu' as const,
			...(root.orientation === 'horizontal' ? { 'aria-orientation': 'horizontal' as const } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {})
		};
	});

	const hostProps = $derived.by(() => {
		const baseProps = mergeProps(
			store.popupProps,
			{
				id: store.floatingId,
				...roleProps,
				onkeydown: ownKeyDown,
				onfocusin: relayFocusIn,
				...getStateAttributesProps(popupState, popupTransitionStateMapping),
				[bindKey]: bindPopup,
				[styleKey]: ownStyle
			},
			filterPopup?.props
		);
		const baseKeyDown = baseProps.onkeydown as (event: KeyboardEvent) => void;
		return mergeProps(
			{
				...baseProps,
				// A key the consumer took from the input skips the menu's handlers here too.
				onkeydown(event: KeyboardEvent) {
					if (!isConsumerPrevented(event)) baseKeyDown(event);
				}
			},
			elementProps,
			// The input holds real focus. The popup is a dialog around it and the list.
			filterPopup ? { role: 'dialog' as const } : undefined,
			{ 'data-rootownerid': store.rootId }
		);
	});
</script>

<FloatingFocusManager
	{store}
	modal={parentType === 'context-menu'}
	disabled={!store.mounted}
	{initialFocus}
	returnFocus={returnSpec === false ? false : returnFocus}
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
