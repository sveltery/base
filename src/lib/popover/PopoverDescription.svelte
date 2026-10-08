<!--
	A paragraph with additional information about the popover. Renders a `<p>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/description/PopoverDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { usePopoverRoot } from './context.svelte.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverDescriptionProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverDescriptionProps = $props();

	const store = usePopoverRoot();
	const uid = $props.id();
	const descriptionId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();

	function publish(node: HTMLElement) {
		store.descriptionElementId = node.id || descriptionId;
		return () => {
			if (store.descriptionElementId === (node.id || descriptionId)) {
				store.descriptionElementId = undefined;
			}
		};
	}

	const hostProps = $derived(
		asHost<HTMLParagraphElement>(
			mergeProps(loose(elementProps), loose({ id: descriptionId }), loose({ [bindKey]: publish }))
		)
	);
</script>

{#if render}
	{@render render(hostProps, content)}
{:else}
	<p {...hostProps}>{@render content()}</p>
{/if}

{#snippet content()}
	{@render children?.()}
{/snippet}
