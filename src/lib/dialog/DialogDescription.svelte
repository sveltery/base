<!--
	A paragraph with additional information about the dialog. Renders a `<p>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/description/DialogDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { useDialogRootContext } from './context.svelte.js';
	import type { DialogDescriptionProps, DialogDescriptionState } from './types.js';

	let { id: idProp, render, children, ...elementProps }: DialogDescriptionProps = $props();

	const store = useDialogRootContext();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();
	const state: DialogDescriptionState = {};

	const register = $derived((node: HTMLElement) => {
		const next = node.id || id;
		store.descriptionElementId = next;
		return () => {
			if (store.descriptionElementId === next) store.descriptionElementId = undefined;
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
	<p {...hostProps} {@attach register}>{@render content()}</p>
{/if}
