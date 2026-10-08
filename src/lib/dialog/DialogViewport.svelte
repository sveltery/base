<!--
	A positioning container for the dialog popup. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/viewport/DialogViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { dialogStateAttributesMapping } from './attributes.js';
	import { useDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import { dialogOutsidePressEvent, dialogOwnedOutsidePress } from './outside-press.js';
	import type { DialogViewportProps, DialogViewportState } from './types.js';

	let { render, children, ...elementProps }: DialogViewportProps = $props();

	const store = useDialogRootContext();
	const portal = useDialogPortalContext();
	const attachmentKey = createAttachmentKey();
	const shouldRender = $derived(portal.keepMounted || store.mounted);

	const state: DialogViewportState = $derived({
		open: store.open,
		nested: store.nested,
		transitionStatus: store.transitionStatus,
		nestedDialogOpen: store.nestedDialogOpen
	});

	function ownViewport(node: HTMLElement) {
		store.viewportElement = node;
		return () => {
			if (store.viewportElement === node) store.viewportElement = null;
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
			style: store.open ? undefined : 'pointer-events: none',
			onclick: (event: MouseEvent) => press(event, 'click'),
			onpointerdown: (event: PointerEvent) => press(event, 'pointerdown'),
			...getStateAttributesProps(state, dialogStateAttributesMapping),
			...(render ? { [attachmentKey]: ownViewport } : {})
		})
	);
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<div {...hostProps} {@attach ownViewport}>{@render content()}</div>
	{/if}
{/if}
