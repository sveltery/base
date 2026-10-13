<!--
	A container for the chips in a multiselectable input. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/chips/ComboboxChips.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ElementList } from '../internal/element-list.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { setComboboxChips, useComboboxRoot } from './context.svelte.js';
	import { handleInputPress } from './dom.js';
	import type { ComboboxChipsProps, ComboboxChipsState } from './types.js';

	let { render, children, ...elementProps }: ComboboxChipsProps = $props();

	const store = useComboboxRoot();
	const bindKey = createAttachmentKey();
	const chips = new ElementList<HTMLElement>();
	setComboboxChips({ chips });

	function bindChips(node: HTMLElement) {
		store.chipsElement = node;
		return () => {
			if (store.chipsElement === node) store.chipsElement = null;
		};
	}

	const partState: ComboboxChipsState = {};
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				// NVDA leaves focus mode on arrow keys inside a container without the toolbar role.
				...(store.hasSelectionChips ? { role: 'toolbar' as const } : {}),
				onmousedown(event: MouseEvent) {
					handleInputPress(event, store, store.root.disabled);
				},
				[bindKey]: bindChips
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
