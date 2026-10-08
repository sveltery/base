<!--
	A heading that labels the popover. Renders an `<h2>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/title/PopoverTitle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { usePopoverRoot } from './context.svelte.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverTitleProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverTitleProps = $props();

	const store = usePopoverRoot();
	const uid = $props.id();
	const titleId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();

	function publish(node: HTMLElement) {
		store.titleElementId = node.id || titleId;
		return () => {
			if (store.titleElementId === (node.id || titleId)) store.titleElementId = undefined;
		};
	}

	const hostProps = $derived(
		asHost<HTMLHeadingElement>(
			mergeProps(loose(elementProps), loose({ id: titleId }), loose({ [bindKey]: publish }))
		)
	);
</script>

{#if render}
	{@render render(hostProps, content)}
{:else}
	<h2 {...hostProps}>{@render content()}</h2>
{/if}

{#snippet content()}
	{@render children?.()}
{/snippet}
