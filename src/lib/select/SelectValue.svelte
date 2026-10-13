<!--
	The text label of the selected item. Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/value/SelectValue.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A `children` snippet receives the value in place of the children function.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		hasNullItemLabel,
		resolveMultipleLabels,
		resolveSelectedLabel
	} from '../internal/listbox/resolveValueLabel.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useSelectRoot } from './context.svelte.js';
	import type { SelectValueProps, SelectValueState } from './types.js';

	let { placeholder, children, render, ...elementProps }: SelectValueProps = $props();

	const store = useSelectRoot();
	const bindKey = createAttachmentKey();

	const showPlaceholder = $derived.by(() => {
		if (store.hasSelectedValue || placeholder == null || children != null) return false;
		return !hasNullItemLabel(store.root.items);
	});

	const label = $derived.by(() => {
		const { value, items, itemToStringLabel } = store.root;
		if (Array.isArray(value)) return resolveMultipleLabels(value, items, itemToStringLabel);
		return resolveSelectedLabel(value, items, itemToStringLabel);
	});

	const partState: SelectValueState = $derived({
		value: store.value,
		placeholder: !store.hasSelectedValue
	});

	function bindValue(node: HTMLElement) {
		store.valueElement = node;
		return () => {
			if (store.valueElement === node) store.valueElement = null;
		};
	}

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...(partState.placeholder ? { 'data-placeholder': '' } : {}),
		...elementProps,
		[bindKey]: bindValue
	});
</script>

{#snippet content()}
	{#if children}{@render children(store.value)}{:else if showPlaceholder}{placeholder}{:else}{label}{/if}
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<span {...hostProps}>{@render content()}</span>
{/if}
