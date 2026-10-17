<!--
	Groups all parts of the preview card.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/root/PreviewCardRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts" generics="Payload = unknown">
	import { setFloatingTree, useFloatingParentNodeId } from '@sveltery/floating-ui-svelte';
	import { setPreviewCardRoot } from './context.svelte.js';
	import PreviewCardInteractions from './PreviewCardInteractions.svelte';
	import { PreviewCardStore } from './store.svelte.js';
	import type { PreviewCardRootProps } from './types.js';

	let {
		open = $bindable(),
		defaultOpen,
		onOpenChange,
		onOpenChangeComplete,
		triggerId = $bindable(),
		defaultTriggerId,
		handle,
		children
	}: PreviewCardRootProps<Payload> = $props();
	// svelte-ignore state_referenced_locally
	if (open === undefined && defaultOpen !== undefined) open = defaultOpen;
	// svelte-ignore state_referenced_locally
	if (triggerId === undefined && defaultTriggerId !== undefined) triggerId = defaultTriggerId;

	const uid = $props.id();
	const nested = useFloatingParentNodeId() != null;
	setFloatingTree();

	const store = new PreviewCardStore({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: `base-ui-${uid}`,
		nested,
		readTriggerId: () => triggerId ?? null,
		writeTriggerId: (id) => {
			triggerId = id;
		},
		onOpenChange: () => onOpenChange as PreviewCardRootProps['onOpenChange'],
		onOpenChangeComplete: () => onOpenChangeComplete
	});
	setPreviewCardRoot(store);

	$effect(() => {
		const current = handle;
		if (!current) return;
		return current.attach(store);
	});

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

<!-- Detached triggers share this root, so its interactions mount early and their props stay stable. -->
{#if store.open || store.mounted || handle != null}
	<PreviewCardInteractions {store} />
{/if}
{@render children?.({ payload: store.payload as Payload | undefined })}
