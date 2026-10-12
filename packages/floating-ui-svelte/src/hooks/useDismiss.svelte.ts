// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/DismissInteraction.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// A press is inside when the target is in the floating element, the trigger, or a
// floating-tree child's floating element. The portal host is not inside.

import { on } from 'svelte/events';
import {
	createChangeEventDetails,
	REASONS,
	ownerDocument,
	platform,
	contains,
	getTarget,
	ScopedTimeout
} from '@sveltery/utils';
import { getNodeChildren } from '../components/FloatingTreeStore.js';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';

export type PressMode = 'sloppy' | 'intentional';

export type OutsidePressEvent =
	| PressMode
	| { mouse?: PressMode; touch?: PressMode }
	| (() => PressMode | { mouse?: PressMode; touch?: PressMode });

export interface UseDismissProps {
	enabled?: boolean;
	escapeKey?: boolean;
	outsidePress?: boolean | ((event: MouseEvent | PointerEvent | TouchEvent) => boolean);
	outsidePressEvent?: OutsidePressEvent;
	bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean };
}

function bubbleFlag(bubbles: UseDismissProps['bubbles'], key: 'escapeKey' | 'outsidePress') {
	if (typeof bubbles === 'boolean') return bubbles;
	return bubbles?.[key] ?? false;
}

function pressIsInside(store: FloatingRootStore, event: Event) {
	const target = getTarget(event);
	if (!(target instanceof Node)) return false;
	if (contains(store.floatingElement, target) || contains(store.popupElement, target)) return true;
	if (contains(store.domReferenceElement, target)) return true;
	return false;
}

function pointerIsTouch(event: Event, lastPointerType: string) {
	if (event instanceof PointerEvent && event.pointerType === 'touch') return true;
	if (event instanceof PointerEvent && event.pointerType) return false;
	if (event.type.startsWith('touch')) return true;
	// Upstream `getOutsidePressEvent` classifies the compatibility mousedown and the
	// click from the last pointerdown (`DismissInteraction.ts` `currentPointerTypeRef`).
	// Pen and an empty type stay mouse. A tap's click stays touch, so sloppy ignores it.
	return lastPointerType === 'touch';
}

function resolvePressMode(
	configured: PressMode | { mouse?: PressMode; touch?: PressMode },
	event: Event,
	lastPointerType: string
): PressMode {
	if (configured === 'sloppy' || configured === 'intentional') return configured;
	const touch = pointerIsTouch(event, lastPointerType);
	return configured[touch ? 'touch' : 'mouse'] ?? (touch ? 'sloppy' : 'intentional');
}

