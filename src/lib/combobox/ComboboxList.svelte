<!--
	A list container for the items. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/list/ComboboxList.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A children function is not wrapped in a collection: render `Combobox.Collection` inside.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { findComboboxPositioner, useComboboxRoot } from './context.svelte.js';
	import { stopEvent } from './dom.js';
	import type { ComboboxListProps, ComboboxListState } from './types.js';

	let { render, children, ...elementProps }: ComboboxListProps = $props();

	const store = useComboboxRoot();
	const hasPositioner = findComboboxPositioner() !== undefined;
	const bindKey = createAttachmentKey();

	function bindList(node: HTMLElement) {
		store.listElement = node;
		// An inline list has no positioner, so it is the floating element.
		if (!hasPositioner) store.positionerElement = node;
		// A keyed move registers nothing, so the item order follows the DOM here.
		const observer = new MutationObserver(() => store.items.refreshOrder());
		observer.observe(node, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			if (store.listElement === node) store.listElement = null;
			if (!hasPositioner && store.positionerElement === node) store.positionerElement = null;
		};
	}

	const partState: ComboboxListState = $derived({ empty: store.listEmpty });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			store.listProps,
			{
				tabindex: -1,
				id: store.floatingId,
				role: store.root.grid ? ('grid' as const) : ('listbox' as const),
				'aria-multiselectable': store.selectionMode === 'multiple' ? ('true' as const) : undefined,
				// On a grid the attribute describes cell editability, so the combobox element carries it.
				'aria-readonly': !store.root.grid && store.root.readOnly ? true : undefined,
				onkeydown(event: KeyboardEvent) {
					if (store.root.disabled || store.root.readOnly) return;
					if (event.key !== 'Enter') return;
					const activeIndex = store.activeIndex;
					// The form can submit when nothing is highlighted.
					if (activeIndex == null) return;
					stopEvent(event);
					store.clickHighlightedItem(activeIndex, event);
				},
				...getStateAttributesProps(partState),
				[bindKey]: bindList
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
