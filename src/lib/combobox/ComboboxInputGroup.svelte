<!--
	A wrapper for the input and its associated controls.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/input-group/ComboboxInputGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { contains } from '@sveltery/utils';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useComboboxRoot } from './context.svelte.js';
	import { handleInputPress } from './dom.js';
	import { triggerStateAttributesMapping } from './parts.js';
	import type { ComboboxInputGroupProps, ComboboxInputGroupState } from './types.js';

	let { render, children, ...elementProps }: ComboboxInputGroupProps = $props();

	const store = useComboboxRoot();
	const field = useFieldContext();
	const bindKey = createAttachmentKey();
	const disabled = $derived(store.root.disabled);

	function bindGroup(node: HTMLElement) {
		store.inputGroupElement = node;
		return () => {
			if (store.inputGroupElement === node) store.inputGroupElement = null;
		};
	}

	const partState: ComboboxInputGroupState = $derived({
		...field.state,
		open: store.open,
		disabled,
		readOnly: store.root.readOnly,
		popupSide: store.renderedPopupSide,
		listEmpty: store.listEmpty,
		placeholder: store.selectionMode === 'none' ? false : !store.hasSelectedValue
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				role: 'group' as const,
				onmousedown(event: MouseEvent) {
					handleInputPress(event, store, disabled, (target) =>
						contains(store.chipsElement, target)
					);
				},
				...getStateAttributesProps(partState, triggerStateAttributesMapping),
				[bindKey]: bindGroup
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
