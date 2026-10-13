<!--
	A container for the content of the scroll area. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/scroll-area/content/ScrollAreaContent.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import { useScrollAreaRootContext, useScrollAreaViewportContext } from './context.svelte.js';
	import type { ScrollAreaContentProps } from './types.js';

	const attachmentKey = createAttachmentKey();

	let { style, render, children, ...elementProps }: ScrollAreaContentProps = $props();

	const model = useScrollAreaViewportContext();
	useScrollAreaRootContext();

	let el = $state<HTMLDivElement | null>(null);
	const computeOnInitialResize = untrack(() => model.hasMeasuredScrollbar);

	function remember(node: HTMLDivElement) {
		el = node;
		return () => {
			if (el === node) el = null;
		};
	}

	$effect(() => {
		const node = el;
		if (!node) return;
		return model.observeContent(node, computeOnInitialResize);
	});

	const partState = $derived(model.rootState);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState, scrollAreaStateAttributesMapping),
		role: 'presentation',
		...elementProps,
		style: mergeCssStyle(toCssStyle({ minWidth: 'fit-content' }), style),
		[attachmentKey]: remember
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
