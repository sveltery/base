<!--
	A positioning container for the dialog popup. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/viewport/DialogViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { dialogStateAttributesMapping } from './attributes.js';
	import { useDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import type { DialogDivProps, DialogViewportProps, DialogViewportState } from './types.js';

	let { render, children, ...elementProps }: DialogViewportProps = $props();

	const store = useDialogRootContext();
	const portal = useDialogPortalContext();
	const attachmentKey = createAttachmentKey();
	const shown = $derived(portal.keepMounted || store.mounted);

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

	const hostProps = $derived(
		mergeProps(elementProps, {
			role: 'presentation',
			hidden: !store.mounted,
			style: store.open ? undefined : 'pointer-events: none',
			...getStateAttributesProps(state, dialogStateAttributesMapping),
			...(render ? { [attachmentKey]: ownViewport } : {})
		}) as DialogDivProps
	);
</script>

{#if shown && render}
	{@render render(hostProps, state, children)}
{:else if shown}
	<div {...hostProps} {@attach ownViewport}>{@render children?.()}</div>
{/if}
