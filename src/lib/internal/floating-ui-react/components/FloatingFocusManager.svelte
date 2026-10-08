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
	import { AnimationFrame, Timeout } from '../../timeout.js';
	import type { OpenInteractionType } from '../../openInteraction.js';
	import type { FloatingRootStore, OpenChangePayload } from './FloatingRootStore.svelte.js';
	import { isElementVisible } from '../utils/composite.js';
	import { CLICK_TRIGGER_IDENTIFIER, FOCUSABLE_ATTRIBUTE } from '../utils/constants.js';
	import { enqueueFocus } from '../utils/enqueueFocus.js';
	import { markOthers } from '../utils/markOthers.js';
	import { getPreviousTabbable, getTabbableCandidates, isOutsideEvent } from '../utils/tabbable.js';
	import { hasFloatingPortal } from './FloatingPortal.svelte';
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
		restoreFocus = false
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
	} = $props();

	const tree = useFloatingTree();
	const portaled = hasFloatingPortal();
	const pointerDownTimeout = Timeout.create();
	const restoreFrame = AnimationFrame.create();
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

	// Tab leaving a non-modal popup lands here, then on the trigger's trailing guard.
	// Focus that arrives from outside the positioner is the upstream after-guard path
	// (`FloatingFocusManager.tsx` 984–1000): move to the previous tabbable, which is
	// the control inside the popup, instead of staying on this guard.
	function leaveToTriggerGuard(event: FocusEvent) {
		const positioner = store.positionerElement;
		if (positioner && isOutsideEvent(event, positioner)) {
			const reference = store.domReferenceElement;
			if (reference instanceof Element) getPreviousTabbable(reference)?.focus();
			return;
		}
		const next = store.triggerFocusTarget;
		if (next instanceof HTMLElement) next.focus();
	}

	/** How this open session closed. Not state: the trap effect must not depend on it. */
	let closeType: OpenInteractionType = '';
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

	function restoreReturnFocus(endedBy: OpenInteractionType) {
		const spec = returnFocus;
		queueMicrotask(() => {
			if (spec === false) return;
			// A container cleared back to null removes the popup while it is still open.
			// Focus would land on the body. Upstream returns it on that cleanup.
			// A later dependency change while the popup is still connected does not.
			if (store.isOpen() && store.floatingElement?.isConnected) return;
			const fromFunction = typeof spec === 'function';
			const resolved = fromFunction ? spec(endedBy) : spec;
			if (resolved === false || resolved === undefined) return;
			// `null` falls back to the trigger. Only a boolean `true` requires focus to still be inside.
			const explicit = fromFunction || spec instanceof HTMLElement || spec == null;
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
		});
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
		return tabbables(floating)[0] ?? floating;
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
	}

	$effect(() => {
		if (disabled || !store.isOpen()) {
			initialSettled = false;
			return;
		}
		closeType = '';
		lastInteraction = '';
		const floating = store.floatingElement;
		if (!floating) return;

		const doc = ownerDocument(floating);
		captureReturnTarget(doc, floating);
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
		const hideOutside = modal ? markOthers(inside, { ariaHidden: true, mark: false }) : () => {};
		const mark = markOthers(inside);
		let cancelFocus = () => {};

		const initialTarget = takeInitial(floating);
		// A child opened in the same update queues its focus first. Skipping this
		// first frame keeps that child focused. Reopening does not skip.
		const skipForOpenChild = !hasOpenedBefore && hasOpenChild();
		hasOpenedBefore = true;
		if (initialTarget !== false) {
			cancelFocus = enqueueFocus(initialTarget, {
				preventScroll: initialTarget === floating,
				shouldFocus: () =>
					store.isOpen() && !contains(floating, activeElement(doc)) && !skipForOpenChild
			});
		}

		const stopKeys = on(doc, 'keydown', (event) => {
			lastInteraction = 'keyboard';
			if (!modal || event.key !== 'Tab') return;
			const items = tabbables(floating);
			const active = activeElement(doc);
			if (!contains(floating, active)) return;
			if (items.length === 0) {
				event.preventDefault();
				return;
			}
			const first = items[0];
			const last = items[items.length - 1];
			if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
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
			cancelFocus();
			hideOutside();
			mark();
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
{@render children?.()}
{#if portaled && !modal && !disabled && store.isOpen() && store.triggerFocusTarget}
	<FocusGuard onfocus={leaveToTriggerGuard} />
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
