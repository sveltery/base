<!--
	A container for the contents of a toast. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/content/ToastContent.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToastRoot } from './context.js';
	import type { ToastContentProps, ToastContentState } from './types.js';

	let { render, children, ...elementProps }: ToastContentProps = $props();

	const rootContext = useToastRoot();
	const observeKey = createAttachmentKey();

	// Content changes resize the root, so its stored height follows them.
	function observe(node: HTMLElement) {
		untrack(() => rootContext.recalculateHeight());
		if (typeof ResizeObserver !== 'function' || typeof MutationObserver !== 'function') return;

		const recalculate = () => untrack(() => rootContext.recalculateHeight(true));
		const resizeObserver = new ResizeObserver(recalculate);
		const mutationObserver = new MutationObserver(recalculate);
		resizeObserver.observe(node);
		mutationObserver.observe(node, { childList: true, subtree: true, characterData: true });

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	}

	const state: ToastContentState = $derived({
		expanded: rootContext.expanded,
		behind: rootContext.visibleIndex > 0
	});

	const hostProps = $derived(
		mergeProps({ ...getStateAttributesProps(state), [observeKey]: observe }, elementProps)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
