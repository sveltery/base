<!--
	Clears the value when clicked. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/clear/ComboboxClear.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { getHighlightReason } from '../internal/getHighlightReason.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps, transitionStatusMapping } from '../internal/state-attributes.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import { useComboboxRoot } from './context.svelte.js';
	import type { ComboboxClearProps, ComboboxClearState } from './types.js';

	let {
		disabled: disabledProp = false,
		nativeButton = true,
		keepMounted = false,
		render,
		children,
		...elementProps
	}: ComboboxClearProps = $props();

	const store = useComboboxRoot();
	const field = useFieldContext();
	const bindKey = createAttachmentKey();

	const visible = $derived.by(() => {
		if (store.selectionMode === 'none') return store.inputValue !== '';
		if (store.selectionMode === 'single') return store.selectedValue != null;
		return store.hasSelectionChips;
	});
	const disabled = $derived(field.disabled || store.root.disabled || disabledProp);
	const button = new ButtonBehavior(() => ({ native: nativeButton, disabled }));
	const transition = new TransitionStatus(() => visible);
	transition.unmountAfterExit(() => store.clearElement);

	function bindClear(node: HTMLElement) {
		store.clearElement = node;
		return () => {
			if (store.clearElement === node) store.clearElement = null;
		};
	}

	function handleClick(event: MouseEvent) {
		if (disabled || store.root.readOnly) return;
		const type = getHighlightReason(event);
		store.setInputValue('', createChangeEventDetails(REASONS.clearPress, event));
		if (store.selectionMode !== 'none') {
			store.setSelectedValue(
				Array.isArray(store.selectedValue) ? [] : null,
				createChangeEventDetails(REASONS.clearPress, event)
			);
			store.setIndices({ activeIndex: null, selectedIndex: null, type, event });
		} else {
			store.setIndices({ activeIndex: null, type, event });
		}
		store.inputElement?.focus();
	}

	const partState: ComboboxClearState = $derived({
		disabled,
		visible,
		open: store.open,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLButtonAttributes = $derived(
		button.props(
			mergeProps(
				{
					tabindex: -1,
					// Focus stays on the input.
					onmousedown(event: MouseEvent) {
						event.preventDefault();
					},
					onclick: handleClick,
					...getStateAttributesProps(partState, {
						...transitionStatusMapping,
						...triggerOpenStateMapping
					}),
					[bindKey]: bindClear
				},
				elementProps
			)
		)
	);
</script>

{#snippet cross()}x{/snippet}

{#if keepMounted || transition.mounted}
	{#if render}
		{@render render(hostProps, partState, children ?? cross)}
	{:else}
		<button {...hostProps}>{@render (children ?? cross)()}</button>
	{/if}
{/if}
