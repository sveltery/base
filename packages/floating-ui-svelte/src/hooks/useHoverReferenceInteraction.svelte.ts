// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useHoverReferenceInteraction.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Hover open is a `$state` write in the same turn. There is no `flushSync`.

import { untrack } from 'svelte';
import { on } from 'svelte/events';
import { createChangeEventDetails, REASONS, ownerDocument, contains } from '@sveltery/utils';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingTreeStore } from '../components/FloatingTreeStore.js';
import { isTargetInsideEnabledTrigger } from '../utils/element.js';
import { isMouseLikePointerType } from '../utils/event.js';
import type { HandleClose } from '../safePolygon.js';
import {
	applySafePolygonPointerEventsMutation,
	clearSafePolygonPointerEventsMutation,
	hoverInteraction
} from './useHoverInteractionSharedState.svelte.js';
import { getDelay, getRestMs, isClickLikeOpenEvent } from './useHoverShared.js';

export interface UseHoverReferenceProps {
	enabled?: boolean;
	handleClose?: HandleClose | null;
	restMs?: number | (() => number);
	delay?:
		| number
		| Partial<{ open: number; close: number }>
		| (() => number | Partial<{ open: number; close: number }>);
	move?: boolean;
	mouseOnly?: boolean;
	shouldOpen?: () => boolean;
	guardStaleOpen?: boolean;
	placement?: () => string | null;
	/** The tree to use instead of the one in context, for a trigger outside its popup's tree. */
	externalTree?: FloatingTreeStore;
}

