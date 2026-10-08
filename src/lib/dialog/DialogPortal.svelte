<!--
	A portal element that moves the popup to a different part of the DOM.
	Renders through the shared FloatingPortal, which appends to `<body>` by default.
	Derived from Base UI v1.8.0 packages/react/src/dialog/portal/DialogPortal.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { on } from 'svelte/events';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { FloatingPortal } from '../internal/floating-ui/index.js';
	import { InternalBackdrop } from '../internal/popups/index.js';
	import { setDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import { dialogOutsidePressEvent, dialogOwnedOutsidePress } from './outside-press.js';
	import type { DialogPortalProps } from './types.js';

	let { keepMounted = false, container = undefined, children }: DialogPortalProps = $props();

	const store = useDialogRootContext();
	const shouldRender = $derived(store.mounted || keepMounted);
	let backdropHost = $state<HTMLDivElement | null>(null);

	setDialogPortalContext({
		get keepMounted() {
			return keepMounted;
		}
	});

	function closeFromBackdrop(event: Event, mode: 'click' | 'pointerdown') {
		const expected = dialogOutsidePressEvent(store);
		if (mode === 'click' && expected !== 'intentional') return;
		if (mode === 'pointerdown' && expected !== 'sloppy') return;
		if (!dialogOwnedOutsidePress(store, event)) return;
		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
	}

	$effect(() => {
		const host = backdropHost;
		const backdrop = host?.firstElementChild instanceof HTMLElement ? host.firstElementChild : null;
		store.internalBackdropElement = backdrop;
		if (!backdrop) return;
		const stopClick = on(backdrop, 'click', (event) => closeFromBackdrop(event, 'click'));
		const stopPointer = on(backdrop, 'pointerdown', (event) =>
			closeFromBackdrop(event, 'pointerdown')
		);
		return () => {
			stopClick();
			stopPointer();
			if (store.internalBackdropElement === backdrop) store.internalBackdropElement = null;
		};
	});
</script>

{#if shouldRender}
	<FloatingPortal {store} {container}>
		{#if store.mounted && store.modal === true}
			<div bind:this={backdropHost} style="display: contents">
				<InternalBackdrop />
			</div>
		{/if}
		{@render children?.()}
	</FloatingPortal>
{/if}
