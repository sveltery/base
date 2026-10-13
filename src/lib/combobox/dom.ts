// Derived from Base UI v1.9.0 packages/react/src/combobox/utils/handleInputPress.ts,
// packages/react/src/floating-ui-react/utils/event.ts (stopEvent) and
// packages/react/src/internals/useInitialLiveRegionTextMutation.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { isInteractiveElement } from '@sveltery/floating-ui-svelte';
import { createChangeEventDetails, getTarget, platform, REASONS } from '@sveltery/utils';
import type { ComboboxStore } from './store.svelte.js';

/** A press on the input group or chips focuses the input and opens the popup. */
export function handleInputPress(
	event: MouseEvent,
	store: ComboboxStore,
	disabled: boolean,
	shouldIgnoreTarget?: (target: Element | null) => boolean
) {
	const target = getTarget(event);
	const element = target instanceof Element ? target : null;
	if (
		element !== event.currentTarget &&
		(shouldIgnoreTarget?.(element) || isInteractiveElement(element))
	) {
		return;
	}
	event.preventDefault();
	if (disabled) return;
	store.inputElement?.focus();
	if (store.root.openOnInputClick) {
		store.setOpen(true, createChangeEventDetails(REASONS.inputPress, event));
	}
}

// The word joiner is invisible and zero-width, so it changes the text without shifting layout.
const LIVE_REGION_MARKER = '⁠';
// Safari VoiceOver needs about 200ms to notice the first polite live-region change.
const MARKER_RESET_DELAY = 200;

function findLastTextNode(root: HTMLElement): Text | null {
	const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let last: Text | null = null;
	while (walker.nextNode()) {
		const node = walker.currentNode as Text;
		if (node.nodeValue !== '') last = node;
	}
	return last;
}

/**
 * Attachment for a polite live region. Screen readers skip the text a region mounts with, so
 * the last text node is changed once to announce it.
 */
export function announceInitialText(root: HTMLElement) {
	if (platform.os.ios) return;
	const node = findLastTextNode(root);
	if (!node) return;
	const original = node.data;
	const marked = `${original}${LIVE_REGION_MARKER}`;
	node.nodeValue = marked;
	const restore = () => {
		if (node.nodeValue === marked) node.nodeValue = original;
	};
	const timeout = setTimeout(restore, MARKER_RESET_DELAY);
	return () => {
		clearTimeout(timeout);
		restore();
	};
}

export function stopEvent(event: Event) {
	event.preventDefault();
	event.stopPropagation();
}
