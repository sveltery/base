<script lang="ts" module>
	let swipePropertiesRegistered = false;

	// Unregistered custom properties inherit, so every frame of a swipe restyles the whole subtree.
	// Drawer descendants do not read these variables, so WebKit's lack of `inherit` opt-in is fine.
	function registerSwipeProperties() {
		if (swipePropertiesRegistered) return;
		swipePropertiesRegistered = true;
		if (typeof CSS === 'undefined' || !('registerProperty' in CSS)) return;
		const properties = [
			{ name: '--drawer-swipe-movement-x', syntax: '<length>', initialValue: '0px' },
			{ name: '--drawer-swipe-movement-y', syntax: '<length>', initialValue: '0px' },
			{ name: '--drawer-snap-point-offset', syntax: '<length>', initialValue: '0px' },
			{ name: '--drawer-swipe-progress', syntax: '<number>', initialValue: '0' },
			{ name: '--drawer-swipe-strength', syntax: '<number>', initialValue: '1' }
		];
		for (const property of properties) {
			try {
				CSS.registerProperty({ ...property, inherits: false });
			} catch {
				// Already registered.
			}
		}
	}
</script>

<!--
	A container for the drawer contents. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/popup/DrawerPopup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The drawer CSS variables are written per property, so a swipe's own writes survive re-renders.
	Focus moves to the popup itself unless `initialFocus` says otherwise.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { error, type OpenInteractionType } from '@sveltery/utils';
	import { FloatingFocusManager } from '@sveltery/floating-ui-svelte';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { COMPOSITE_KEYS } from '../internal/composite-keys.js';
	import { useDialogPortalContext } from '../dialog/context.svelte.js';
	import {
		applyStyleProperties,
		DrawerBackdropCssVars,
		DrawerPopupCssVars,
		drawerPopupStateAttributesMapping
	} from './attributes.js';
	import { findDrawerViewport } from './context.svelte.js';
	import { useDrawerRootState } from './root.svelte.js';
	import { getSnapPointSwipeMovement } from './snap-points.js';
	import type { DrawerDivProps, DrawerPopupProps, DrawerPopupState } from './types.js';

	let {
		initialFocus = undefined,
		finalFocus = undefined,
		render,
		children,
		...elementProps
	}: DrawerPopupProps = $props();

	const drawer = useDrawerRootState();
	const store = drawer.store;
	const viewport = findDrawerViewport();
	useDialogPortalContext();
	const attachmentKey = createAttachmentKey();

	if (!viewport) {
		error(
			'<Drawer.Popup> expected to be rendered within <Drawer.Viewport>. Omitting the viewport',
			'disables drawer swipe handling and touch scroll locking. Wrap <Drawer.Popup> in',
			'<Drawer.Viewport>.'
		);
	}

	const nestedDrawerOpen = $derived(store.nestedOpenDrawerCount > 0);
	const swiping = $derived(viewport?.swiping ?? false);

	const state: DrawerPopupState = $derived({
		open: store.open,
		nested: store.nested,
		transitionStatus: store.transitionStatus,
		expanded: drawer.activeSnapPoint === 1,
		nestedDrawerOpen,
		nestedDrawerSwiping: drawer.nestedSwiping,
		swipeDirection: drawer.swipeDirection,
		swiping
	});

	function ownPopup(node: HTMLElement) {
		store.popupElement = node;
		store.floatingElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
			if (store.floatingElement === node) store.floatingElement = null;
		};
	}

	let measuredHeight = 0;

	function measureHeight() {
		const node = store.popupElement;
		if (!node) return;
		const offsetHeight = node.offsetHeight;
		// Skip only while the element is still stretched past its last measured height.
		if (
			measuredHeight > 0 &&
			drawer.frontmostHeight > measuredHeight &&
			offsetHeight > measuredHeight
		) {
			return;
		}
		if (measuredHeight > 0 && drawer.hasNestedDrawer) {
			drawer.onPopupHeightChange(measuredHeight);
			return;
		}
		if (offsetHeight === measuredHeight) return;
		measuredHeight = offsetHeight;
		drawer.onPopupHeightChange(offsetHeight);
	}

	$effect(() => {
		const node = store.popupElement;
		void nestedDrawerOpen;
		if (!store.mounted) {
			measuredHeight = 0;
			untrack(() => drawer.onPopupHeightChange(0));
			return;
		}
		if (!node) return;
		registerSwipeProperties();
		untrack(measureHeight);
		if (typeof ResizeObserver !== 'function') return;
		const observer = new ResizeObserver(measureHeight);
		observer.observe(node);
		return () => observer.disconnect();
	});

	$effect(() => {
		const node = store.popupElement;
		if (!node) return;
		void elementProps.style;
		const progress = drawer.nestedSwipeProgress;
		node.style.setProperty(DrawerBackdropCssVars.swipeProgress, progress > 0 ? `${progress}` : '0');
		return () => node.style.setProperty(DrawerBackdropCssVars.swipeProgress, '0');
	});

	$effect(() => {
		if (!store.open || !drawer.parent) return;
		const parent = drawer.parent;
		parent.onNestedFrontmostHeightChange(drawer.frontmostHeight);
		return () => parent.onNestedFrontmostHeightChange(0);
	});

	$effect(() => {
		const parent = drawer.parent;
		if (!parent) return;
		parent.onNestedDrawerPresenceChange(store.open || store.transitionStatus === 'ending');
		return () => parent.onNestedDrawerPresenceChange(false);
	});

	useOpenChangeComplete(() => ({
		enabled: store.mounted && store.open,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpenChangeComplete(true);
		}
	}));

	const popupStyles = $derived.by(() => {
		const direction = drawer.swipeDirection;
		const vertical = direction === 'down' || direction === 'up';
		const snapOffset = drawer.activeSnapPointOffset;
		const applySnapPoints = drawer.hasSnapPoints && vertical;

		let dragStyles = viewport?.getDragStyles() ?? {};
		if (applySnapPoints && direction === 'down') {
			const movement = Number.parseFloat(String(dragStyles[DrawerPopupCssVars.swipeMovementY]));
			dragStyles = { ...dragStyles, transform: undefined };
			if (swiping && Number.isFinite(movement)) {
				dragStyles[DrawerPopupCssVars.swipeMovementY] =
					`${getSnapPointSwipeMovement(snapOffset ?? 0, movement)}px`;
			}
		}

		let snapPointOffset = 0;
		if (applySnapPoints && snapOffset !== null) {
			snapPointOffset = direction === 'up' ? -snapOffset : snapOffset;
		}
		const autoHeight = !drawer.hasNestedDrawer && store.transitionStatus !== 'ending';
		const strength = viewport?.swipeStrength;

		return {
			...dragStyles,
			[DrawerPopupCssVars.nestedDrawers]: String(store.nestedOpenDrawerCount),
			[DrawerPopupCssVars.height]:
				drawer.popupHeight && !autoHeight ? `${drawer.popupHeight}px` : undefined,
			[DrawerPopupCssVars.snapPointOffset]: `${snapPointOffset}px`,
			[DrawerPopupCssVars.frontmostHeight]: drawer.frontmostHeight
				? `${drawer.frontmostHeight}px`
				: undefined,
			[DrawerPopupCssVars.swipeStrength]:
				typeof strength === 'number' && Number.isFinite(strength) && strength > 0
					? `${strength}`
					: '1'
		};
	});

	const movementVars: string[] = [
		DrawerPopupCssVars.swipeMovementX,
		DrawerPopupCssVars.swipeMovementY
	];
	let writtenStyles: ReadonlySet<string> = new Set();
	$effect(() => {
		const node = store.popupElement;
		if (!node) return;
		const consumerStyle = elementProps.style;
		let styles: Record<string, string | undefined> = popupStyles;
		let previous = untrack(() => writtenStyles);
		// Drawer.SwipeArea owns the movement variables while its gesture opens the drawer.
		if (drawer.swipeAreaActive) {
			styles = Object.fromEntries(
				Object.entries(styles).filter(([name]) => !movementVars.includes(name))
			);
			previous = new Set([...previous].filter((name) => !movementVars.includes(name)));
		}
		writtenStyles = applyStyleProperties(node, styles, previous, consumerStyle);
	});

	function resolveInitial(openType: OpenInteractionType): boolean | HTMLElement | null | void {
		const value = initialFocus;
		if (value === undefined) return store.popupElement ?? true;
		if (value === false) return false;
		if (value instanceof HTMLElement) return value;
		if (typeof value === 'function') return value(openType);
		return true;
	}

	function resolveFinal(
		closeType: OpenInteractionType | null
	): boolean | HTMLElement | null | void {
		const value = finalFocus;
		if (value === false) return false;
		if (value instanceof HTMLElement) return value;
		if (typeof value === 'function') {
			const result = value(closeType ?? '');
			if (result === false || result === undefined) return false;
			if (result instanceof HTMLElement) return result;
			// `null` and `true` fall back to the trigger.
			return null;
		}
		return null;
	}

	function onKeyDown(event: KeyboardEvent) {
		if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
	}

	const hostProps = $derived(
		mergeProps(
			{
				id: store.floatingId,
				role: store.role,
				...(store.titleElementId ? { 'aria-labelledby': store.titleElementId } : {}),
				...(store.descriptionElementId ? { 'aria-describedby': store.descriptionElementId } : {}),
				hidden: !store.mounted,
				style: `${DrawerBackdropCssVars.swipeProgress}: 0`,
				onkeydown: onKeyDown,
				...getStateAttributesProps(state, drawerPopupStateAttributesMapping),
				...(render ? { [attachmentKey]: ownPopup } : {})
			},
			FOCUSABLE_POPUP_PROPS,
			elementProps
		) as DrawerDivProps
	);
</script>

<FloatingFocusManager
	{store}
	disabled={!store.mounted}
	initialFocus={resolveInitial}
	returnFocus={finalFocus === undefined ? true : finalFocus === null ? null : resolveFinal}
	modal={store.modal !== false}
	closeOnFocusOut={!store.disablePointerDismissal}
	restoreFocus="popup"
>
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<div {...hostProps} {@attach ownPopup}>{@render children?.()}</div>
	{/if}
</FloatingFocusManager>
