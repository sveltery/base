<!--
	A menu item that works like a radio button in a given group. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/radio-item/MenuRadioItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails } from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { MENU_REASONS } from './constants.js';
	import { setMenuRadioItem, useMenuRadioGroup, useMenuRoot } from './context.svelte.js';
	import { MenuItemBehavior } from './item.svelte.js';
	import { itemMapping } from './item-mapping.js';
	import type { MenuChangeEventDetails, MenuRadioItemProps, MenuRadioItemState } from './types.js';

	let {
		value,
		id,
		label,
		nativeButton = false,
		disabled: disabledProp = false,
		closeOnClick = false,
		render,
		children,
		...elementProps
	}: MenuRadioItemProps = $props();

	const { store } = useMenuRoot();
	const group = useMenuRadioGroup();
	const uid = $props.id();
	const disabled = $derived(disabledProp || group.disabled || store.disabled);
	const checked = $derived(group.value === value);

	const item = new MenuItemBehavior(store, () => ({
		id: id ?? `base-ui-${uid}`,
		label,
		disabled,
		closeOnClick,
		nativeButton
	}));

	const state: MenuRadioItemState = $derived({
		disabled,
		highlighted: item.highlighted,
		checked
	});
	setMenuRadioItem({
		get checked() {
			return state.checked;
		},
		get disabled() {
			return state.disabled;
		},
		get highlighted() {
			return state.highlighted;
		}
	});

	function handleClick(event: MouseEvent) {
		const details = createChangeEventDetails(MENU_REASONS.itemPress, event, undefined, {
			preventUnmountOnClose() {}
		}) as MenuChangeEventDetails;
		group.setValue(value, details);
	}

	const hostProps = $derived(
		item.props(
			{
				role: 'menuitemradio',
				'aria-checked': checked,
				onclick: handleClick,
				...getStateAttributesProps(state, itemMapping)
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
