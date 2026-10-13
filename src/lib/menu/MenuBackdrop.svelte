<!--
	An overlay displayed beneath the menu popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/backdrop/MenuBackdrop.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { REASONS } from '@sveltery/utils';
	import { useMenuRoot } from './context.svelte.js';
	import { findContextMenuParent } from './parent.svelte.js';
	import type { MenuBackdropProps, MenuBackdropState } from './types.js';

	let { render, children, ...elementProps }: MenuBackdropProps = $props();

	const { store } = useMenuRoot();
	const contextMenu = findContextMenuParent();
	const publishKey = createAttachmentKey();

	function publish(node: HTMLElement) {
		if (!contextMenu) return;
		contextMenu.backdropElement = node;
		return () => {
			if (contextMenu.backdropElement === node) contextMenu.backdropElement = null;
		};
	}

	const state: MenuBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: `user-select: none; -webkit-user-select: none${
					store.openChangeReason === REASONS.triggerHover ? '; pointer-events: none' : ''
				}`,
				...getStateAttributesProps(state, popupTransitionStateMapping),
				[publishKey]: publish
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
