<script lang="ts" module>
	import { createAttachmentKey } from 'svelte/attachments';

	const MOUNT = createAttachmentKey();
</script>

<script lang="ts">
	// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingPortal.tsx
	// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	// A nested portal mounts inside the parent portal host, as a sibling of that host's popup.
	// Upstream `createPortal` inserts the div before refs run (`ref: [consumer ref, setPortalNodeRef]`
	// in `useFloatingPortalNode`), so a consumer ref sees the container. The move is that portal,
	// not the ref. `MOUNT` is spread before `rest` so a consumer `{@attach}` sees the same parent.
	// `data-base-ui-portal` is set after that spread, so a consumer value cannot replace the marker.

	import { getContext, hasContext, setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FloatingRootStore } from './FloatingRootStore.svelte.js';

	interface PortalContext {
		readonly node: HTMLElement | null;
	}

	const PORTAL = Symbol.for('sveltery-floating-portal');

	let {
		store,
		children,
		container = undefined,
		...rest
	}: {
		store: FloatingRootStore;
		children?: Snippet;
		container?: HTMLElement | ShadowRoot | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	let portalNode = $state<HTMLDivElement | null>(null);
	const parent = hasContext(PORTAL) ? getContext<PortalContext>(PORTAL) : null;

	setContext<PortalContext>(PORTAL, {
		get node() {
			return portalNode;
		}
	});

	function mount(node: HTMLDivElement) {
		const target = container ?? parent?.node ?? document.body;
		target.append(node);
		portalNode = node;
		store.portalElement = node;
		return () => {
			if (store.portalElement === node) store.portalElement = null;
			if (portalNode === node) portalNode = null;
			node.remove();
		};
	}
</script>

<div {...{ [MOUNT]: mount }} {...rest} data-base-ui-portal="">
	{@render children?.()}
</div>
