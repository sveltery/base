<!--
	An individual item in the list.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/item/ComboboxItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { flushSync, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import {
		compareItemEquality,
		findItemIndex,
		resolveSelectedIndex
	} from '../internal/listbox/itemEquality.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { findComboboxRow, setComboboxItem, useComboboxRoot } from './context.svelte.js';
	import type { ComboboxItemProps, ComboboxItemState } from './types.js';

	let {
		value: itemValue = null,
		index: indexProp,
		disabled: disabledProp,
		nativeButton = false,
		render,
		children,
		...elementProps
	}: ComboboxItemProps = $props();

	const store = useComboboxRoot();
	const inRow = findComboboxRow() !== undefined;
	const bindKey = createAttachmentKey();

	let element = $state<HTMLElement | null>(null);

	const disabled = $derived(store.root.disabled || (disabledProp ?? false));
	const selectable = $derived(store.selectionMode !== 'none');
	// A virtualized item without `index` claims its position in the filtered items.
	const claimedIndex = $derived(
		indexProp ??
			(store.root.virtualized
				? findItemIndex(store.flatFilteredValues, itemValue, store.root.isItemEqualToValue)
				: undefined)
	);
	const index = $derived(claimedIndex ?? store.indexOf(element));
	const highlighted = $derived(index !== -1 && store.activeIndex === index);
	const selected = $derived(selectable && store.isSelected(itemValue));

	// Without `items`, each mounted item claims the selected index, also while closed, so the
	// trigger's typeahead follows the rendered order.
	$effect.pre(() => {
		const itemIndex = index;
		const value = itemValue;
		const { selectionMode, isItemEqualToValue } = store.root;
		if (itemIndex === -1 || store.hasItems) return;
		untrack(() => {
			const selectedValue = store.selectedValue;
			if (selectionMode === 'multiple' && Array.isArray(selectedValue)) {
				store.selectedIndex = resolveSelectedIndex(
					itemIndex,
					value,
					store.registeredValues,
					selectedValue,
					isItemEqualToValue,
					store.selectedIndex
				);
			} else if (compareItemEquality(value, selectedValue, isItemEqualToValue)) {
				store.selectedIndex = itemIndex;
			}
		});
	});

	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled: true,
		composite: true
	}));

	function bindItem(node: HTMLElement) {
		element = node;
		const unregister = store.items.register(node, () => ({
			value: itemValue,
			disabled,
			index: claimedIndex
		}));
		return () => {
			unregister();
			if (element === node) element = null;
		};
	}

	setComboboxItem({
		get selected() {
			return selected;
		}
	});

	function commitSelection(event: MouseEvent) {
		const selectItem = () => store.handleSelection(event, itemValue);
		if (store.root.submitOnItemClick) {
			flushSync(selectItem);
			store.requestSubmit();
		} else {
			selectItem();
		}
	}

	const partState: ComboboxItemState = $derived({ disabled, selected, highlighted });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		button.props(
			mergeProps(
				store.itemProps,
				{
					id: index === -1 ? undefined : `${store.root.id}-${index}`,
					role: inRow ? ('gridcell' as const) : ('option' as const),
					'aria-selected': selectable ? selected : undefined,
					// A focusable item would take focus from the input on mouseup.
					onpointerdowncapture(event: PointerEvent) {
						// Only the primary pointer gets a compat `mouseup`.
						if (event.isPrimary) store.pointerDownItem = event.currentTarget as Element;
						event.preventDefault();
					},
					// iOS Safari can send a mousedown for a tap without a pointerdown.
					onmousedown(event: MouseEvent) {
						event.preventDefault();
					},
					onclick(event: MouseEvent) {
						if (disabled || store.root.readOnly) return;
						commitSelection(event);
					},
					onmouseup(event: MouseEvent) {
						const startedOnItem = store.pointerDownItem === event.currentTarget;
						store.pointerDownItem = null;
						// A drag from the input that ends on the highlighted item selects it.
						if (
							disabled ||
							store.root.readOnly ||
							event.button !== 0 ||
							startedOnItem ||
							!highlighted
						) {
							return;
						}
						commitSelection(event);
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
