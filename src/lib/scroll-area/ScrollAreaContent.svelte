<!--
	A container for the content of the scroll area. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/content/ScrollAreaContent.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
	let rendered = $state<HTMLDivElement | null>(null);
	const computeOnInitialResize = untrack(() => model.hasMeasuredScrollbar);

	function remember(node: HTMLDivElement) {
		rendered = node;
		return () => {
			if (rendered === node) rendered = null;
		};
	}

	$effect(() => {
		const node = render ? rendered : el;
		if (!node) return;
		return model.observeContent(node, computeOnInitialResize);
	});

	const partState = $derived(model.rootState);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState, scrollAreaStateAttributesMapping),
		role: 'presentation',
		...elementProps,
		style: mergeCssStyle(toCssStyle({ minWidth: 'fit-content' }), style),
		...(render ? { [attachmentKey]: remember } : {})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps} bind:this={el}>{@render content()}</div>
{/if}
