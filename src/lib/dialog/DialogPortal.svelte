<!--
	A portal element that moves the popup to a different part of the DOM.
	Renders through the shared FloatingPortal, which appends to `<body>` by default.
	Derived from Base UI v1.8.0 packages/react/src/dialog/portal/DialogPortal.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The internal backdrop is inert while the dialog is closed and still mounted.
-->
<script lang="ts">
	import { FloatingPortal } from '../internal/floating-ui/index.js';
	import { InternalBackdrop } from '../internal/popups/index.js';
	import { setDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import type { DialogPortalProps } from './types.js';

	let { keepMounted = false, container = undefined, children }: DialogPortalProps = $props();

	const store = useDialogRootContext();
	const shown = $derived(store.mounted || keepMounted);

	setDialogPortalContext({
		get keepMounted() {
			return keepMounted;
		}
	});

	function ownInternalBackdrop(node: HTMLElement) {
		store.internalBackdropElement = node;
		return () => {
			if (store.internalBackdropElement === node) store.internalBackdropElement = null;
		};
	}
</script>

{#if shown}
	<FloatingPortal {store} {container}>
		{#if store.mounted && store.modal === true}
			<InternalBackdrop inert={!store.open ? true : undefined} {@attach ownInternalBackdrop} />
		{/if}
		{@render children?.()}
	</FloatingPortal>
{/if}
