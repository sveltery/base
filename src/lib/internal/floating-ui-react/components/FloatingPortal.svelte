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
	// Upstream `useRenderElement` applies `render` and `className` to this div. The snippet receives
	// the same host props, including the move attachment. `class` is the native class name.
	// Explicit `container={null}` waits. `undefined` still uses the parent portal or `document.body`.

	import { getContext, hasContext, setContext, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FloatingRootStore } from './FloatingRootStore.svelte.js';

	interface PortalContext {
		readonly node: HTMLElement | null;
	}

	type PortalState = Record<string, never>;
	type PortalHostProps = HTMLAttributes<HTMLDivElement> &
		Record<symbol, Attachment<HTMLDivElement>>;

	const PORTAL = Symbol.for('sveltery-floating-portal');
	const portalState: PortalState = {};

	let {
		store,
		children,
		container = undefined,
		render,
		...rest
	}: {
		store: FloatingRootStore;
		children?: Snippet;
		container?: HTMLElement | ShadowRoot | null;
		render?: Snippet<[props: PortalHostProps, state: PortalState, children: Snippet]>;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	let portalNode = $state<HTMLDivElement | null>(null);
	const parent = hasContext(PORTAL) ? getContext<PortalContext>(PORTAL) : null;

	setContext<PortalContext>(PORTAL, {
		get node() {
			return portalNode;
		}
	});

	function mount(node: HTMLDivElement) {
		// Null is excluded by the template. `undefined` keeps the parent portal, then the body.
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

	function hostProps(): PortalHostProps {
		return {
			[MOUNT]: mount,
			...rest,
			'data-base-ui-portal': ''
		} as PortalHostProps;
	}
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if container !== null}
	{#if render}
		{@render render(hostProps(), portalState, content)}
	{:else}
		<div {...{ [MOUNT]: mount }} {...rest} data-base-ui-portal="">
			{@render content()}
		</div>
	{/if}
{/if}
