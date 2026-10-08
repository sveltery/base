<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';

	const MOUNT = createAttachmentKey();
	const PORTAL = Symbol.for('sveltery-floating-portal');

	export interface FloatingPortalGuards {
		beforeOutside: HTMLElement | null;
		afterOutside: HTMLElement | null;
		beforeInside: HTMLElement | null;
		afterInside: HTMLElement | null;
	}

	/** Non-modal open state the focus manager publishes so the portal can render outside guards. */
	export interface FloatingPortalFocus {
		modal: boolean;
		open: boolean;
		closeOnFocusOut: boolean;
		domReference: Element | null;
		close: (event: Event) => void;
	}

	export interface FloatingPortalContext {
		readonly node: HTMLElement | null;
		readonly guards: FloatingPortalGuards;
		readonly focus: FloatingPortalFocus | null;
		setFocus: (next: FloatingPortalFocus | null) => void;
	}

	export function hasFloatingPortal() {
		return hasContext(PORTAL);
	}

	export function useFloatingPortal() {
		if (!hasFloatingPortal()) return null;
		return getContext<FloatingPortalContext>(PORTAL);
	}
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
	// `containerElement` and `portalNode` start null. `useIsoLayoutEffect` is a no-op when
	// `document` is missing, so neither `createPortal` runs on the server. `client` stays false
	// for that render and the first client render, then flips after mount so hydration matches.

	import { onMount, setContext, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import FocusGuard from '../../FocusGuard.svelte';
	import { toCssStyle } from '../../css-style.js';
	import { visuallyHidden } from '../../visuallyHidden.js';
	import {
		getNextTabbableInDocument,
		getPreviousTabbable,
		getTabbableCandidates,
		isOutsideEvent
	} from '../utils/tabbable.js';
	import type { FloatingRootStore } from './FloatingRootStore.svelte.js';

	type PortalState = Record<string, never>;
	type PortalHostProps = HTMLAttributes<HTMLDivElement> &
		Record<symbol, Attachment<HTMLDivElement>>;

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
	let client = $state(false);
	let focusState = $state<FloatingPortalFocus | null>(null);
	const parent = useFloatingPortal();
	const guards: FloatingPortalGuards = {
		beforeOutside: null,
		afterOutside: null,
		beforeInside: null,
		afterInside: null
	};

	onMount(() => {
		client = true;
	});

	const portalContext: FloatingPortalContext = {
		get node() {
			return portalNode;
		},
		guards,
		get focus() {
			return focusState;
		},
		setFocus(next) {
			focusState = next;
		}
	};
	setContext<FloatingPortalContext>(PORTAL, portalContext);

	const showOutsideGuards = $derived(
		focusState != null && !focusState.modal && focusState.open && portalNode != null
	);

	function bindGuard(key: keyof FloatingPortalGuards): Attachment<HTMLElement> {
		return (node) => {
			guards[key] = node;
			return () => {
				if (guards[key] === node) guards[key] = null;
			};
		};
	}

	// Upstream FloatingPortal.tsx 258–266. Focus from outside the portal enters through the
	// leading inside guard. Focus from inside moves to the previous control.
	function focusBeforeOutside(event: FocusEvent) {
		if (!portalNode) return;
		if (isOutsideEvent(event, portalNode)) {
			if (guards.beforeInside) {
				guards.beforeInside.focus();
				return;
			}
			// Dialog has no leading inside guard. Tab from the trigger still enters the popup.
			const floating = store.floatingElement;
			const first = floating ? getTabbableCandidates(floating)[0] : null;
			first?.focus();
			return;
		}
		const reference = focusState?.domReference ?? null;
		if (reference instanceof Element) getPreviousTabbable(reference)?.focus();
	}

	// Upstream FloatingPortal.tsx 277–291. Focus from outside enters through the trailing
	// inside guard. Focus from inside closes and moves to the control after the trigger.
	function focusAfterOutside(event: FocusEvent) {
		if (!portalNode || !focusState) return;
		if (isOutsideEvent(event, portalNode)) {
			guards.afterInside?.focus();
			return;
		}
		const reference = focusState.domReference;
		if (reference instanceof Element) getNextTabbableInDocument(reference)?.focus();
		if (focusState.closeOnFocusOut) focusState.close(event);
	}

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

{#if client && container !== null}
	{#if showOutsideGuards}
		<FocusGuard
			data-type="outside"
			onfocus={focusBeforeOutside}
			attach={bindGuard('beforeOutside')}
		/>
		{#if portalNode?.id}
			<span aria-owns={portalNode.id} style={toCssStyle(visuallyHidden)}></span>
		{/if}
	{/if}
	{#if render}
		{@render render(hostProps(), portalState, content)}
	{:else}
		<div {...{ [MOUNT]: mount }} {...rest} data-base-ui-portal="">
			{@render content()}
		</div>
	{/if}
	{#if showOutsideGuards}
		<FocusGuard
			data-type="outside"
			onfocus={focusAfterOutside}
			attach={bindGuard('afterOutside')}
		/>
	{/if}
{/if}
