<!--
	An overlay displayed beneath the popup. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/backdrop/DialogBackdrop.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { dialogTransitionAttributesMapping } from './attributes.js';
	import { useDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import { dialogOutsidePressEvent, dialogOwnedOutsidePress } from './outside-press.js';
	import type { DialogBackdropProps, DialogBackdropState } from './types.js';

	let { forceRender = false, render, children, ...elementProps }: DialogBackdropProps = $props();

	const store = useDialogRootContext();
	useDialogPortalContext();
	const attachmentKey = createAttachmentKey();
	const enabled = $derived(forceRender || !store.nested);

	const state: DialogBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	function ownBackdrop(node: HTMLElement) {
		store.backdropElement = node;
		return () => {
			if (store.backdropElement === node) store.backdropElement = null;
		};
	}

	function press(event: Event, mode: 'click' | 'pointerdown') {
		const expected = dialogOutsidePressEvent(store);
		if (mode === 'click' && expected !== 'intentional') return;
		if (mode === 'pointerdown' && expected !== 'sloppy') return;
		if (!dialogOwnedOutsidePress(store, event)) return;
		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
	}

	const hostProps = $derived(
		mergeProps(elementProps, {
			role: 'presentation',
			hidden: !store.mounted,
			style: 'user-select: none; -webkit-user-select: none',
			onclick: (event: MouseEvent) => press(event, 'click'),
			onpointerdown: (event: PointerEvent) => press(event, 'pointerdown'),
			...getStateAttributesProps(state, dialogTransitionAttributesMapping),
			...(render ? { [attachmentKey]: ownBackdrop } : {})
		})
	);
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if enabled}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<div {...hostProps} {@attach ownBackdrop}>{@render content()}</div>
	{/if}
{/if}
