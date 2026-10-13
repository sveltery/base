<!--
	An option in the select popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/item/SelectItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createChangeEventDetails } from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { removeItem } from '../internal/listbox/itemEquality.js';
	import { isVirtualClick } from '../internal/listbox/virtualClick.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { ITEM_PRESS } from './constants.js';
	import { setSelectItem, useSelectRoot } from './context.svelte.js';
	import type { SelectItemProps, SelectItemState } from './types.js';

	let {
		value: itemValue = null,
		label,
		disabled: disabledProp = false,
		nativeButton = false,
		render,
		children,
		...elementProps
	}: SelectItemProps = $props();

	const store = useSelectRoot();
	const bindKey = createAttachmentKey();

	let element = $state<HTMLElement | null>(null);
	let text = $state<HTMLElement | null>(null);

	const disabled = $derived(store.root.disabled || disabledProp);
	const index = $derived(store.items.indexOf(element));
	const highlighted = $derived(index !== -1 && store.activeIndex === index);
	const selected = $derived(store.isSelected(itemValue));
	const selectedByFocus = $derived(index !== -1 && store.selectedIndex === index);

	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled: true,
		composite: true
	}));

	let pointerType = 'mouse';
	let allowMouseSelection = false;

	function bindItem(node: HTMLElement) {
		element = node;
		const unregister = store.items.register(node, () => ({
			value: itemValue,
			label: label ?? null,
			disabled,
			text
		}));
		return () => {
			unregister();
			if (element === node) element = null;
		};
	}

	setSelectItem({
		get selected() {
			return selected;
		},
		get index() {
			return index;
		},
		get selectedByFocus() {
			return selectedByFocus;
		},
		setText(node) {
			text = node;
		}
	});

	function commitSelection(event: Event) {
		// A popup held open by `bind:open` still receives activations on a disabled or
		// read-only select.
		const { disabled: rootDisabled, readOnly, multiple, value, isItemEqualToValue } = store.root;
		if (rootDisabled || readOnly) return;

		if (multiple) {
			const current = Array.isArray(value) ? value : [];
			const next = selected
				? removeItem(current, itemValue, isItemEqualToValue)
				: [...current, itemValue];
			store.setValue(next, createChangeEventDetails(ITEM_PRESS, event));
		} else {
			store.setValue(itemValue, createChangeEventDetails(ITEM_PRESS, event));
			store.setOpen(false, createChangeEventDetails(ITEM_PRESS, event));
		}
	}

	function resetDragMovement() {
		store.selection.dragY = 0;
	}

	const partState: SelectItemState = $derived({ disabled, selected, highlighted });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		button.props(
			mergeProps(
				store.itemProps,
				{
					role: 'option' as const,
					'aria-selected': selected,
					tabindex: store.open && highlighted ? 0 : -1,
					onkeydown(event: KeyboardEvent) {
						store.activeIndex = index;
						// A prevented Space does not activate the item, so typeahead can type spaces.
						if (event.key === ' ' && store.typing) event.preventDefault();
					},
					onclick(event: MouseEvent) {
						const isMouseClick = pointerType !== 'touch';
						const clickPointerType = (event as PointerEvent).pointerType;
						// A no-pointer `detail === 0` click stays tied to the highlight. A virtual click
						// with pointer data, even an empty string from assistive technology, can
						// activate any item.
						const isVirtualMouseClick =
							isMouseClick &&
							isVirtualClick(event) &&
							(clickPointerType !== undefined || highlighted);
						// Opening with `alignItemWithTrigger` can place an item under the cursor. A real
						// mouse click must start on the item.
						const isInvalidMouseClick =
							isMouseClick && !isVirtualMouseClick && !allowMouseSelection;
						allowMouseSelection = false;
						if (disabled || isInvalidMouseClick) return;
						commitSelection(event);
					},
					onpointerenter(event: PointerEvent) {
						pointerType = event.pointerType;
					},
					onpointermove(event: PointerEvent) {
						if (event.pointerType === 'mouse' && event.buttons === 1) {
							const selection = store.selection;
							selection.dragY += event.movementY;
							if (selection.dragY ** 2 >= 64) selection.allowUnselectedMouseUp = true;
						}
					},
					onpointerdown(event: PointerEvent) {
						pointerType = event.pointerType;
						allowMouseSelection = true;
						resetDragMovement();
					},
					onmouseup() {
						resetDragMovement();
						if (disabled || pointerType === 'touch') return;
						// The click event commits a regular click.
						if (allowMouseSelection) return;
						const { allowSelectedMouseUp, allowUnselectedMouseUp } = store.selection;
						if ((!allowSelectedMouseUp && selected) || (!allowUnselectedMouseUp && !selected)) {
							return;
						}
						allowMouseSelection = true;
						element?.click();
						allowMouseSelection = false;
					},
					...getStateAttributesProps(partState),
					[bindKey]: bindItem
				},
				elementProps
			)
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
