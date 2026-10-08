<script lang="ts">
	// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx
	// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	// The trap is focus guards plus aria-hidden on outside nodes. It does not set the inert attribute.

	import { on } from 'svelte/events';
	import type { Snippet } from 'svelte';
	import { createChangeEventDetails, REASONS } from '../../event-details.js';
	import FocusGuard from '../../FocusGuard.svelte';
	import { ownerDocument } from '../../owner.js';
	import { activeElement, contains, getTarget } from '../../shadow-dom.js';
	import { Timeout } from '../../timeout.js';
	import type { FloatingRootStore } from './FloatingRootStore.svelte.js';
	import { CLICK_TRIGGER_IDENTIFIER } from '../utils/constants.js';
	import { enqueueFocus } from '../utils/enqueueFocus.js';
	import { markOthers } from '../utils/markOthers.js';
	import { getTabbableCandidates } from '../utils/tabbable.js';

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
		initialFocus?: boolean | HTMLElement | null;
		returnFocus?: boolean;
		modal?: boolean;
		closeOnFocusOut?: boolean;
	} = $props();

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

	function restoreReturnFocus(target: HTMLElement | null) {
		// isOpen() is still true inside the effect cleanup that runs because it became false.
		queueMicrotask(() => {
			if (!returnFocus || !target?.isConnected || store.isOpen()) return;
			const doc = ownerDocument(target);
			const active = activeElement(doc);
			const floating = store.floatingElement;
			const inside =
				contains(floating, active) ||
				contains(store.portalElement, active) ||
				active === doc.body ||
				active == null;
			if (!inside) return;
			target.focus({ preventScroll: true });
			returnTarget = null;
		});
	}

	$effect(() => {
		if (disabled || !store.isOpen()) return;
		const floating = store.floatingElement;
		if (!floating) return;

		const doc = ownerDocument(floating);
		captureReturnTarget(doc, floating);
		const inside = [floating, store.portalElement].filter(
			(element): element is HTMLElement => !!element
		);
		const hideOutside = modal ? markOthers(inside, { ariaHidden: true, mark: false }) : () => {};
		const mark = markOthers(inside);
		let cancelFocus = () => {};

		if (initialFocus !== false) {
			const explicit = initialFocus instanceof HTMLElement ? initialFocus : null;
			const target = explicit ?? tabbables(floating)[0] ?? floating;
			cancelFocus = enqueueFocus(target, {
				preventScroll: target === floating,
				shouldFocus: () => store.isOpen() && !contains(floating, activeElement(doc))
			});
		}

		const stopKeys = on(doc, 'keydown', (event) => {
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

		return () => {
			cancelFocus();
			hideOutside();
			mark();
			stopKeys();
			stopPointer();
			stopFocus();
			pointerDownTimeout.clear();
			restoreReturnFocus(returnTarget);
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
