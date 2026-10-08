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
	import type { RenderChildren } from '../internal/render-children.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { registerLabelElementId } from '../internal/popups/labelId.js';
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
		render?: Snippet<[HTMLAttributes<Element>, Record<string, never>, RenderChildren]>;
		children?: Snippet;
		elementProps: HTMLAttributes<Element>;
	} = $props();

	const store = usePopoverRoot();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();

	const register: Attachment<HTMLElement> = () => registerLabelElementId(store, part, id);

	const hostProps = $derived(mergeProps({ id, [bindKey]: register }, elementProps));
	const state: Record<string, never> = {};
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else if tag === 'h2'}
	<h2 {...hostProps as unknown as HTMLAttributes<HTMLHeadingElement>}>{@render children?.()}</h2>
{:else}
	<p {...hostProps as unknown as HTMLAttributes<HTMLParagraphElement>}>{@render children?.()}</p>
{/if}
