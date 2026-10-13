<!--
	A menu item that toggles a setting on or off. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/checkbox-item/MenuCheckboxItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails } from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { MENU_REASONS } from './constants.js';
	import { setMenuCheckboxItem, useMenuRoot } from './context.svelte.js';
	import { MenuItemBehavior } from './item.svelte.js';
	import { itemMapping } from './item-mapping.js';
	import type {
		MenuChangeEventDetails,
		MenuCheckboxItemProps,
		MenuCheckboxItemState
	} from './types.js';

	let {
		checked = $bindable(false),
		onCheckedChange,
		id,
		label,
		nativeButton = false,
		disabled: disabledProp = false,
		closeOnClick = false,
		render,
		children,
		...elementProps
	}: MenuCheckboxItemProps = $props();

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

	const state: MenuCheckboxItemState = $derived({
		disabled,
		highlighted: item.highlighted,
		checked
	});
	setMenuCheckboxItem({
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
		const next = !checked;
		onCheckedChange?.(next, details);
		if (!details.isCanceled) checked = next;
	}

	const hostProps = $derived(
		item.props(
			{
				role: 'menuitemcheckbox',
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
