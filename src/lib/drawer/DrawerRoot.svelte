<!--
	Groups all parts of the drawer. Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/root/DrawerRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The dialog setup is `createDialogRoot`. DrawerRootState holds the swipe and snap point state.
-->
<script lang="ts" generics="Payload = unknown">
	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { createChangeEventDetails, ownerWindow, platform, REASONS } from '@sveltery/utils';
	import { createDialogRoot } from '../dialog/root.svelte.js';
	import { findDrawerProvider } from './context.svelte.js';
	import { DrawerRootState, findDrawerRootState, setDrawerRootState } from './root.svelte.js';
	import type { DrawerChangeEventDetails, DrawerRootProps } from './types.js';

	let {
		open = $bindable(),
		modal = true,
		onOpenChange,
		onOpenChangeComplete,
		disablePointerDismissal = false,
		handle,
		triggerId = $bindable(),
		swipeDirection = 'down',
		snapPoints,
		snapToSequentialPoints = false,
		snapPoint = $bindable(),
		defaultSnapPoint,
		onSnapPointChange,
		children
	}: DrawerRootProps<Payload> = $props();

	const parent = findDrawerRootState();
	const provider = findDrawerProvider();
	const uid = $props.id();

	function handleOpenChange(next: boolean, details: DrawerChangeEventDetails) {
		onOpenChange?.(next, details);
		if (details.isCanceled || next || !snapPoints?.length) return;
		drawer.setActiveSnapPoint(
			drawer.resolvedDefaultSnapPoint,
			createChangeEventDetails(details.reason, details.event, details.trigger)
		);
	}

	const store = createDialogRoot({
		role: 'dialog',
		drawer: true,
		floatingId: `base-ui-${uid}`,
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		onOpenChange: () => handleOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		readModal: () => modal,
		readDisablePointerDismissal: () => disablePointerDismissal,
		readTriggerId: () => triggerId,
		publishTriggerId: (id) => {
			if ((triggerId ?? null) !== id) triggerId = id;
		},
		readHandle: () => handle
	});

	const drawer = new DrawerRootState(store, parent, {
		readSwipeDirection: () => swipeDirection,
		readSnapPoints: () => snapPoints,
		readSnapPoint: () => snapPoint,
		writeSnapPoint: (next) => {
			snapPoint = next;
		},
		readDefaultSnapPoint: () => defaultSnapPoint,
		readSnapToSequentialPoints: () => snapToSequentialPoints,
		onSnapPointChange: () => onSnapPointChange
	});
	setDrawerRootState(drawer);

	if (provider) {
		$effect(() => {
			provider.setDrawerOpen(store, store.open);
		});
		$effect(() => () => provider.removeDrawer(store));
	}

	// CloseWatcher brings the Android back gesture (Chromium only). Desktop keeps Escape alone, so
	// the watcher does not change Escape and nesting there.
	$effect(() => {
		if (!store.open || store.nestedOpenDialogCount !== 0 || !platform.os.android) return;
		const win = ownerWindow(store.popupElement) as Window & {
			CloseWatcher?: new () => EventTarget & { destroy(): void };
		};
		const CloseWatcher = win.CloseWatcher;
		if (!CloseWatcher) return;

		const watcher = untrack(() => new CloseWatcher());
		// The browser destroys the watcher before `close`, so the request is handled from `cancel`,
		// where it can still be prevented.
		function handleCancel(event: Event) {
			if (!store.open) return;
			const details = createChangeEventDetails(REASONS.closeWatcher, event);
			// The browser lets one close request per user activation be prevented. Later requests
			// close the drawer regardless, like a native `<dialog>`.
			if (!event.cancelable) details.cancel = () => {};
			drawer.setOpen(false, details);
			// Keeps this watcher for the next close request.
			if (details.isCanceled) event.preventDefault();
		}
		const off = on(watcher, 'cancel', handleCancel);
		return () => {
			off();
			watcher.destroy();
		};
	});

	export function close() {
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.({ payload: store.payload as Payload | undefined })}