export class DismissInteraction {
	readonly #tree = useFloatingTree();
	readonly #compositionTimeout = new ScopedTimeout();
	readonly #cancelDismissOnEndTimeout = new ScopedTimeout();
	#composing = false;
	#sawPressWhileOpen = false;
	#pressStartedInside = false;
	/** The click after an inside press still belongs to that press. A cancel has no click. */
	#ignoreInsideReleaseClick = false;
	/** Pointer type from the last pointerdown. A later mousedown is still that gesture. */
	#lastPointerType = '';
	/** Sloppy touch: a tap dismisses on the browser's mousedown, a short move on touchend, a scroll during the move. */
	#touchState: {
		startX: number;
		startY: number;
		dismissOnTouchEnd: boolean;
		dismissOnMouseDown: boolean;
	} | null = null;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseDismissProps = () => ({})
	) {
		for (const key of ['escapeKeyBubbles', 'outsidePressBubbles'] as const) {
			Object.defineProperty(this.store.data, key, {
				configurable: true,
				enumerable: true,
				get: () => this.#options()[key]
			});
		}

		$effect(() => {
			const current = this.#options();
			if (!current.enabled || !this.store.isOpen()) {
				if (!this.store.isOpen()) {
					this.#sawPressWhileOpen = false;
					this.#pressStartedInside = false;
					this.#ignoreInsideReleaseClick = false;
					this.#touchState = null;
				}
				return;
			}

			const doc = ownerDocument(this.store.floatingElement ?? this.store.portalElement);
			const cleanups = [
				on(doc, 'compositionstart', () => {
					this.#compositionTimeout.clear();
					this.#composing = true;
				}),
				on(doc, 'compositionend', () => {
					this.#compositionTimeout.start(platform.engine.webkit ? 5 : 0, () => {
						this.#composing = false;
					});
				}),
				on(doc, 'keydown', this.#closeOnEscape),
				on(doc, 'pointerdown', (event) => {
					this.#lastPointerType = event.pointerType;
					if (event.button !== 0) return;
					this.#ignoreInsideReleaseClick = false;
					if (this.#insideDismissTree(event)) this.#pressStartedInside = true;
					else this.#sawPressWhileOpen = true;
					// Upstream `handlePointerDown` (DismissInteraction.ts 515–524): touch waits for
					// touchend, for the finger to scroll away, or for the compatibility mousedown.
					if (event.pointerType === 'touch') return;
					this.#closeOnOutside(event);
				}),
				on(
					doc,
					'mousedown',
					(event) => {
						// Upstream `closeOnPressOutsideCapture` (DismissInteraction.ts 592–597, listener at 724).
						// A plain tap closes here. A finger still down after 1000ms does not.
						if (this.#lastPointerType !== 'touch') return;
						if (this.#touchState && !this.#touchState.dismissOnMouseDown) return;
						this.#closeOnOutside(event);
					},
					{ capture: true }
				),
				on(
					doc,
					'touchstart',
					(event) => {
						// Upstream records the pointer on touchstart capture (`DismissInteraction.ts` 574–576).
						this.#lastPointerType = 'touch';
						this.#cancelDismissOnEndTimeout.clear();
						if (
							this.#pressMode(event) !== 'sloppy' ||
							!this.store.isOpen() ||
							!this.#options().enabled
						)
							return;
						if (this.#insideDismissTree(event)) return;
						const touch = event.touches[0];
						if (!touch) return;
						this.#touchState = {
							startX: touch.clientX,
							startY: touch.clientY,
							dismissOnTouchEnd: false,
							dismissOnMouseDown: true
						};
						this.#cancelDismissOnEndTimeout.start(1000, () => {
							if (!this.#touchState) return;
							this.#touchState.dismissOnTouchEnd = false;
							this.#touchState.dismissOnMouseDown = false;
						});
					},
					{ capture: true, passive: true }
				),
				on(
					doc,
					'touchmove',
					(event) => {
						if (
							this.#pressMode(event) !== 'sloppy' ||
							!this.#touchState ||
							this.#insideDismissTree(event)
						)
							return;
						const touch = event.touches[0];
						if (!touch) return;
						const deltaX = touch.clientX - this.#touchState.startX;
						const deltaY = touch.clientY - this.#touchState.startY;
						const distance = Math.hypot(deltaX, deltaY);
						if (distance > 5) this.#touchState.dismissOnTouchEnd = true;
						if (distance > 10) {
							this.#closeOnOutside(event);
							this.#cancelDismissOnEndTimeout.clear();
							this.#touchState = null;
						}
					},
					{ capture: true, passive: true }
				),
				on(
					doc,
					'touchend',
					(event) => {
						if (
							this.#pressMode(event) !== 'sloppy' ||
							!this.#touchState ||
							this.#insideDismissTree(event)
						) {
							this.#cancelDismissOnEndTimeout.clear();
							this.#touchState = null;
							return;
						}
						if (this.#touchState.dismissOnTouchEnd) this.#closeOnOutside(event);
						this.#cancelDismissOnEndTimeout.clear();
						this.#touchState = null;
					},
					{ capture: true, passive: true }
				),
				on(
					doc,
					'pointerup',
					() => {
						if (!this.#pressStartedInside) return;
						this.#pressStartedInside = false;
						this.#ignoreInsideReleaseClick = true;
					},
					{ capture: true }
				),
				on(
					doc,
					'pointercancel',
					() => {
						// A cancelled gesture, such as a scroll, produces no click.
						this.#sawPressWhileOpen = false;
						this.#pressStartedInside = false;
						this.#ignoreInsideReleaseClick = false;
					},
					{ capture: true }
				),
				on(doc, 'click', (event) => {
					const startedInside = this.#pressStartedInside || this.#ignoreInsideReleaseClick;
					this.#pressStartedInside = false;
					this.#ignoreInsideReleaseClick = false;
					if (startedInside) return;
					this.#closeOnOutside(event);
				})
			];
			return () => {
				for (const cleanup of cleanups) cleanup();
				this.#compositionTimeout.clear();
				this.#cancelDismissOnEndTimeout.clear();
				this.#touchState = null;
			};
		});
	}

	#options() {
		const value = this.props();
		const outsidePressEvent = value.outsidePressEvent ?? 'sloppy';
		return {
			enabled: value.enabled ?? true,
			escapeKey: value.escapeKey ?? true,
			outsidePress: value.outsidePress ?? true,
			outsidePressEvent:
				typeof outsidePressEvent === 'function' ? outsidePressEvent() : outsidePressEvent,
			escapeKeyBubbles: bubbleFlag(value.bubbles, 'escapeKey'),
			outsidePressBubbles: bubbleFlag(value.bubbles, 'outsidePress')
		};
	}

	#pressMode(event: Event) {
		return resolvePressMode(this.#options().outsidePressEvent, event, this.#lastPointerType);
	}

	#childBlocks(key: 'escapeKeyBubbles' | 'outsidePressBubbles') {
		if (!this.#tree || !this.store.nodeId) return false;
		return getNodeChildren(this.#tree.nodes, this.store.nodeId).some((node) => {
			const context = node.context;
			return !!context?.isOpen() && !context.data[key];
		});
	}

	#targetIsTrigger(event: Event) {
		const target = getTarget(event);
		if (!(target instanceof Element)) return false;
		return (
			this.store.triggers.hasElement(target) ||
			this.store.triggers.hasMatchingElement((trigger) => contains(trigger, target))
		);
	}

	#insideDismissTree(event: Event) {
		if (pressIsInside(this.store, event) || this.#targetIsTrigger(event)) return true;
		if (!this.#tree || !this.store.nodeId) return false;
		const target = getTarget(event);
		if (!(target instanceof Node)) return false;
		return getNodeChildren(this.#tree.nodes, this.store.nodeId).some((node) => {
			const context = node.context;
			if (!context) return false;
			return contains(context.floatingElement, target) || contains(context.popupElement, target);
		});
	}

	#closeOnEscape = (event: KeyboardEvent) => {
		const current = this.#options();
		if (!this.store.isOpen() || !current.enabled || !current.escapeKey || event.key !== 'Escape')
			return;
		if (this.#composing) return;
		if (!current.escapeKeyBubbles && this.#childBlocks('escapeKeyBubbles')) return;
		const details = createChangeEventDetails(REASONS.escapeKey, event);
		this.store.setOpen(false, details);
		if (!details.isCanceled) event.preventDefault();
		if (!current.escapeKeyBubbles && !details.isPropagationAllowed) event.stopPropagation();
	};

	#closeOnOutside(event: MouseEvent | PointerEvent | TouchEvent) {
		const current = this.#options();
		const mode = this.#pressMode(event);
		if (!this.store.isOpen() || !current.enabled || current.outsidePress === false) return;
		if (mode === 'intentional' && event.type !== 'click') return;
		if (mode === 'sloppy' && event.type === 'click') return;
		if (event.type === 'pointerdown' && 'button' in event && event.button !== 0) return;
		if (this.#insideDismissTree(event)) return;
		if (this.#pressStartedInside) return;
		if (mode === 'intentional' && !this.#sawPressWhileOpen && event.detail !== 0) return;
		if (typeof current.outsidePress === 'function' && !current.outsidePress(event)) return;
		if (!current.outsidePressBubbles && this.#childBlocks('outsidePressBubbles')) return;
		this.store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
	}

	readonly reference = { onkeydown: this.#closeOnEscape };
	readonly floating = { onkeydown: this.#closeOnEscape };
	readonly trigger = { onkeydown: this.#closeOnEscape };
}
