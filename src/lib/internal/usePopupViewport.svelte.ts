// Derived from Base UI v1.8.0 packages/react/src/utils/usePopupViewport.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Previous content is a cloned node, not an HTML string. The copy is taken
// before the new trigger's content renders. Ids are stripped so aria links
// keep pointing at the live title and description. Copied controls lose
// `name` and get `form=""`, so the copy does not uncheck the live radio,
// does not submit, and does not block the ancestor form. They stay enabled,
// so the cross-fade does not pick up `:disabled` styles. `inert` on the
// shell does not do that.

import { getAbortSignal, untrack } from 'svelte';
import type { Middleware } from '@floating-ui/dom';
import { ScopedAnimationFrame } from '@sveltery/utils';
import { useDirection } from './direction-context.js';
import { runOnceAnimationsFinish } from './animations-finished.js';
import { adaptiveOriginMiddleware } from './adaptiveOriginMiddleware.js';
import { PopupAutoResize, type PopupAutoResizeStore } from './usePopupAutoResize.svelte.js';

export interface PopupViewportStore extends PopupAutoResizeStore {
	adaptiveOrigin: Middleware | undefined;
	/** Bumps when an open popup changes trigger. */
	readonly triggerSwitch: number;
	readonly switchedFrom: Element | null;
	readonly domReferenceElement: Element | null;
	resolvedActiveTriggerId(): string | null;
}

/** Cross-fades a popup's content between triggers and resizes it to fit. */
export class PopupViewport {
	currentEl = $state<HTMLDivElement | null>(null);
	previousNode = $state<HTMLElement | null>(null);
	/** The popup's size before the switch, for the previous pane's `--popup-*` variables. */
	previousSize = $state<{ width: number; height: number } | null>(null);
	activationDirection = $state<string | undefined>(undefined);
	showStarting = $state(false);
	// The pane remounts when the active trigger id changes. Upstream usePopupViewport also
	// remounts once more when the payload arrives on the next render. Here the payload is read
	// in the same flush as the id, so that second bump does not apply.
	readonly paneKey: string;
	private readonly frame = new ScopedAnimationFrame();

	constructor(
		private readonly store: PopupViewportStore,
		readSide: () => string | null
	) {
		this.paneKey = $derived(store.resolvedActiveTriggerId() ?? 'current');
		const direction = useDirection();

		$effect(() => {
			store.adaptiveOrigin = adaptiveOriginMiddleware;
			return () => {
				if (store.adaptiveOrigin === adaptiveOriginMiddleware) store.adaptiveOrigin = undefined;
			};
		});

		// Before the DOM updates, so the copy is the trigger we are leaving.
		$effect.pre(() => {
			const generation = store.triggerSwitch;
			if (generation === 0) return;
			const signal = getAbortSignal();
			untrack(() => this.beginSwitch(signal));
			return () => {
				this.frame.cancel();
				this.clearPrevious();
			};
		});

		new PopupAutoResize(
			store,
			readSide,
			() => direction.direction,
			(previous) => (this.previousSize = previous)
		);
	}

	get transitioning() {
		return this.previousNode != null;
	}

	mountPrevious = (host: HTMLElement) => {
		const node = this.previousNode;
		if (!node) return;
		if (host.firstChild !== node) host.replaceChildren(node);
		const size = this.previousSize;
		if (!size) return;
		host.style.setProperty('--popup-width', `${size.width}px`);
		host.style.setProperty('--popup-height', `${size.height}px`);
	};

	private clearPrevious() {
		this.previousNode = null;
		this.previousSize = null;
		this.activationDirection = undefined;
	}

	private beginSwitch(signal: AbortSignal) {
		const source = this.currentEl;
		const active = this.store.domReferenceElement;
		const previous = this.store.switchedFrom;
		if (!source || !active || !previous) return;
		this.previousNode = snapshot(source);
		this.activationDirection = directionBetween(previous, active);
		this.showStarting = true;
		this.frame.request(() => {
			if (signal.aborted) return;
			this.showStarting = false;
			const node = this.currentEl;
			if (!node) return;
			runOnceAnimationsFinish(
				node,
				() => {
					if (signal.aborted) return;
					this.clearPrevious();
				},
				signal,
				false
			);
		});
	}
}

function snapshot(source: HTMLElement) {
	const wrapper = source.ownerDocument.createElement('div');
	for (const child of source.childNodes) {
		const copy = child.cloneNode(true);
		if (child instanceof Element && copy instanceof Element) {
			copyControlState(child, copy);
			silenceCopiedControls(copy);
		}
		wrapper.appendChild(copy);
	}
	stripIds(wrapper);
	return wrapper;
}

function copyControlState(from: Element, to: Element) {
	const sources = controls(from);
	const targets = controls(to);
	sources.forEach((node, index) => {
		const dest = targets[index];
		if (!dest) return;
		if (node instanceof HTMLInputElement && dest instanceof HTMLInputElement) {
			dest.value = node.value;
			dest.checked = node.checked;
		} else if (node instanceof HTMLTextAreaElement && dest instanceof HTMLTextAreaElement) {
			dest.value = node.value;
		} else if (node instanceof HTMLSelectElement && dest instanceof HTMLSelectElement) {
			dest.value = node.value;
		}
	});
}

function controls(node: Element) {
	const found = [...node.querySelectorAll('input, textarea, select')];
	if (node.matches('input, textarea, select')) found.unshift(node);
	return found;
}

function silenceCopiedControls(node: Element) {
	const found = [...node.querySelectorAll('input, textarea, select, button')];
	if (node.matches('input, textarea, select, button')) found.unshift(node);
	for (const control of found) {
		control.removeAttribute('name');
		control.setAttribute('form', '');
	}
}

function stripIds(node: Element) {
	if (node.id) node.removeAttribute('id');
	for (const child of node.querySelectorAll('[id]')) child.removeAttribute('id');
}

function directionBetween(from: Element, to: Element) {
	const fromRect = from.getBoundingClientRect();
	const toRect = to.getBoundingClientRect();
	const horizontal = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
	const vertical = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
	return `${label(horizontal, 'right', 'left')} ${label(vertical, 'down', 'up')}`;
}

function label(value: number, positive: string, negative: string) {
	if (value > 5) return positive;
	if (value < -5) return negative;
	return '';
}
