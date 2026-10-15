<script lang="ts" module>
	import { createContext } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { FloatingRootStore } from './FloatingRootStore.svelte.js';

	const MOUNT = createAttachmentKey();

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
		close: (event: FocusEvent) => void;
	}

	export interface FloatingPortalContext {
		readonly node: HTMLElement | null;
		/** Element the portal host is attached to. The focus manager reads this on open. */
		readonly home: HTMLElement | ShadowRoot | null;
		readonly guards: FloatingPortalGuards;
		readonly focus: FloatingPortalFocus | null;
		setFocus: (next: FloatingPortalFocus | null) => void;
	}

	const [getPortal, setPortal, hasPortal] = createContext<FloatingPortalContext>();

	export const hasFloatingPortal = hasPortal;

	export function useFloatingPortal() {
		return hasPortal() ? getPortal() : null;
	}

	type RegisterNestedPortal = (host: HTMLElement) => () => void;

	const [getPopupScope, providePopupScope, hasPopupScope] = createContext<RegisterNestedPortal>();

	/**
	 * Records each portal rendered in the caller's content in `store.nestedPortals` and in those
	 * of the enclosing popups. Call it in the component that renders the popup's content.
	 */
	export function setFloatingPopupScope(store: FloatingRootStore) {
		const parent = hasPopupScope() ? getPopupScope() : null;
		providePopupScope((host) => {
			store.nestedPortals.add(host);
			const leaveParent = parent?.(host);
			return () => {
				store.nestedPortals.delete(host);
				leaveParent?.();
			};
		});
	}

	function insideClosedShadowRoot(node: Node) {
		for (let root = node.getRootNode(); root instanceof ShadowRoot; root = root.host.getRootNode())
			if (root.mode === 'closed') return true;
		return false;
	}
</script>

