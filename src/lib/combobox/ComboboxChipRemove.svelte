<!--
	A button to remove a chip. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/chip-remove/ComboboxChipRemove.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { getHighlightReason } from '../internal/getHighlightReason.js';
	import { findItemIndex } from '../internal/listbox/itemEquality.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useComboboxChip, useComboboxRoot } from './context.svelte.js';
	import { stopEvent } from '@sveltery/floating-ui-svelte';
	import type { ComboboxChipRemoveProps, ComboboxChipRemoveState } from './types.js';

	let {
		disabled: disabledProp,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: ComboboxChipRemoveProps = $props();

	const store = useComboboxRoot();
	const chip = useComboboxChip();
	const disabled = $derived(store.root.disabled || (disabledProp ?? false));
	const button = new ButtonBehavior(() => ({
		native: nativeButton,
		disabled: disabled || store.root.readOnly,
		focusableWhenDisabled: true
	}));

	function removeChip(event: MouseEvent | KeyboardEvent) {
		const details = createChangeEventDetails(REASONS.chipRemovePress, event);
		const selected = Array.isArray(store.selectedValue) ? (store.selectedValue as unknown[]) : [];
		const index = chip.index;
		const removed = selected[index];

		// A filtered-out item cannot be the highlighted one.
		const activeIndex = store.activeIndex;
		if (activeIndex != null) {
			const removedIndex = findItemIndex(store.values, removed, store.root.isItemEqualToValue);
			if (removedIndex !== -1 && removedIndex === activeIndex) {
				store.setIndices({ activeIndex: null, type: getHighlightReason(event), event });
			}
		}

		store.setSelectedValue(
			selected.filter((_, i) => i !== index),
			details
		);
		store.inputElement?.focus();
		return details;
	}

	const partState: ComboboxChipRemoveState = $derived({ disabled });

	const hostProps: HTMLButtonAttributes = $derived(
		button.props(
			mergeProps(
				{
					tabindex: -1,
					onmousedown(event: MouseEvent) {
						event.preventDefault();
					},
					onclick(event: MouseEvent) {
						const details = removeChip(event);
						if (!details.isPropagationAllowed) event.stopPropagation();
					},
					onkeydown(event: KeyboardEvent) {
						if (event.key !== 'Enter' && event.key !== ' ') return;
						const details = removeChip(event);
						if (!details.isPropagationAllowed) stopEvent(event);
					},
					...getStateAttributesProps(partState)
				},
				elementProps
			)
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
