<!--
	Shared title and description host. Title renders an `<h2>`. Description renders a `<p>`.
	Derived from Base UI v1.9.0 packages/react/src/toast/utils/useToastLabelPart.ts,
	packages/react/src/toast/title/ToastTitle.tsx, and
	packages/react/src/toast/description/ToastDescription.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Renders nothing without children or a renderable toast field. The id is registered with
	the root while the element is mounted, and cleared only when it is still the current one.
-->
<script lang="ts" generics="Element extends HTMLElement">
	import type { Snippet } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeProps } from '../internal/mergeProps.js';
	import { registerLabelElementId } from '../internal/popups/labelId.js';
	import type { RenderChildren } from '../internal/render-children.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToastRoot } from './context.js';
	import ToastText from './ToastText.svelte';
	import { isRenderable } from './utils.js';

	type LabelState = { type: string | undefined };

	let {
		part,
		id: idProp,
		render,
		children,
		elementProps
	}: {
		part: 'title' | 'description';
		id?: string | null;
		render?: Snippet<[HTMLAttributes<Element>, LabelState, RenderChildren]>;
		children?: Snippet;
		elementProps: HTMLAttributes<Element>;
	} = $props();

	const rootContext = useToastRoot();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const registerKey = createAttachmentKey();

	const fallback = $derived(
		part === 'title' ? rootContext.toast.title : rootContext.toast.description
	);
	const shouldRender = $derived(children != null || isRenderable(fallback));

	const register: Attachment<HTMLElement> = () => registerLabelElementId(rootContext, part, id);

	const state: LabelState = $derived({ type: rootContext.toast.type });

	const hostProps = $derived(
		mergeProps(
			{ ...getStateAttributesProps(state), id, [registerKey]: register },
			elementProps
		) as HTMLAttributes<Element>
	);
</script>

{#snippet content()}
	{#if children}{@render children()}{:else}<ToastText value={fallback} />{/if}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else if part === 'title'}
		<h2 {...hostProps as unknown as HTMLAttributes<HTMLHeadingElement>}>{@render content()}</h2>
	{:else}
		<p {...hostProps as unknown as HTMLAttributes<HTMLParagraphElement>}>{@render content()}</p>
	{/if}
{/if}
