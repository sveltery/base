<!--
	Renders its children only when the list is empty.
	Requires the `items` prop on the root component.
	Announces changes politely to screen readers.
	This component's root element must remain mounted in the DOM to announce
	changes consistently across screen readers. Avoid hiding or removing the
	component itself with `display: none`, `hidden`, `aria-hidden`, or conditional
	rendering. Prefer updating or conditionally rendering its children instead.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/empty/ComboboxEmpty.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useComboboxRoot } from './context.svelte.js';
	import { announceInitialText } from './dom.js';
	import type { ComboboxEmptyProps, ComboboxEmptyState } from './types.js';

	let { render, children: childrenProp, ...elementProps }: ComboboxEmptyProps = $props();

	const store = useComboboxRoot();
	const bindKey = createAttachmentKey();
	const liveKey = createAttachmentKey();
	const children = $derived(store.listEmpty ? childrenProp : undefined);

	function bindEmpty(node: HTMLElement) {
		store.emptyElement = node;
		return () => {
			if (store.emptyElement === node) store.emptyElement = null;
		};
	}

	const partState: ComboboxEmptyState = {};
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'status',
		'aria-live': 'polite',
		'aria-atomic': true,
		...elementProps,
		[bindKey]: bindEmpty,
		[liveKey]: announceInitialText
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