export class HoverReferenceInteraction {
	readonly #tree: FloatingTreeStore | null;
	readonly #instance: ReturnType<typeof hoverInteraction>;
	#hoverCloseActive = false;
	#sawMove = false;
	#stopMove: (() => void) | undefined;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseHoverReferenceProps = () => ({})
	) {
		this.#tree = untrack(() => props().externalTree) ?? useFloatingTree();
		this.#instance = hoverInteraction(store);

		$effect(() => {
			if (!this.#options().enabled) return;
			const onOpenChange = (payload?: unknown) => {
				const details = payload as { open?: boolean; reason?: string } | undefined;
				if (!details?.open) {
					this.#hoverCloseActive = details?.reason === REASONS.triggerHover;
					this.#cleanupMouseMove();
					this.#instance.openChangeTimeout.clear();
					this.#instance.restTimeout.clear();
					this.#instance.blockMouseMove = true;
					this.#instance.restTimeoutPending = false;
				} else {
					this.#hoverCloseActive = false;
				}
			};
			return this.store.events.on('openchange', onOpenChange);
		});

		$effect(() => {
			return () => {
				this.#cleanupMouseMove();
				this.#instance.handleClose?.clear?.();
				this.#instance.dispose();
			};
		});
	}

	#options() {
		const value = this.props();
		return {
			enabled: value.enabled ?? true,
			handleClose: value.handleClose ?? null,
			restMs: value.restMs ?? 0,
			delay: value.delay ?? 0,
			move: value.move ?? true,
			mouseOnly: value.mouseOnly ?? false,
			shouldOpen: value.shouldOpen,
			guardStaleOpen: value.guardStaleOpen ?? false,
			placement: value.placement
		};
	}

	#clickLike() {
		return isClickLikeOpenEvent(this.store.data.openEvent?.type, this.#instance.interactedInside);
	}

	#allowOpen() {
		return this.#options().shouldOpen?.() !== false;
	}

	/** The pointer is over a trigger other than the active one. */
	#isOverInactive(trigger: Element, target: EventTarget | null) {
		const reference = this.store.domReferenceElement;
		const triggers = this.store.triggers;
		if (triggers.hasElement(trigger)) return !reference || !contains(reference, trigger);
		// A handler on a wrapper finds the trigger from the event target.
		if (!(target instanceof Element)) return false;
		return (
			triggers.hasMatchingElement((element) => contains(element, target)) &&
			(!reference || !contains(reference, target))
		);
	}

	#cleanupMouseMove() {
		this.#stopMove?.();
		this.#stopMove = undefined;
		this.#instance.handler = undefined;
	}

	#closeWithDelay(event: MouseEvent, runElse = true) {
		const closeDelay = getDelay(this.#options().delay, 'close', this.#instance.pointerType);
		if (closeDelay) {
			this.#instance.openChangeTimeout.start(closeDelay, () => {
				this.store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
				this.#tree?.events.emit('floating.closed', event);
			});
		} else if (runElse) {
			this.#instance.openChangeTimeout.clear();
			this.store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
			this.#tree?.events.emit('floating.closed', event);
		}
	}

	#commitOpen(event: MouseEvent, trigger: HTMLElement | undefined) {
		if (!this.#allowOpen()) return false;
		const details = createChangeEventDetails(REASONS.triggerHover, event, trigger);
		this.store.setOpen(true, details);
		return !details.isCanceled;
	}

	#onMouseEnter(event: MouseEvent) {
		const current = this.#options();
		if (!current.enabled) return;
		const trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
		this.#instance.openChangeTimeout.clear();
		this.#instance.blockMouseMove = false;
		if (current.mouseOnly && !isMouseLikePointerType(this.#instance.pointerType)) return;
		const restMsValue = getRestMs(current.restMs);
		const openDelay = getDelay(current.delay, 'open', this.#instance.pointerType);
		const isOpen = this.store.isOpen();
		const overInactive = trigger != null && this.#isOverInactive(trigger, event.target);
		const closing = !isOpen && this.store.transitionStatus === 'ending' && this.#hoverCloseActive;
		if ((isOpen && overInactive) || closing) {
			this.#commitOpen(event, trigger);
			return;
		}
		if (restMsValue > 0 && !openDelay) return;
		if (openDelay) {
			this.#instance.openChangeTimeout.start(openDelay, () => {
				if (!this.store.isOpen()) this.#commitOpen(event, trigger);
			});
		} else if (!isOpen) {
			this.#commitOpen(event, trigger);
		}
	}

	#onMouseLeave(event: MouseEvent) {
		const current = this.#options();
		if (!current.enabled) return;
		if (this.#clickLike()) {
			clearSafePolygonPointerEventsMutation(this.#instance);
			return;
		}
		this.#cleanupMouseMove();
		this.#instance.restTimeout.clear();
		this.#instance.restTimeoutPending = false;
		if (isTargetInsideEnabledTrigger(event.relatedTarget, this.store.triggers.elements())) return;
		const handleClose = current.handleClose;
		if (handleClose && this.store.domReferenceElement && this.store.floatingElement) {
			if (!this.store.isOpen()) this.#instance.openChangeTimeout.clear();
			const currentTrigger = this.store.domReferenceElement;
			const handler = handleClose({
				x: event.clientX,
				y: event.clientY,
				placement: current.placement?.() ?? null,
				elements: {
					domReference: this.store.domReferenceElement,
					floating: this.store.floatingElement
				},
				tree: this.#tree,
				nodeId: this.store.nodeId ?? undefined,
				onClose: () => {
					clearSafePolygonPointerEventsMutation(this.#instance);
					this.#cleanupMouseMove();
					if (
						this.#options().enabled &&
						!this.#clickLike() &&
						currentTrigger === this.store.domReferenceElement
					) {
						this.#closeWithDelay(event, true);
					}
				}
			});
			this.#instance.handler = handler;
			this.#stopMove = on(ownerDocument(this.store.domReferenceElement), 'mousemove', handler);
			handler(event);
			return;
		}
		const shouldClose =
			this.#instance.pointerType === 'touch'
				? !contains(
						this.store.floatingElement,
						event.relatedTarget instanceof Node ? event.relatedTarget : null
					)
				: true;
		if (shouldClose) this.#closeWithDelay(event);
	}

	#onMouseOut(event: MouseEvent) {
		if (!(event.currentTarget instanceof Element)) return;
		if (contains(event.currentTarget, event.relatedTarget)) return;
		this.#instance.openChangeTimeout.clear();
		this.#instance.restTimeout.clear();
		this.#instance.restTimeoutPending = false;
	}

	#onMouseMove(event: MouseEvent) {
		const current = this.#options();
		if (!current.enabled) return;
		const trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
		const overInactive = trigger != null && this.#isOverInactive(trigger, event.target);
		if (current.mouseOnly && !isMouseLikePointerType(this.#instance.pointerType)) return;
		const isOpen = this.store.isOpen();
		// Moving onto another trigger while open switches to it at once. Upstream keeps the
		// active trigger while closed, so only an open popup has an inactive trigger. Here a
		// closed popup can have none, which must not let a later open re-announce.
		const switching = isOpen && overInactive;
		if (
			switching &&
			this.#instance.handleCloseOptions?.blockPointerEvents &&
			trigger &&
			this.store.floatingElement
		) {
			applySafePolygonPointerEventsMutation(this.#instance, {
				scopeElement: this.#instance.handleCloseOptions.getScope?.() ?? trigger.ownerDocument.body,
				referenceElement: trigger,
				floatingElement: this.store.floatingElement
			});
		}
		const restMsValue = getRestMs(current.restMs);
		if ((isOpen && !switching) || restMsValue === 0) return;
		if (
			!switching &&
			this.#instance.restTimeoutPending &&
			event.movementX ** 2 + event.movementY ** 2 < 2
		)
			return;
		this.#instance.restTimeout.clear();
		const open = () => {
			this.#instance.restTimeoutPending = false;
			if (this.#clickLike()) return;
			if (!this.#instance.blockMouseMove && (!this.store.isOpen() || switching))
				this.#commitOpen(event, trigger ?? undefined);
		};
		if (this.#instance.pointerType === 'touch' || switching) open();
		else {
			this.#instance.restTimeoutPending = true;
			this.#instance.restTimeout.start(restMsValue, open);
		}
	}

	#onPointer(event: PointerEvent) {
		this.#instance.pointerType = event.pointerType;
	}

	/** Clears the safe-polygon close timer when this trigger unmounts. */
	attachReference = (node: Element) => {
		this.#instance.handleCloseByTrigger.set(node, () => {
			const current = this.#options();
			return current.enabled ? current.handleClose : null;
		});
		return () => {
			if (this.store.domReferenceElement === node) this.#instance.handleClose?.clear?.();
			this.#instance.handleCloseByTrigger.delete(node);
		};
	};

	readonly reference = {
		onpointerdown: (event: PointerEvent) => this.#onPointer(event),
		onpointerenter: (event: PointerEvent) => this.#onPointer(event),
		onmouseenter: (event: MouseEvent) => this.#onMouseEnter(event),
		onmouseleave: (event: MouseEvent) => this.#onMouseLeave(event),
		onmousemove: (event: MouseEvent) => {
			if (this.#options().move && !this.#sawMove) {
				this.#sawMove = true;
				this.#onMouseEnter(event);
			}
			this.#onMouseMove(event);
		},
		onmouseout: (event: MouseEvent) => {
			if (this.#options().guardStaleOpen) this.#onMouseOut(event);
		}
	};
}
