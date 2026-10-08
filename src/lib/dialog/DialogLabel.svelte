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
	import { useDialogRootContext } from './context.svelte.js';

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
		render?: Snippet<[HostProps, Record<string, never>, Snippet]>;
		children?: Snippet;
		elementProps: HTMLAttributes<Element>;
	} = $props();

	const store = useDialogRootContext();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();
	const state: Record<string, never> = {};

	const register = $derived((node: HTMLElement) => {
		const next = node.id || id;
		if (part === 'title') store.titleElementId = next;
		else store.descriptionElementId = next;
		return () => {
			if (part === 'title' && store.titleElementId === next) store.titleElementId = undefined;
			if (part === 'description' && store.descriptionElementId === next) {
				store.descriptionElementId = undefined;
			}
		};
	});

	const hostProps = $derived({
		id,
		...elementProps,
		...(render ? { [attachmentKey]: register } : {})
	} as HostProps);
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if tag === 'h2'}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<h2 {...hostProps as HTMLAttributes<HTMLHeadingElement>} {@attach register}>
			{@render content()}
		</h2>
	{/if}
{:else if render}
	{@render render(hostProps, state, content)}
{:else}
	<p {...hostProps as HTMLAttributes<HTMLParagraphElement>} {@attach register}>
		{@render content()}
	</p>
{/if}
