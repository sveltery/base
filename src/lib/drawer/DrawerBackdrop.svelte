<!--
	An overlay displayed beneath the popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/backdrop/DrawerBackdrop.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The viewport and swipe area write its swipe variables and `data-swiping` directly.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { dialogTransitionAttributesMapping } from '../dialog/attributes.js';
	import { useDrawerRootState } from './root.svelte.js';
	import { DrawerBackdropCssVars, DrawerPopupCssVars } from './attributes.js';
	import type { DrawerBackdropProps, DrawerBackdropState, DrawerDivProps } from './types.js';

	let { forceRender = false, render, children, ...elementProps }: DrawerBackdropProps = $props();

	const store = useDrawerRootState().store;
	const attachmentKey = createAttachmentKey();
	const enabled = $derived(forceRender || !store.nested);

	const state: DrawerBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	function ownBackdrop(node: HTMLElement) {
		store.backdropElement = node;
		return () => {
			if (store.backdropElement === node) store.backdropElement = null;
		};
	}

	// The base declarations are static so a swipe's property writes survive re-renders. Closing
	// adds `pointer-events: none` as its own property for the same reason.
	function syncPointerEvents(node: HTMLElement) {
		$effect(() => {
			void elementProps.style;
			if (store.open) node.style.removeProperty('pointer-events');
			else node.style.setProperty('pointer-events', 'none');
		});
	}

	function attachRendered(node: HTMLElement) {
		syncPointerEvents(node);
		return ownBackdrop(node);
	}

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation',
				hidden: !store.mounted,
				style: `user-select: none; -webkit-user-select: none; ${DrawerBackdropCssVars.swipeProgress}: 0; ${DrawerPopupCssVars.swipeStrength}: 1`,
				...getStateAttributesProps(state, dialogTransitionAttributesMapping),
				...(render ? { [attachmentKey]: attachRendered } : {})
			},
			elementProps
		) as DrawerDivProps
	);
</script>

{#if enabled}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<div {...hostProps} {@attach ownBackdrop} {@attach syncPointerEvents}>
			{@render children?.()}
		</div>
	{/if}
{/if}
