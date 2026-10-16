<!--
	A link in the navigation menu that can be used to navigate to a different page or section.
	Renders an `<a>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/link/NavigationMenuLink.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { useFloatingTree } from '@sveltery/floating-ui-svelte';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { compositeItem } from './composite-item.svelte.js';
	import { useNavigationMenuComposite, useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuLinkProps, NavigationMenuLinkState } from './types.js';
	import { isOutsideMenuEvent } from './utils.js';

	let {
		active = false,
		closeOnClick = false,
		render,
		children,
		...elementProps
	}: NavigationMenuLinkProps = $props();

	const root = useNavigationMenuRoot();
	const tree = useFloatingTree();
	const item = compositeItem(useNavigationMenuComposite());
	const itemKey = createAttachmentKey();

	function handleClick(event: MouseEvent) {
		if (closeOnClick) root.setValue(null, createChangeEventDetails(REASONS.linkPress, event));
	}

	function handleBlur(event: FocusEvent) {
		const { popupElement, positionerElement, rootElement, nodeId } = root;
		if (
			positionerElement &&
			popupElement &&
			isOutsideMenuEvent(
				{ currentTarget: event.currentTarget, relatedTarget: event.relatedTarget },
				{ popupElement, rootElement, tree, nodeId }
			)
		) {
			root.setValue(null, createChangeEventDetails(REASONS.focusOut, event));
		}
	}

	const state: NavigationMenuLinkState = $derived({ active });
	const hostProps = $derived(
		mergeProps(
			{
				onfocus: item.onfocus,
				[itemKey]: item.attach,
				'aria-current': active ? ('page' as const) : undefined,
				onclick: handleClick,
				onblur: handleBlur,
				...getStateAttributesProps(state)
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<a {...hostProps}>{@render children?.()}</a>
{/if}
