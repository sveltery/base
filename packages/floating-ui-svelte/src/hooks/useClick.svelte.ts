// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useClick.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). The virtual press and the `input-press`
// reason follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import {
	createChangeEventDetails,
	REASONS,
	getTarget,
	platform,
	ScopedAnimationFrame,
	ScopedTimeout,
	type OpenInteractionType,
	useOpenInteractionType
} from '@sveltery/utils';
import { isTypeableElement } from '../utils/element.js';
import { isMouseLikePointerType, isVirtualPointerEvent } from '../utils/event.js';

export interface UseClickProps {
	enabled?: boolean;
	event?: 'click' | 'mousedown' | 'mousedown-only';
	toggle?: boolean;
	ignoreMouse?: boolean;
	stickIfOpen?: boolean;
	touchOpenDelay?: number;
	reason?: typeof REASONS.triggerPress | typeof REASONS.inputPress;
}

type PointerKind = 'mouse' | 'pen' | 'touch' | 'virtual' | undefined;

export class ClickInteraction {
	readonly #frame = new ScopedAnimationFrame();
	readonly #touchOpenTimeout = new ScopedTimeout();
	#pointerType: PointerKind;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseClickProps = () => ({})
	) {}

	#options() {
		const value = this.props();
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

	#setOpenWithTouchDelay(
		nextOpen: boolean,
		nativeEvent: MouseEvent,
		target: HTMLElement,
		method: OpenInteractionType
	) {
		const { store } = this;
		const { reason, touchOpenDelay } = this.#options();
		const details = createChangeEventDetails(reason, nativeEvent, target);
		const commit = () => {
			const opening = nextOpen && !store.isOpen();
			const previous = store.openMethod;
			if (opening) store.openMethod = method;
			store.setOpen(nextOpen, details);
			if (opening && details.isCanceled) store.openMethod = previous;
		};
		if (nextOpen && method === 'touch' && touchOpenDelay > 0) {
			this.#touchOpenTimeout.start(touchOpenDelay, commit);
			return;
		}
		commit();
	}

	#getNextOpen(
		open: boolean,
		currentTarget: EventTarget | null,
		isClickLikeOpenEvent: (eventType: string | undefined) => boolean
	) {
		const { toggle, stickIfOpen } = this.#options();
		const openEvent = this.store.data.openEvent;
		if (open && this.store.domReferenceElement !== currentTarget) return true;
		if (!open || !toggle) return true;
		if (openEvent && stickIfOpen) return !isClickLikeOpenEvent(openEvent.type);
		return false;
	}

	readonly reference = {
		onpointerdown: (event: PointerEvent) => {
			if (!this.#options().enabled) return;
			this.#pointerType =
				isMouseLikePointerType(event.pointerType, true) && isVirtualPointerEvent(event)
					? 'virtual'
					: (event.pointerType as PointerKind);
			// Upstream `useOpenInteractionType` records the press on a closed trigger, so a popup
			// that opens from it through another handler still knows how it was opened.
			if (event.defaultPrevented || this.store.isOpen()) return;
			this.store.openMethod = (event.pointerType ||
				(platform.os.ios ? 'touch' : '')) as OpenInteractionType;
		},
		onmousedown: (event: MouseEvent) => {
			const { enabled, event: eventOption, ignoreMouse } = this.#options();
			if (!enabled || event.button !== 0 || eventOption === 'click') return;
			if (isMouseLikePointerType(this.#pointerType, true) && ignoreMouse) return;
			const nextOpen = this.#getNextOpen(
				this.store.isOpen(),
				event.currentTarget,
				(openEventType) => openEventType === 'click' || openEventType === 'mousedown'
			);
			const pointerType = this.#pointerType;
			const method = useOpenInteractionType(event, pointerType);
			if (eventOption === 'mousedown-only') this.#pointerType = undefined;
			const target = getTarget(event);
			if (isTypeableElement(target) && target instanceof HTMLElement) {
				this.#setOpenWithTouchDelay(nextOpen, event, target, method);
				return;
			}
			const currentTarget = event.currentTarget;
			if (!(currentTarget instanceof HTMLElement)) return;
			// A screen reader press opens at once, so the popup's focus lands before the reader
			// moves focus back to its cursor. A virtual press may target a descendant of the trigger.
			if (pointerType === 'virtual') {
				this.#setOpenWithTouchDelay(nextOpen, event, currentTarget, method);
				return;
			}
			this.#frame.request(() =>
				this.#setOpenWithTouchDelay(nextOpen, event, currentTarget, method)
			);
		},
		onclick: (event: MouseEvent) => {
			const { enabled, event: eventOption, ignoreMouse } = this.#options();
			if (!enabled) return;
			const remembered = this.#pointerType;
			const method = useOpenInteractionType(event, remembered);
			const hadPointer = remembered !== undefined;
			this.#pointerType = undefined;
			if (eventOption === 'mousedown-only') return;
			if (eventOption === 'mousedown' && hadPointer) return;
			if (isMouseLikePointerType(remembered, true) && ignoreMouse) return;
			const currentTarget = event.currentTarget;
			if (!(currentTarget instanceof HTMLElement)) return;
			const nextOpen = this.#getNextOpen(
				this.store.isOpen(),
				currentTarget,
				(openEventType) =>
					openEventType === 'click' ||
					openEventType === 'mousedown' ||
					openEventType === 'keydown' ||
					openEventType === 'keyup'
			);
			this.#setOpenWithTouchDelay(nextOpen, event, currentTarget, method);
		},
		onkeydown: () => {
			if (!this.#options().enabled) return;
			this.#pointerType = undefined;
		}
	};
}
