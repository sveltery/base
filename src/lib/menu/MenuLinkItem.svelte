<!--
	A link in the menu that can be used to navigate to a different page or section.
	Renders an `<a>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/link-item/MenuLinkItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useMenuRoot } from './context.svelte.js';
	import { MenuItemBehavior } from './item.svelte.js';
	import type { MenuLinkItemProps, MenuLinkItemState } from './types.js';

	let {
		id,
		label,
		closeOnClick = false,
		render,
		children,
		...elementProps
	}: MenuLinkItemProps = $props();

	const { store } = useMenuRoot();
	const uid = $props.id();

	const item = new MenuItemBehavior(store, () => ({
		id: id ?? `base-ui-${uid}`,
		label,
		disabled: false,
		closeOnClick,
		nativeButton: false
	}));

	const state: MenuLinkItemState = $derived({ highlighted: item.highlighted });
	const hostProps = $derived(
		item.props(getStateAttributesProps(state), elementProps) as HTMLAnchorAttributes
	);
</script>

{#if item.visible}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<a {...hostProps}>{@render children?.()}</a>
	{/if}
{/if}
