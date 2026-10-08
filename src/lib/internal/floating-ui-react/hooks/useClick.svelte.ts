// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useClick.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { createChangeEventDetails, REASONS } from '../../event-details.js';
import { getTarget } from '../../shadow-dom.js';
import { AnimationFrame, Timeout } from '../../timeout.js';
import { PopupStore } from '../../popups/store.svelte.js';
import { useOpenInteractionType } from '../../popups/useOpenInteractionType.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { isTypeableElement } from '../utils/element.js';
import { isMouseLikePointerType, isVirtualPointerEvent } from '../utils/event.js';

export interface UseClickProps {
	enabled?: boolean;
	event?: 'click' | 'mousedown' | 'mousedown-only';
	toggle?: boolean;
	ignoreMouse?: boolean;
	stickIfOpen?: boolean;
	touchOpenDelay?: number;
	reason?: typeof REASONS.triggerPress;
}

export function useClick(store: FloatingRootStore, props: () => UseClickProps = () => ({})) {
	const frame = AnimationFrame.create();
	const touchOpenTimeout = Timeout.create();
	let pointerType: 'mouse' | 'pen' | 'touch' | 'virtual' | undefined;
	let fromKeyboard = false;

	function options() {
		const value = props();
		return {
			enabled: value.enabled ?? true,
			event: value.event ?? 'click',
			toggle: value.toggle ?? true,
			ignoreMouse: value.ignoreMouse ?? false,
			stickIfOpen: value.stickIfOpen ?? true,
			touchOpenDelay: value.touchOpenDelay ?? 0,
			reason: value.reason ?? REASONS.triggerPress
		};
	}

	function setOpenWithTouchDelay(
		nextOpen: boolean,
		nativeEvent: MouseEvent,
		target: HTMLElement,
		kind: typeof pointerType
	) {
		const { reason, touchOpenDelay } = options();
		const details = createChangeEventDetails(reason, nativeEvent, target);
		const openedByKeyboard = fromKeyboard;
		fromKeyboard = false;
		const popup = store instanceof PopupStore ? store : null;
		const previousMethod = popup?.openMethod ?? null;
		const record = () => {
			if (nextOpen && popup) popup.openMethod = useOpenInteractionType(kind, openedByKeyboard);
		};
		const restore = () => {
			if (popup && details.isCanceled) popup.openMethod = previousMethod;
		};
		if (nextOpen && kind === 'touch' && touchOpenDelay > 0) {
			touchOpenTimeout.start(touchOpenDelay, () => {
				record();
				store.setOpen(true, details);
				restore();
			});
			return;
		}
		record();
		store.setOpen(nextOpen, details);
		restore();
	}

	function getNextOpen(
		open: boolean,
		currentTarget: EventTarget | null,
		isClickLikeOpenEvent: (eventType: string | undefined) => boolean
	) {
		const { toggle, stickIfOpen } = options();
		const openEvent = store.data.openEvent;
		if (open && store.domReferenceElement !== currentTarget) return true;
		if (!open || !toggle) return true;
		if (openEvent && stickIfOpen) return !isClickLikeOpenEvent(openEvent.type);
		return false;
	}

	function remember(event: Event) {
		if (event.currentTarget instanceof Element) store.domReferenceElement = event.currentTarget;
	}

	return {
		reference: {
			onpointerdown(event: PointerEvent) {
				if (!options().enabled) return;
				fromKeyboard = false;
				remember(event);
				pointerType =
					isMouseLikePointerType(event.pointerType, true) && isVirtualPointerEvent(event)
						? 'virtual'
						: (event.pointerType as typeof pointerType);
			},
			onmousedown(event: MouseEvent) {
				const { enabled, event: eventOption, ignoreMouse } = options();
				if (!enabled || event.button !== 0 || eventOption === 'click') return;
				if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
				remember(event);
				const nextOpen = getNextOpen(
					store.isOpen(),
					event.currentTarget,
					(openEventType) => openEventType === 'click' || openEventType === 'mousedown'
				);
				const target = getTarget(event);
				if (isTypeableElement(target) && target instanceof HTMLElement) {
					setOpenWithTouchDelay(nextOpen, event, target, pointerType);
					return;
				}
				const currentTarget = event.currentTarget;
				if (!(currentTarget instanceof HTMLElement)) return;
				frame.request(() => setOpenWithTouchDelay(nextOpen, event, currentTarget, pointerType));
			},
			onclick(event: MouseEvent) {
				const { enabled, event: eventOption, ignoreMouse } = options();
				if (!enabled || eventOption === 'mousedown-only') return;
				if (eventOption === 'mousedown' && pointerType) {
					pointerType = undefined;
					return;
				}
				if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
				remember(event);
				const currentTarget = event.currentTarget;
				if (!(currentTarget instanceof HTMLElement)) return;
				const nextOpen = getNextOpen(
					store.isOpen(),
					currentTarget,
					(openEventType) =>
						openEventType === 'click' ||
						openEventType === 'mousedown' ||
						openEventType === 'keydown' ||
						openEventType === 'keyup'
				);
				setOpenWithTouchDelay(nextOpen, event, currentTarget, pointerType);
			},
			onkeydown() {
				if (!options().enabled) return;
				fromKeyboard = true;
				pointerType = undefined;
			}
		}
	};
}
