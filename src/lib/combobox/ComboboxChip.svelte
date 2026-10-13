<!--
	An individual chip that represents a value in a multiselectable input.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/chip/ComboboxChip.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { flushSync } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { findComboboxChips, setComboboxChip, useComboboxRoot } from './context.svelte.js';
	import { stopEvent } from './dom.js';
	import { getChipNavigationKeys, getIndexAfterChipRemoval } from './parts.js';
	import type { ComboboxChipProps, ComboboxChipState } from './types.js';

	let { render, children, ...elementProps }: ComboboxChipProps = $props();

	const store = useComboboxRoot();
	const chipsContext = findComboboxChips();
	const direction = useDirection();
	const bindKey = createAttachmentKey();

	let element = $state<HTMLElement | null>(null);
	const index = $derived(chipsContext ? chipsContext.chips.indexOf(element) : -1);
	const disabled = $derived(store.root.disabled);
	const readOnly = $derived(store.root.readOnly);

	setComboboxChip({
		get index() {
			return index;
		}
	});

	function bindChip(node: HTMLElement) {
		element = node;
		const unregister = chipsContext?.chips.register(node);
		return () => {
			unregister?.();
			if (element === node) element = null;
		};
	}

	/** The chip to focus next, or `undefined` to focus the input. */
	function handleKeyDown(event: KeyboardEvent): number | undefined {
		const chips = chipsContext?.chips.elements ?? [];
		const [previousChipKey, nextChipKey] = getChipNavigationKeys(direction.direction);
		const selected = Array.isArray(store.selectedValue) ? (store.selectedValue as unknown[]) : [];

		if (event.key === previousChipKey) {
			event.preventDefault();
			return index > 0 ? index - 1 : undefined;
		}
		if (event.key === nextChipKey) {
			event.preventDefault();
			return index < chips.length - 1 ? index + 1 : undefined;
		}
		if (event.key === 'Backspace' || event.key === 'Delete') {
			const next = getIndexAfterChipRemoval(index, selected.length);
			stopEvent(event);
			// The removal commits before focus moves, so the chip list holds the remaining chips.
			flushSync(() => {
				store.setIndices({
					activeIndex: null,
					selectedIndex: null,
					type: REASONS.keyboard,
					event
				});
				store.setSelectedValue(
					selected.filter((_, i) => i !== index),
					createChangeEventDetails(REASONS.none, event)
				);
			});
			return next;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			stopEvent(event);
			return undefined;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			stopEvent(event);
			// The input may mount when the popup opens.
			flushSync(() => {
				store.setOpen(true, createChangeEventDetails(REASONS.listNavigation, event));
			});
			return undefined;
		}
		// A printable character returns to the input.
		if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
			return undefined;
		}
		return index;
	}

	const partState: ComboboxChipState = $derived({ disabled });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				tabindex: -1,
				'aria-disabled': disabled || undefined,
				'aria-readonly': readOnly || undefined,
				onkeydown(event: KeyboardEvent) {
					if (disabled || readOnly) return;
					const next = handleKeyDown(event);
					if (next === undefined) store.inputElement?.focus();
					else chipsContext?.chips.elements[next]?.focus();
				},
				...getStateAttributesProps(partState),
				[bindKey]: bindChip
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
