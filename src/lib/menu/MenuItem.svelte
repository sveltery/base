<!--
	An individual interactive item in the menu. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/item/MenuItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useMenuRoot } from './context.svelte.js';
	import { MenuItemBehavior } from './item.svelte.js';
	import type { MenuItemProps, MenuItemState } from './types.js';

	let {
		id,
		label,
		nativeButton = false,
		disabled: disabledProp = false,
		closeOnClick = true,
		render,
		children,
		...elementProps
	}: MenuItemProps = $props();

	const { store } = useMenuRoot();
	const uid = $props.id();
	const disabled = $derived(disabledProp || store.disabled);

	const item = new MenuItemBehavior(store, () => ({
		id: id ?? `base-ui-${uid}`,
		label,
		disabled,
		closeOnClick,
		nativeButton
	}));

	const state: MenuItemState = $derived({ disabled, highlighted: item.highlighted });
	const hostProps = $derived(item.props(getStateAttributesProps(state), elementProps));
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
