<!--
	Shared heading and description host. Title renders an `<h2>`. Description renders a `<p>`.
	Derived from Base UI v1.8.0 packages/react/src/dialog/title/DialogTitle.tsx
	and packages/react/src/dialog/description/DialogDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="Element extends HTMLElement">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { registerLabelElementId } from '../internal/popups/labelId.js';
	import { useDialogRootContext } from './context.svelte.js';
	import type { RenderChildren } from '../internal/render-children.js';

	type HostProps = HTMLAttributes<Element> & Record<symbol, Attachment<Element>>;

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
		render?: Snippet<[HostProps, Record<string, never>, RenderChildren]>;
		children?: Snippet;
		elementProps: HTMLAttributes<Element>;
	} = $props();

	const store = useDialogRootContext();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();
	const state: Record<string, never> = {};

	const register = $derived((node: HTMLElement) =>
		registerLabelElementId(store, part, node.id || id)
	);

	const hostProps = $derived({
		id,
		...elementProps,
		...(render ? { [attachmentKey]: register } : {})
	} as HostProps);
</script>

{#if tag === 'h2'}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<h2 {...hostProps as HTMLAttributes<HTMLHeadingElement>} {@attach register}>
			{@render children?.()}
		</h2>
	{/if}
{:else if render}
	{@render render(hostProps, state, children)}
{:else}
	<p {...hostProps as HTMLAttributes<HTMLParagraphElement>} {@attach register}>
		{@render children?.()}
	</p>
{/if}
