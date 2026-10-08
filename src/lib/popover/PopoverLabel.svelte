<!--
	Shared heading and description host. Title renders an `<h2>`. Description renders a `<p>`.
	Derived from Base UI v1.8.0 packages/react/src/popover/title/PopoverTitle.tsx
	and packages/react/src/popover/description/PopoverDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The id is the prop or `$props.id()`. It is registered when the element mounts.
-->
<script lang="ts" generics="Element extends HTMLElement">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeProps } from '../internal/mergeProps.js';
	import { usePopoverRoot } from './context.svelte.js';

	let {
		part,
		tag,
		id: idProp,
		render,
		children,
		elementProps
	}: {
		part: 'title' | 'description';
		tag: 'h2' | 'p';
		id?: string | null;
		render?: Snippet<[HTMLAttributes<Element>, Snippet]>;
		children?: Snippet;
		elementProps: HTMLAttributes<Element>;
	} = $props();

	const store = usePopoverRoot();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();

	const register: Attachment<HTMLElement> = () => {
		const next = id;
		if (part === 'title') store.titleElementId = next;
		else store.descriptionElementId = next;
		return () => {
			if (part === 'title' && store.titleElementId === next) store.titleElementId = undefined;
			if (part === 'description' && store.descriptionElementId === next) {
				store.descriptionElementId = undefined;
			}
		};
	};

	const hostProps = $derived(mergeProps(elementProps, { id, [bindKey]: register }));
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if tag === 'h2'}
	{#if render}
		{@render render(hostProps, content)}
	{:else}
		<h2 {...hostProps as HTMLAttributes<HTMLHeadingElement>}>{@render content()}</h2>
	{/if}
{:else if render}
	{@render render(hostProps as HTMLAttributes<Element>, content)}
{:else}
	<p {...hostProps as HTMLAttributes<HTMLParagraphElement>}>{@render content()}</p>
{/if}