<script lang="ts">
	// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingPortal.tsx
	// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	// A nested portal mounts inside the parent portal host, as a sibling of that host's popup.
	// Upstream `createPortal` inserts the div before refs run (`ref: [consumer ref, setPortalNodeRef]`
	// in `useFloatingPortalNode`), so a consumer ref sees the container. The move is that portal,
	// not the ref. `MOUNT` and the `data-base-ui-portal` marker come before `rest`, so a consumer
	// `{@attach}` sees the same parent and a consumer marker value wins, as upstream merges it.
	// Upstream `useRenderElement` applies `render` and `className` to this div. The snippet receives
	// the same host props, including the move attachment. `class` is the native class name.
	// Explicit `container={null}` waits. `undefined` still uses the parent portal or `document.body`.
	// `containerElement` and `portalNode` start null. `useIsoLayoutEffect` is a no-op when
	// `document` is missing, so neither `createPortal` runs on the server. `client` stays false
	// for that render and the first client render, then flips after mount so hydration matches.

	import { mount as mountRoot, onMount, unmount, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { AriaRole, HTMLAttributes } from 'svelte/elements';
	import { FocusGuard, ownerDocument, activeElement, contains } from '@sveltery/utils';
	import {
		getNextTabbableInDocument,
		getTabbableCandidates,
		isOutsideEvent
	} from '../utils/tabbable.js';
	import DelegationRoot from './DelegationRoot.svelte';

	type PortalState = Record<string, never>;
	type PortalHostProps = HTMLAttributes<HTMLDivElement> &
		Record<symbol, Attachment<HTMLDivElement>>;

	const portalState: PortalState = {};

	let {
		store,
		children,
		container = undefined,
		render,
		portalOwnerRole,
		...rest
	}: {
		/** The popup store that records the portal element. A portal without a popup omits it. */
		store?: FloatingRootStore;
		children?: Snippet;
		container?: HTMLElement | ShadowRoot | null;
		render?: Snippet<[props: PortalHostProps, state: PortalState, children: Snippet]>;
		/** The role of the hidden `aria-owns` owner element. */
		portalOwnerRole?: AriaRole;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'> = $props();

	// The host always has an id so the owner element can point at it. A consumer `id` wins.
	const uniqueId = $props.id();

	let portalNode = $state<HTMLDivElement | null>(null);
	let client = $state(false);
	let focusState = $state<FloatingPortalFocus | null>(null);
	const parent = useFloatingPortal();
	const registerInPopup = hasPopupScope() ? getPopupScope() : null;
	// The open focus effect reads `home`, so a container swap re-runs it without looking like a close.
	const home = $derived(
		!client || container === null ? null : (container ?? parent?.node ?? document.body)
	);
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
		get home() {
			return home;
		},
		guards,
		get focus() {
			return focusState;
		},
		setFocus(next) {
			focusState = next;
		}
	};
	setPortal(portalContext);

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
	// leading inside guard. Focus from inside moves to the previous control outside the portal.
	// `getPreviousTabbable` would take the popup's own trailing guard when the portal host sits
	// before this outside guard, and Shift+Tab would loop inside the dialog.
	function focusBeforeOutside(event: FocusEvent) {
		if (!portalNode) return;
		if (isOutsideEvent(event, portalNode)) {
			guards.beforeInside?.focus();
			return;
		}
		focusPreviousOutsidePortal();
	}

	// `getPreviousTabbable(null)` still searches from the active element. A null trigger
	// reference must not skip that search: an externally opened popup has no dom reference.
	function focusPreviousOutsidePortal() {
		if (!portalNode) return;
		const doc = ownerDocument(portalNode);
		const list = getTabbableCandidates(doc.body);
		const active = activeElement(doc);
		let index = active instanceof HTMLElement ? list.indexOf(active) : -1;
		while (index > 0) {
			index -= 1;
			const candidate = list[index];
			if (!candidate) break;
			if (!contains(portalNode, candidate)) {
				candidate.focus();
				return;
			}
		}
		// Nothing outside the portal is before this guard. Upstream focuses the reference.
		const reference = focusState?.domReference;
		if (reference instanceof HTMLElement) reference.focus();
	}

	// Upstream FloatingPortal.tsx 277–291. Focus from outside enters through the trailing
	// inside guard. Focus from inside closes and moves to the control after the trigger.
	// The focus move can close this popup and clear `focusState`, so read it first, as the
	// upstream handler reads the state of the render that attached it.
	function focusAfterOutside(event: FocusEvent) {
		const state = focusState;
		if (!portalNode || !state) return;
		if (isOutsideEvent(event, portalNode)) {
			guards.afterInside?.focus();
			return;
		}
		const reference = state.domReference;
		if (reference instanceof Element) getNextTabbableInDocument(reference)?.focus();
		if (state.closeOnFocusOut) state.close(event);
	}

	let carriedFocus: HTMLElement | null = null;

	function mount(node: HTMLDivElement) {
		// Null is excluded by the template. `undefined` keeps the parent portal, then the body.
		// The attachment re-runs when `container` changes: the cleanup removes the host, then
		// this appends it. Focus inside the host is put back on the same control.
		const target = container ?? parent?.node ?? document.body;
		target.append(node);
		// Svelte handles `onclick` and other delegated events at the app root and the document.
		// Neither sees into a closed shadow root that the app root is outside of, nor into any
		// shadow root nested inside one.
		const delegation = insideClosedShadowRoot(node)
			? mountRoot(DelegationRoot, { target: node })
			: null;
		portalNode = node;
		if (store) store.portalElement = node;
		const leavePopup = registerInPopup?.(node);
		const restore = carriedFocus;
		carriedFocus = null;
		if (restore?.isConnected) restore.focus({ preventScroll: true });
		return () => {
			const active = document.activeElement;
			if (active instanceof HTMLElement && node.contains(active)) carriedFocus = active;
			if (store?.portalElement === node) store.portalElement = null;
			leavePopup?.();
			if (portalNode === node) portalNode = null;
			if (delegation) void unmount(delegation);
			node.remove();
		};
	}

	function hostProps(): PortalHostProps {
		return {
			[MOUNT]: mount,
			id: uniqueId,
			'data-base-ui-portal': '',
			...rest
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
		<!-- The full visually hidden styles break owned-element access in iOS VoiceControl (floating-ui#3403). -->
		<span
			role={portalOwnerRole}
			aria-owns={portalNode?.id || undefined}
			style="clip-path: inset(50%); position: fixed; top: 0px; left: 0px"
		></span>
	{/if}
	{#if render}
		{@render render(hostProps(), portalState, content)}
	{:else}
		<div {...{ [MOUNT]: mount }} id={uniqueId} data-base-ui-portal="" {...rest}>
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
