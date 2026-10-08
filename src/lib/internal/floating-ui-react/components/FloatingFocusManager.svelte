<script lang="ts">
	// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx
	// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	// The trap is focus guards plus aria-hidden on outside nodes. It does not set the inert attribute.

	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import type { Snippet } from 'svelte';
	import { createChangeEventDetails, REASONS } from '../../event-details.js';
	import FocusGuard from '../../FocusGuard.svelte';
	import { ownerDocument, ownerWindow } from '../../owner.js';
	import { activeElement, contains, getTarget } from '../../shadow-dom.js';
	import { AnimationFrame } from '../../timeout.js';
	import { useAnimationFrame, useTimeout } from '../../timeout.svelte.js';
	import type { OpenInteractionType } from '../../openInteraction.js';
	import type { FloatingRootStore, OpenChangePayload } from './FloatingRootStore.svelte.js';
	import { isElementVisible } from '../utils/composite.js';
	import { CLICK_TRIGGER_IDENTIFIER, FOCUSABLE_ATTRIBUTE } from '../utils/constants.js';
	import { enqueueFocus } from '../utils/enqueueFocus.js';
	import { markOthers } from '../utils/markOthers.js';
	import {
		getNextTabbableInDocument,
		getPreviousTabbable,
		getTabbableCandidates,
		isOutsideEvent
	} from '../utils/tabbable.js';
	import { hasFloatingPortal, useFloatingPortal } from './FloatingPortal.svelte';
	import { useFloatingTree } from './FloatingTree.svelte.js';
	import { getNodeAncestors, getNodeChildren } from './FloatingTreeStore.js';

	let {
		store,
		children,
		disabled = false,
		initialFocus = true,
		returnFocus = true,
		modal = true,
		closeOnFocusOut = true,
		restoreFocus = false,
		previousFocusableElement = null
	}: {
		store: FloatingRootStore;
		children?: Snippet;
		disabled?: boolean;
		initialFocus?:
			| boolean
			| HTMLElement
			| null
			| ((openType: OpenInteractionType) => boolean | HTMLElement | null | void);
		returnFocus?:
			| boolean
			| HTMLElement
			| null
			| ((closeType: OpenInteractionType | null) => boolean | HTMLElement | null | void);
		modal?: boolean;
		closeOnFocusOut?: boolean;
		/** `'popup'` focuses the popup when a focused control inside it is removed. */
		restoreFocus?: boolean | 'popup';
		/**
		 * Where Shift+Tab from the first control lands.
		 * Popover passes the trigger. Dialog leaves this unset and uses the portal's outside guard.
		 */
		previousFocusableElement?: HTMLElement | null;
	} = $props();

	const tree = useFloatingTree();
	const portaled = hasFloatingPortal();
	const portal = useFloatingPortal();
	const pointerDownTimeout = useTimeout();
	const restoreFrame = useAnimationFrame();
	let suppressFocusOut = false;
	/** Trigger (or the element focused before open). Not refreshed after focus moves inside. */
	let returnTarget: HTMLElement | null = null;

	function captureReturnTarget(doc: Document, floating: HTMLElement) {
		const reference = store.domReferenceElement;
		if (reference instanceof HTMLElement && reference.isConnected) {
			returnTarget = reference;
			return;
		}
		if (returnTarget) return;
		const active = activeElement(doc);
		if (
			active instanceof HTMLElement &&
			active !== doc.body &&
			!contains(floating, active) &&
			!contains(store.portalElement, active)
		) {
			returnTarget = active;
		}
	}

	function tabbables(floating: HTMLElement) {
		return getTabbableCandidates(floating);
	}

	function focusEdge(floating: HTMLElement, edge: 'first' | 'last') {
		const items = tabbables(floating);
		const target = edge === 'first' ? items[0] : items[items.length - 1];
		(target ?? floating).focus();
	}

	function bindInsideGuard(key: 'beforeInside' | 'afterInside') {
		return (node: HTMLElement) => {
			if (portal) portal.guards[key] = node;
			return () => {
				if (portal?.guards[key] === node) portal.guards[key] = null;
			};
		};
	}

	const attachBeforeInside = bindInsideGuard('beforeInside');
	const attachAfterInside = bindInsideGuard('afterInside');

	// Upstream leading guard (`FloatingFocusManager.tsx` 967–974).
	// Shift+Tab from the first control focuses `previousFocusableElement` (the trigger).
	// Focus that arrives from outside the portal moves to the next control inside.
	function enterThroughBeforeGuard(event: FocusEvent) {
		const portalNode = store.portalElement;
		if (!portalNode) return;
		if (isOutsideEvent(event, portalNode)) {
			const reference = store.domReferenceElement;
			if (reference instanceof Element) getNextTabbableInDocument(reference)?.focus();
			return;
		}
		const previous =
			previousFocusableElement instanceof HTMLElement
				? previousFocusableElement
				: portal?.guards.beforeOutside;
		previous?.focus();
	}

	// Upstream after-guard (`FloatingFocusManager.tsx` 984–1000). Tab from inside moves to
	// the trigger's trailing guard, or to the portal's outside guard when there is none.
	// Focus that arrives from outside the portal moves to the previous control inside.
	function leaveThroughAfterGuard(event: FocusEvent) {
		const portalNode = store.portalElement;
		if (!portalNode) return;
		if (isOutsideEvent(event, portalNode)) {
			const reference = store.domReferenceElement;
			if (reference instanceof Element) getPreviousTabbable(reference)?.focus();
			return;
		}
		const next = store.triggerFocusTarget ?? portal?.guards.afterOutside;
		if (next instanceof HTMLElement) next.focus();
	}

	/** How this open session closed. Not state: the trap effect must not depend on it. */
	let closeType: OpenInteractionType = '';
	/** `focus-out` skips return focus so a Tab that has not landed yet is not cancelled. */
	let closeReason = '';
	/** Next-frame return focus after an outside press. Not a component timer. */
	let returnFrameId = 0;
	let lastInteraction: OpenInteractionType = '';
	/** One initial-focus result per open. A later result must not rebuild the trap. */
	let initialSettled = false;
	let settledInitial: HTMLElement | false = false;
	/**
	 * The first open skips its focus frame when a child is opening with it.
	 * A later open, such as reopening a kept parent, still focuses inside.
	 */
	let hasOpenedBefore = false;

	function eventInteraction(event: Event, previous: OpenInteractionType): OpenInteractionType {
		const target = getTarget(event);
		const view = ownerWindow(target instanceof Node ? target : null);
		if (event instanceof view.KeyboardEvent) return 'keyboard';
		if (event instanceof view.FocusEvent) return previous || 'keyboard';
		if ('pointerType' in event) {
			const type = (event as PointerEvent).pointerType;
			if (type === 'mouse' || type === 'pen' || type === 'touch') return type;
			return 'keyboard';
		}
		if ('touches' in event) return 'touch';
		if (event instanceof view.MouseEvent) {
			return previous || (event.detail === 0 ? 'keyboard' : 'mouse');
		}
		return '';
	}

	function openAncestorPopup() {
		if (!tree || !store.nodeId) return null;
		for (const node of getNodeAncestors(tree.nodes, store.nodeId)) {
			const floating = node.context?.floatingElement;
			if (floating instanceof HTMLElement && floating.isConnected && node.context?.isOpen()) {
				return floating;
			}
		}
		return null;
	}

	function restoreReturnFocus(endedBy: OpenInteractionType) {
		const spec = returnFocus;
		// Upstream sets `preventReturnFocusRef` before every focus-out close and reads it
		// before resolving the target (`FloatingFocusManager.tsx` 550–552, 872, 888).
		// Pointer and keyboard both take this path. The return function is not called;
		// React calls it and ignores the result.
		const skipReturn = closeReason === REASONS.focusOut;
		let returned: HTMLElement | null = null;
		const apply = () => {
			if (spec === false || skipReturn) return;
			returned = moveReturnFocus(endedBy, spec) ?? null;
		};
		// Focus now only when a close is already committed. A disconnected popup is not
		// a close: the portal may be moving to another container. A `flushSync` here
		// commits a viewport switch before its pre-effect can copy the previous pane,
		// and it drops the close-completion effect so the popup never unmounts.
		// `closeReason` is set in `noteClose` before `open` flips when a flush runs
		// mid-`setOpen`, so this still lands inside the caller's `flushSync`.
		const closed = closeReason !== '' || !store.isOpen();
		if (closed) {
			apply();
			// Sloppy outside press closes on pointerdown and this call focuses the
			// trigger. The compatibility mousedown then moves focus to the body.
			// The next frame puts that same element back. A container swap is not a close.
			if (returned) {
				if (returnFrameId) AnimationFrame.cancel(returnFrameId);
				returnFrameId = AnimationFrame.request(() => {
					returnFrameId = 0;
					if (store.isOpen() || !returned.isConnected) return;
					const doc = ownerDocument(returned);
					const active = activeElement(doc);
					if (active !== doc.body && active != null) return;
					returned.focus({ preventScroll: true });
				});
			}
			return;
		}
		queueMicrotask(() => {
			if (spec === false || closeReason === REASONS.focusOut) return;
			if (!store.isOpen()) {
				apply();
				return;
			}
			if (store.floatingElement?.isConnected) return;
			const ancestor = openAncestorPopup();
			if (ancestor) {
				ancestor.focus({ preventScroll: true });
				return;
			}
			apply();
		});
	}

	function moveReturnFocus(endedBy: OpenInteractionType, spec: typeof returnFocus) {
		// `returnFocus={null}` does not move focus. Upstream skips the restore when the
		// prop is null (`FloatingFocusManager.tsx` 868–872). A function that returns
		// `null` is a different value and falls back to the trigger below.
		if (spec === false || spec == null) return;
		const fromFunction = typeof spec === 'function';
		const resolved = fromFunction ? spec(endedBy) : spec;
		if (resolved === false || resolved === undefined) return;
		// A function result of `null` falls back to the trigger, matching an empty ref.
		// Only a boolean `true` requires focus to still be inside.
		const explicit = fromFunction || spec instanceof HTMLElement;
		const target = resolved instanceof HTMLElement ? resolved : returnTarget;
		if (!target?.isConnected) return;
		if (!explicit) {
			const doc = ownerDocument(target);
			const active = activeElement(doc);
			const floating = store.floatingElement;
			// The portal host is not "inside" for return focus. A child that stayed
			// open is mounted beside the popup, and pulling focus back would
			// take it off that child. Upstream checks the floating element only.
			const inside = contains(floating, active) || active === doc.body || active == null;
			if (!inside) return;
		}
		target.focus({ preventScroll: true });
		returnTarget = null;
		return target;
	}

	function openedBy(): OpenInteractionType {
		if (!('openMethod' in store)) return '';
		const method = (store as { openMethod?: OpenInteractionType | null }).openMethod;
		return method ?? '';
	}

	function resolveInitial(floating: HTMLElement): HTMLElement | false {
		const spec = initialFocus;
		if (spec === false) return false;
		const resolved = typeof spec === 'function' ? spec(openedBy()) : spec;
		if (resolved === false || resolved === undefined) return false;
		if (resolved instanceof HTMLElement) return resolved;
		const first = tabbables(floating).find(
			(node): node is HTMLElement => node instanceof HTMLElement
		);
		return first ?? floating;
	}

	function takeInitial(floating: HTMLElement): HTMLElement | false {
		if (initialSettled) return settledInitial;
		initialSettled = true;
		settledInitial = untrack(() => resolveInitial(floating));
		return settledInitial;
	}

	function hasOpenChild() {
		if (!tree || !store.nodeId) return false;
		return getNodeChildren(tree.nodes, store.nodeId).length > 0;
	}

	function floatingFocusElement(element: HTMLElement | null | undefined): HTMLElement | null {
		if (!element) return null;
		if (element.hasAttribute(FOCUSABLE_ATTRIBUTE)) return element;
		return element.querySelector(`[${FOCUSABLE_ATTRIBUTE}]`) ?? element;
	}

	function triggersContain(target: Node) {
		const candidate = store as FloatingRootStore & {
			triggers?: { hasMatchingElement(predicate: (element: Element) => boolean): boolean };
		};
		return candidate.triggers?.hasMatchingElement((element) => contains(element, target)) ?? false;
	}

	/**
	 * Focus is still inside this popup, its trigger, its portal, or a parent or child popup.
	 * Upstream closes only when focus leaves those nodes (`FloatingFocusManager.tsx` 431–484).
	 */
	function focusStaysInTree(related: EventTarget | null) {
		if (!(related instanceof Node)) return false;
		// Shift+Tab from the open trigger lands on its leading focus guard.
		// That guard is outside the popup, and closing here would return focus to the trigger.
		if (related instanceof Element && related.hasAttribute('data-base-ui-focus-guard')) return true;
		const popup = store.floatingElement;
		if (contains(popup, related) || contains(store.portalElement, related)) return true;
		if (contains(store.domReferenceElement, related)) return true;
		if (related instanceof Element && popup && contains(related, popup)) return true;
		if (triggersContain(related)) return true;
		if (!tree || !store.nodeId) return false;
		const nodeId = store.nodeId;
		return untrack(() => {
			const nodes = tree.nodes;
			const child = getNodeChildren(nodes, nodeId).some(
				(node) =>
					contains(node.context?.floatingElement, related) ||
					contains(node.context?.domReferenceElement, related)
			);
			if (child) return true;
			return getNodeAncestors(nodes, nodeId).some((node) => {
				const ancestorFloating = node.context?.floatingElement ?? null;
				return (
					related === ancestorFloating ||
					related === floatingFocusElement(ancestorFloating) ||
					related === node.context?.domReferenceElement
				);
			});
		});
	}

	function noteClose(data?: unknown) {
		const payload = data as OpenChangePayload | undefined;
		if (!payload || payload.open || !payload.nativeEvent) return;
		closeType = eventInteraction(payload.nativeEvent, lastInteraction);
		closeReason = payload.reason;
	}

	function markedInside(floating: HTMLElement) {
		// Do not subscribe to the tree. A nested dialog mounting reads child open state here.
		const nested = untrack(() =>
			tree && store.nodeId ? getNodeChildren(tree.nodes, store.nodeId) : []
		);
		const inside = [floating, store.portalElement].filter(
			(element): element is HTMLElement => !!element
		);
		for (const node of nested) {
			const context = node.context;
			if (!context) continue;
			// Snapshot child elements without subscribing. Mounting a nested popup must not rebuild this trap.
			const elements = untrack(() => [context.floatingElement, context.portalElement]);
			for (const element of elements) {
				if (element) inside.push(element);
			}
		}
		return inside;
	}

	// Marking does not read `closeOnFocusOut`. Changing it must not hide outside nodes again.
	$effect(() => {
		if (disabled || !store.isOpen()) return;
		const floating = store.floatingElement;
		if (!floating) return;
		const inside = markedInside(floating);
		const hideOutside = modal ? markOthers(inside, { ariaHidden: true, mark: false }) : () => {};
		const mark = markOthers(inside);
		return () => {
			hideOutside();
			mark();
		};
	});

	$effect(() => {
		// Re-run when the portal container changes so a move is not treated as a close.
		const portalHome = portal?.home;
		if (disabled || !store.isOpen()) {
			initialSettled = false;
			return;
		}
		const floating = store.floatingElement;
		if (!floating || portalHome === null) return;
		const doc = ownerDocument(floating);
		captureReturnTarget(doc, floating);
		closeType = '';
		closeReason = '';
		if (returnFrameId) {
			AnimationFrame.cancel(returnFrameId);
			returnFrameId = 0;
		}
		lastInteraction = '';
		const initialTarget = takeInitial(floating);
		// A child opened in the same update queues its focus first. Skipping this
		// first frame keeps that child focused. Reopening does not skip.
		// Child open state is not a dependency. Reading it here would rebuild the trap
		// when a nested popup opens and pull focus back to this popup's first control.
		const skipForOpenChild = !hasOpenedBefore && untrack(() => hasOpenChild());
		hasOpenedBefore = true;
		if (initialTarget === false) return;
		const cancelFocus = enqueueFocus(initialTarget, {
			preventScroll: initialTarget === floating,
			shouldFocus: () =>
				store.isOpen() && !contains(floating, activeElement(doc)) && !skipForOpenChild
		});
		return () => cancelFocus();
	});

	$effect(() => {
		if (disabled || !store.isOpen()) {
			portal?.setFocus(null);
			return () => portal?.setFocus(null);
		}
		if (!modal) {
			portal?.setFocus({
				modal: false,
				open: true,
				closeOnFocusOut,
				domReference: store.domReferenceElement,
				close(event) {
					store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event));
				}
			});
		} else {
			portal?.setFocus(null);
		}
		const floating = store.floatingElement;
		if (!floating) return;
		const doc = ownerDocument(floating);

		// Tab wraps through the focus guards. This only blocks Tab when nothing inside is tabbable.
		const stopKeys = on(doc, 'keydown', (event) => {
			lastInteraction = 'keyboard';
			if (!modal || event.key !== 'Tab') return;
			const items = tabbables(floating);
			const active = activeElement(doc);
			if (!contains(floating, active)) return;
			if (items.length === 0) event.preventDefault();
		});

		const stopPointer = on(
			doc,
			'pointerdown',
			(event) => {
				const type = event.pointerType;
				lastInteraction =
					type === 'mouse' || type === 'pen' || type === 'touch' ? type : 'keyboard';
				const target = getTarget(event);
				if (target instanceof Element && target.closest(`[${CLICK_TRIGGER_IDENTIFIER}]`)) {
					suppressFocusOut = true;
					pointerDownTimeout.start(0, () => {
						suppressFocusOut = false;
					});
				}
			},
			{ capture: true }
		);

		// Close when focus leaves this popup or its trigger (upstream lines 568–578).
		function handleFocusOutside(event: FocusEvent) {
			if (!closeOnFocusOut || suppressFocusOut || !store.isOpen()) return;
			const relatedTarget = event.relatedTarget;
			queueMicrotask(() => {
				if (!closeOnFocusOut || suppressFocusOut || !store.isOpen()) return;
				// Modal focus is trapped. Only a non-modal popup closes when focus leaves it.
				if (modal) return;
				if (!(relatedTarget instanceof Element)) return;
				if (focusStaysInTree(relatedTarget)) return;
				// Upstream sets this before the close so return focus does not cancel the Tab.
				closeReason = REASONS.focusOut;
				store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event));
			});
		}

		const reference = store.domReferenceElement;
		const stopReferenceFocus =
			reference instanceof HTMLElement ? on(reference, 'focusout', handleFocusOutside) : () => {};
		const stopFloatingFocus = on(floating, 'focusout', handleFocusOutside);

		store.events.on('openchange', noteClose);

		const stopRestore = on(floating, 'focusout', (event) => {
			if (!restoreFocus) return;
			const lost = getTarget(event);
			if (!(lost instanceof Element)) return;
			queueMicrotask(() => {
				const popup = store.floatingElement;
				if (!store.isOpen() || !(popup instanceof HTMLElement) || !popup.isConnected) return;
				if (isElementVisible(lost) || activeElement(doc) !== doc.body) return;
				popup.focus({ preventScroll: true });
				if (restoreFocus !== 'popup') return;
				restoreFrame.request(() => {
					if (store.isOpen() && popup.isConnected) popup.focus({ preventScroll: true });
				});
			});
		});

		return () => {
			portal?.setFocus(null);
			stopKeys();
			stopPointer();
			stopReferenceFocus();
			stopFloatingFocus();
			stopRestore();
			pointerDownTimeout.clear();
			restoreFrame.cancel();
			store.events.off('openchange', noteClose);
			const endedBy = closeType;
			restoreReturnFocus(endedBy);
		};
	});
</script>

{#if modal && store.isOpen()}
	<FocusGuard
		data-type="inside"
		onfocus={() => {
			const floating = store.floatingElement;
			if (floating) focusEdge(floating, 'last');
		}}
	/>
{/if}
{#if portaled && !modal && !disabled && store.isOpen()}
	<FocusGuard data-type="inside" onfocus={enterThroughBeforeGuard} attach={attachBeforeInside} />
{/if}
{@render children?.()}
{#if portaled && !modal && !disabled && store.isOpen()}
	<FocusGuard data-type="inside" onfocus={leaveThroughAfterGuard} attach={attachAfterInside} />
{/if}
{#if modal && store.isOpen()}
	<FocusGuard
		data-type="inside"
		onfocus={() => {
			const floating = store.floatingElement;
			if (floating) focusEdge(floating, 'first');
		}}
	/>
{/if}
