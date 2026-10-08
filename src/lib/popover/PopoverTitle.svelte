<!--
	A heading that labels the popover. Renders an `<h2>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/title/PopoverTitle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { usePopoverRoot } from './context.svelte.js';
	import type { PopoverTitleProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverTitleProps = $props();

	const store = usePopoverRoot();
	const uid = $props.id();
	const titleId = $derived(id ?? `base-ui-${uid}`);

	$effect(() => {
		store.titleElementId = titleId;
		return () => {
			if (store.titleElementId === titleId) store.titleElementId = undefined;
		};
	});

	const hostProps = $derived(mergeProps(elementProps, { id: titleId }));
</script>

{#if render}
	{@render render(hostProps, content)}
{:else}
	<h2 {...hostProps}>{@render content()}</h2>
{/if}

{#snippet content()}
	{@render children?.()}
{/snippet}
