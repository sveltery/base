<!--
	A container for the select items.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/list/SelectList.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { DISABLE_SCROLLBAR_CLASS } from '../internal/styles.js';
	import { useSelectPositioner, useSelectRoot } from './context.svelte.js';
	import { LIST_FUNCTIONAL_STYLES } from './popup-utils.js';
	import type { SelectListProps, SelectListState } from './types.js';

	let { render, children, ...elementProps }: SelectListProps = $props();

	const store = useSelectRoot();
	const positioner = useSelectPositioner();
	const bindKey = createAttachmentKey();
	const partState: SelectListState = {};

	function bindList(node: HTMLElement) {
		store.listElement = node;
		return () => {
			if (store.listElement === node) store.listElement = null;
		};
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				id: `${store.root.id}-list`,
				role: 'listbox' as const,
				'aria-multiselectable': store.multiple || undefined,
				'aria-readonly': store.root.readOnly || undefined,
				onscroll(event: Event) {
					store.scrollHandler?.(event.currentTarget as HTMLElement);
				},
				...(positioner.alignItemWithTriggerActive
					? { style: toCssStyle(LIST_FUNCTIONAL_STYLES) }
					: {}),
				class:
					store.hasScrollArrows && store.renderedOpenMethod !== 'touch'
						? DISABLE_SCROLLBAR_CLASS
						: undefined,
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
