<!--
	Positions the menu popup against the trigger. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/positioner/MenuPositioner.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The item registry is the store's `ElementList`, so there is no CompositeList here.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { REASONS, ScopedTimeout, createChangeEventDetails } from '@sveltery/utils';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import InternalBackdrop from '../internal/InternalBackdrop.svelte';
	import {
		popupStateMapping,
		AnchorPositioning,
		useAnchoredPopupScrollLock
	} from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from './constants.js';
	import { setMenuPositioner, useMenuPortal, useMenuRoot } from './context.svelte.js';
	import { findContextMenuParent } from './parent.svelte.js';
	import type { MenuChangeReason, MenuPositionerProps, MenuPositionerState } from './types.js';

	let {
		anchor = undefined,
		positionMethod = 'absolute',
		side = undefined,
		align = undefined,
		sideOffset = undefined,
		alignOffset = undefined,
		collisionBoundary = 'clipping-ancestors',
		collisionPadding = 5,
		arrowPadding = 5,
		sticky = false,
		disableAnchorTracking = false,
		collisionAvoidance = undefined,
		render,
		children,
		...elementProps
	}: MenuPositionerProps = $props();

	interface MenuOpenEventDetails {
		open: boolean;
		reason: MenuChangeReason | null;
		nodeId: string | null;
		parentNodeId: string | null;
	}

	const { store } = useMenuRoot();
	useMenuPortal();
	const contextMenu = findContextMenuParent();
	const attachKey = createAttachmentKey();

	const layout = $derived.by(() => {
		const parent = store.parent;
		let resolvedAnchor = anchor;
		let resolvedSide = side;
		let resolvedAlign = align;
		let resolvedSideOffset = sideOffset ?? 0;
		let resolvedAlignOffset = alignOffset ?? 0;
		let resolvedCollision = collisionAvoidance ?? DROPDOWN_COLLISION_AVOIDANCE;
		if (parent.type === 'context-menu') {
			resolvedAnchor = anchor ?? parent.context.anchor;
			resolvedAlign = align ?? 'start';
			if (!side && resolvedAlign !== 'center') {
				resolvedAlignOffset = alignOffset ?? 2;
				resolvedSideOffset = sideOffset ?? -5;
			}
		}
		if (parent.type === 'menu') {
			resolvedSide = resolvedSide ?? 'inline-end';
			resolvedAlign = resolvedAlign ?? 'start';
			resolvedCollision = collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE;
		} else if (parent.type === 'menubar') {
			resolvedSide =
				resolvedSide ?? (parent.context.orientation === 'vertical' ? 'inline-end' : 'bottom');
			resolvedAlign = resolvedAlign ?? 'start';
		}
		return {
			anchor: resolvedAnchor,
			side: resolvedSide,
			align: resolvedAlign,
			sideOffset: resolvedSideOffset,
			alignOffset: resolvedAlignOffset,
			collisionAvoidance: resolvedCollision,
			contextMenu: parent.type === 'context-menu'
		};
	});

	const positioning = new AnchorPositioning(store, () => {
		const current = layout;
		const collision = current.collisionAvoidance;
		return {
			anchor: current.anchor,
			positionMethod: contextMenu ? 'fixed' : positionMethod,
			side: current.side,
			align: current.align,
			sideOffset: current.sideOffset,
			alignOffset: current.alignOffset,
			collisionBoundary,
			collisionPadding,
			arrowPadding: current.contextMenu ? 0 : arrowPadding,
			sticky,
			disableAnchorTracking,
			collisionAvoidance: collision,
			mounted: store.mounted,
			adaptiveOrigin: store.adaptiveOrigin,
			// Filtering resizes the popup, which must not flip it on every keystroke.
			lazyFlip: store.virtualFocus ? 'placement' : false,
			shift: current.contextMenu
				? {
						crossAxis: !('side' in collision && collision.side === 'flip'),
						rootBoundary: 'layoutViewport'
					}
				: undefined
		};
	});
	setMenuPositioner(positioning);

	store.positioning = positioning;
	$effect(() => () => {
		if (store.positioning === positioning) store.positioning = null;
	});

	// A child menu that opens disables this menu's hover close. A sibling that opens closes this one.
	$effect(() => {
		const events = store.tree?.events;
		if (!events) return;
		return events.on('menuopenchange', (data) => {
			const details = data as MenuOpenEventDetails;
			if (!details.open) return;
			if (details.parentNodeId === store.nodeId) store.hoverEnabled = false;
			if (details.nodeId !== store.nodeId && details.parentNodeId === store.parentNodeId) {
				store.setOpen(false, createChangeEventDetails(REASONS.siblingOpen));
			}
		});
	});

	// A submenu closes with its parent.
	$effect(() => {
		const events = store.tree?.events;
		if (!events || store.parentNodeId == null) return;
		return events.on('menuopenchange', (data) => {
			const details = data as MenuOpenEventDetails;
			if (details.open || details.nodeId !== store.parentNodeId) return;
			store.setOpen(false, createChangeEventDetails(details.reason ?? REASONS.siblingOpen));
		});
	});

	const closeTimeout = new ScopedTimeout();
	$effect(() => {
		if (!store.open) closeTimeout.clear();
	});

	// Hovering another item of the parent menu closes this submenu.
	$effect(() => {
		const events = store.tree?.events;
		if (!events) return;
		const open = store.open;
		const trigger = store.domReferenceElement;
		return events.on('itemhover', (data) => {
			const event = data as { nodeId: string | null; target: Element | null };
			if (!open || event.nodeId !== store.parentNodeId) return;
			if (event.target && trigger && trigger !== event.target) {
				const delay = store.closeDelay;
				if (delay > 0) {
					if (!closeTimeout.isStarted()) {
						closeTimeout.start(delay, () => {
							store.setOpen(false, createChangeEventDetails(REASONS.siblingOpen));
						});
					}
				} else {
					store.setOpen(false, createChangeEventDetails(REASONS.siblingOpen));
				}
			} else {
				// The submenu trigger is hovered again.
				closeTimeout.clear();
			}
		});
	});

	// Before the DOM update, so listeners such as a menubar see the change before a closing
	// popup's focus manager returns focus. Upstream emits from a layout effect and returns focus
	// a microtask later.
	$effect.pre(() => {
		const events = store.tree?.events;
		const details: MenuOpenEventDetails = {
			open: store.open,
			nodeId: store.nodeId,
			parentNodeId: store.parentNodeId,
			reason: untrack(() => store.openChangeReason)
		};
		events?.emit('menuopenchange', details);
	});

	const state: MenuPositionerState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		nested: store.parent.type === 'menu',
		instant: store.instantType
	});

	const menubarModal = $derived(
		store.parent.type === 'menubar' ? store.parent.context.modal : false
	);
	const popupModal = $derived(store.modal && store.openChangeReason !== REASONS.triggerHover);

	useAnchoredPopupScrollLock(() => ({
		enabled: store.open && (menubarModal || popupModal),
		touchOpen: store.openMethod === 'touch',
		positionerElement: store.positionerElement,
		referenceElement: store.domReferenceElement
	}));

	const showBackdrop = $derived(
		store.mounted &&
			store.parent.type !== 'menu' &&
			((store.parent.type !== 'menubar' && popupModal) || menubarModal)
	);
	// The cutout keeps the trigger, or the menubar, interactive above the backdrop.
	const cutout = $derived.by(() => {
		const parent = store.parent;
		if (parent.type === 'menubar') return parent.context.contentElement;
		if (parent.type === undefined) return store.domReferenceElement;
		return null;
	});

	function publishInternalBackdrop(node: HTMLElement) {
		const parent = store.parent;
		if (parent.type !== 'context-menu' && parent.type !== 'nested-context-menu') return;
		const context = parent.context;
		context.internalBackdropElement = node;
		return () => {
			if (context.internalBackdropElement === node) context.internalBackdropElement = null;
		};
	}

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: toCssStyle({
					...positioning.positionerStyles,
					...store.positionerVars,
					...(store.open ? {} : { pointerEvents: 'none' }),
					...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(state, popupStateMapping),
				[attachKey]: positioning.positionerProps.attach
			},
			elementProps
		)
	);
</script>

{#if showBackdrop}
	<InternalBackdrop inert={!store.open} {cutout} {@attach publishInternalBackdrop} />
{/if}
{#if render}{@render render(hostProps, state, children)}{:else}<div {...hostProps}>
		{@render children?.()}
	</div>{/if}
