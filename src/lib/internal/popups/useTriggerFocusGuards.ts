// Derived from Base UI v1.8.0 packages/react/src/utils/popups/useTriggerFocusGuards.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Closing writes state with flushSync so the popup leaves the tab order before focus moves.

import { flushSync } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { createChangeEventDetails, REASONS } from '../event-details.js';
import { contains } from '../shadow-dom.js';
import {
	getTabbableAfterElement,
	getTabbableBeforeElement,
	isOutsideEvent
} from '../floating-ui-react/utils/tabbable.js';
import type { FloatingRootStore } from '../floating-ui-react/components/FloatingRootStore.svelte.js';

export function useTriggerFocusGuards(
	store: FloatingRootStore,
	triggerElement: () => HTMLElement | null
) {
	let preFocusGuard: HTMLElement | null = null;
	let beforeContentFocusGuard: HTMLElement | null = null;
	let triggerFocusTarget: HTMLElement | null = null;

	function handlePreFocusGuardFocus(event: FocusEvent) {
		const current = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
		flushSync(() => {
			store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event, current));
		});
		getTabbableBeforeElement(preFocusGuard)?.focus();
	}

	function handleFocusTargetFocus(event: FocusEvent) {
		const positioner = store.positionerElement;
		if (positioner && isOutsideEvent(event, positioner)) {
			beforeContentFocusGuard?.focus();
			return;
		}
		const current = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
		flushSync(() => {
			store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event, current));
		});
		let next = getTabbableAfterElement(triggerFocusTarget || triggerElement());
		while (next && positioner && contains(positioner, next)) {
			const previous = next;
			next = getTabbableAfterElement(next);
			if (next === previous) break;
		}
		next?.focus();
	}

	const bindPre: Attachment<HTMLElement> = (node) => {
		preFocusGuard = node;
		return () => {
			if (preFocusGuard === node) preFocusGuard = null;
		};
	};
	const bindBeforeContent: Attachment<HTMLElement> = (node) => {
		beforeContentFocusGuard = node;
		return () => {
			if (beforeContentFocusGuard === node) beforeContentFocusGuard = null;
		};
	};
	const bindFocusTarget: Attachment<HTMLElement> = (node) => {
		triggerFocusTarget = node;
		store.triggerFocusTarget = node;
		return () => {
			if (triggerFocusTarget === node) triggerFocusTarget = null;
			if (store.triggerFocusTarget === node) store.triggerFocusTarget = null;
		};
	};

	return {
		preFocusGuardProps: { onfocus: handlePreFocusGuardFocus, attach: bindPre },
		beforeContentFocusGuardProps: { attach: bindBeforeContent },
		focusTargetProps: { onfocus: handleFocusTargetFocus, attach: bindFocusTarget }
	};
}
