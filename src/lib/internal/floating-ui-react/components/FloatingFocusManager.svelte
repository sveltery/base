<script lang="ts">
	// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx
	// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	// The trap is focus guards plus aria-hidden on outside nodes. It does not set the inert attribute.

	import { on } from 'svelte/events';
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import { createChangeEventDetails, REASONS } from '../../event-details.js';
	import FocusGuard from '../../FocusGuard.svelte';
	import { ownerDocument, ownerWindow } from '../../owner.js';
	import { activeElement, contains, getTarget } from '../../shadow-dom.js';
	import { Timeout } from '../../timeout.js';
	import type { OpenInteractionType } from '../../openInteraction.js';
	import type { FloatingRootStore, OpenChangePayload } from './FloatingRootStore.svelte.js';
	import { CLICK_TRIGGER_IDENTIFIER } from '../utils/constants.js';
	import { enqueueFocus } from '../utils/enqueueFocus.js';
	import { markOthers } from '../utils/markOthers.js';
	import { getTabbableCandidates } from '../utils/tabbable.js';
	import { useFloatingTree } from './FloatingTree.svelte.js';
	import { getNodeChildren } from './FloatingTreeStore.js';

	let {
		store,
		children,
		disabled = false,
		initialFocus = true,
		returnFocus = true,
		modal = true,
		closeOnFocusOut = true
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
	} = $props();

	const tree = useFloatingTree();
	const pointerDownTimeout = Timeout.create();
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

	/** How this open session closed. Not state: the trap effect must not depend on it. */
	let closeType: OpenInteractionType = '';
	let lastInteraction: OpenInteractionType = '';
	/** One initial-focus result per open. A later result must not rebuild the trap. */
	let initialSettled = false;
	let settledInitial: HTMLElement | false = false;

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
			if (spec === false || store.isOpen()) return;
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
				const inside =
					contains(floating, active) ||
					contains(store.portalElement, active) ||
					active === doc.body ||
					active == null;
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
		const nested = tree && store.nodeId ? getNodeChildren(tree.nodes, store.nodeId) : [];
		const inside = [floating, store.portalElement].filter(
			(element): element is HTMLElement => !!element
		);
		for (const node of nested) {
			const context = node.context;
			if (!context) continue;
			// Read the child elements so a nested popup that mounts later is kept visible.
			if (context.floatingElement) inside.push(context.floatingElement);
			if (context.portalElement) inside.push(context.portalElement);
		}
		const hideOutside = modal ? markOthers(inside, { ariaHidden: true, mark: false }) : () => {};
		const mark = markOthers(inside);
		let cancelFocus = () => {};

		const initialTarget = takeInitial(floating);
		if (initialTarget !== false) {
			cancelFocus = enqueueFocus(initialTarget, {
				preventScroll: initialTarget === floating,
				shouldFocus: () => store.isOpen() && !contains(floating, activeElement(doc))
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

		const stopFocus = on(doc, 'focusin', (event) => {
			if (!closeOnFocusOut || suppressFocusOut || !store.isOpen()) return;
			const target = getTarget(event);
			if (!(target instanceof Node)) return;
			if (contains(floating, target) || contains(store.portalElement, target)) return;
			if (contains(store.domReferenceElement, target)) return;
			if (target instanceof Element && target.closest(`[${CLICK_TRIGGER_IDENTIFIER}]`)) return;
			store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event));
		});

		store.events.on('openchange', noteClose);

		return () => {
			cancelFocus();
			hideOutside();
			mark();
			stopKeys();
			stopPointer();
			stopFocus();
			pointerDownTimeout.clear();
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
{#if modal && store.isOpen()}
	<FocusGuard
		data-type="inside"
		onfocus={() => {
			const floating = store.floatingElement;
			if (floating) focusEdge(floating, 'first');
		}}
	/>
{/if}
