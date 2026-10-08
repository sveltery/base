<!--
	An overlay displayed beneath the popup. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/backdrop/DialogBackdrop.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { dialogTransitionAttributesMapping } from './attributes.js';
	import { useDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import type { DialogBackdropProps, DialogBackdropState, DialogDivProps } from './types.js';

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

	const hostProps = $derived(
		mergeProps(elementProps, {
			role: 'presentation',
			hidden: !store.mounted,
			style: 'user-select: none; -webkit-user-select: none',
			...getStateAttributesProps(state, dialogTransitionAttributesMapping),
			...(render ? { [attachmentKey]: ownBackdrop } : {})
		}) as DialogDivProps
	);
</script>

{#if enabled}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<div {...hostProps} {@attach ownBackdrop}>{@render children?.()}</div>
	{/if}
{/if}
