<!--
	Indicates whether a listbox item is selected. Renders a `<span>`.
	Derived from Base UI v1.9.0 packages/react/src/utils/ItemIndicator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Shared by Select and Combobox. Their wrappers mount it only while selected or kept mounted,
	so a freshly selected indicator starts without a transition, as upstream.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RenderChildren } from '../render-children.js';
	import { getStateAttributesProps, transitionStatusMapping } from '../state-attributes.js';
	import { TransitionStatus, type TransitionStatusValue } from '../useTransitionStatus.svelte.js';

	interface ItemIndicatorState {
		selected: boolean;
		transitionStatus: TransitionStatusValue;
	}

	let {
		selected,
		render,
		children,
		...elementProps
	}: Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
		selected: boolean;
		render?: Snippet<
			[props: HTMLAttributes<HTMLSpanElement>, state: ItemIndicatorState, children: RenderChildren]
		>;
		children?: Snippet;
	} = $props();

	const transition = new TransitionStatus(() => selected);
	const indicatorKey = createAttachmentKey();
	let node = $state<HTMLElement | null>(null);
	transition.unmountAfterExit(() => node, true);

	function remember(element: HTMLElement) {
		node = element;
		return () => {
			if (node === element) node = null;
		};
	}

	const partState: ItemIndicatorState = $derived({
		selected,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived({
			...getStateAttributesProps(partState, transitionStatusMapping),
			'aria-hidden': true,
			...elementProps,
			[indicatorKey]: remember
		});
</script>

{#snippet check()}✔️{/snippet}

{#if render}
	{@render render(hostProps, partState, children ?? check)}
{:else}
	<span {...hostProps}>{@render (children ?? check)()}</span>
{/if}
