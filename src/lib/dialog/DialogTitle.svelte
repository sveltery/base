<!--
	A heading that labels the dialog. Renders an `<h2>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/title/DialogTitle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { useDialogRootContext } from './context.svelte.js';
	import type { DialogTitleProps, DialogTitleState } from './types.js';

	let { id: idProp, render, children, ...elementProps }: DialogTitleProps = $props();

	const store = useDialogRootContext();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();
	const state: DialogTitleState = {};

	const register = $derived((node: HTMLElement) => {
		const next = node.id || id;
		store.titleElementId = next;
		return () => {
			if (store.titleElementId === next) store.titleElementId = undefined;
		};
	});

	const hostProps = $derived({
		id,
		...elementProps,
		...(render ? { [attachmentKey]: register } : {})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<h2 {...hostProps} {@attach register}>{@render content()}</h2>
{/if}
