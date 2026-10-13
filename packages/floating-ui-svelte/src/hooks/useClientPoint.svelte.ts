// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useClientPoint.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `FloatingRootStore.referenceElement` is a fixed getter, so this class writes through
// `setReference` and the consumer store prefers that value. `null` means "use the trigger",
// which is what upstream restores by writing the trigger back into `positionReference`.
// Upstream has no explicit `x`/`y` options in this version, so none are ported.

import { untrack } from 'svelte';
import { on } from 'svelte/events';
import type { VirtualElement } from '@floating-ui/dom';
import { contains, getTarget, ownerWindow } from '@sveltery/utils';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { isMouseLikePointerType } from '../utils/event.js';

type Axis = 'x' | 'y' | 'both';

export interface UseClientPointProps {
	enabled?: boolean;
	/**
	 * Restricts the cursor to one axis. The trigger supplies the other axis.
	 * @default 'both'
	 */
	axis?: Axis;
	/** Receives the cursor-following element, or `null` to fall back to the trigger. */
	setReference: (reference: VirtualElement | null) => void;
}

function isMouseBasedEvent(event: Event | undefined): event is MouseEvent {
	return event != null && (event as MouseEvent).clientX != null;
}

function createVirtualElement(
	domElement: Element | null,
	data: {
		axis: Axis;
		store: FloatingRootStore;
		pointerType: string | undefined;
		x: number;
		y: number;
	}
): VirtualElement {
	let offsetX: number | null = null;
	let offsetY: number | null = null;
	let isAutoUpdateEvent = false;

	return {
		contextElement: domElement ?? undefined,
		getBoundingClientRect() {
			const domRect = domElement?.getBoundingClientRect() ?? { width: 0, height: 0, x: 0, y: 0 };

			const isXAxis = data.axis === 'x' || data.axis === 'both';
			const isYAxis = data.axis === 'y' || data.axis === 'both';
			const openEventType = data.store.data.openEvent?.type ?? '';
			const canTrackCursorOnAutoUpdate =
				(openEventType === 'mouseenter' || openEventType === 'mousemove') &&
				data.pointerType !== 'touch';

			const width = data.axis === 'y' ? domRect.width : 0;
			const height = data.axis === 'x' ? domRect.height : 0;
			let x = domRect.x;
			let y = domRect.y;

			if (offsetX == null && data.x && isXAxis) offsetX = domRect.x - data.x;
			if (offsetY == null && data.y && isYAxis) offsetY = domRect.y - data.y;

			x -= offsetX || 0;
			y -= offsetY || 0;

			if (!isAutoUpdateEvent || canTrackCursorOnAutoUpdate) {
				if (isXAxis) x = data.x;
				if (isYAxis) y = data.y;
			}

			isAutoUpdateEvent = true;

			return { width, height, x, y, top: y, right: x + width, bottom: y + height, left: x };
		}
	};
}

/** Positions the popup at the cursor, like a context menu or a tracking tooltip. */
export class ClientPointInteraction {
	/** Set when the interaction is disabled while open, so a later hover cannot re-anchor it. */
	#frozen = false;
	#stopListening: (() => void) | null = null;
	#pointerType = $state<string>();
	/** Bumped to re-run the listener effect after the cursor returns from the popup. */
	#restart = $state(0);

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseClientPointProps
	) {
		$effect(() => {
			void this.#restart;
			const { enabled } = this.#options();
			const domReference = this.store.domReferenceElement;
			const floating = this.store.floatingElement;
			// A mouse keeps steering the popup while it animates out. Touch would jump to the dismissal point.
			const follow = isMouseLikePointerType(this.#pointerType) ? floating : this.store.isOpen();

			if (!enabled) {
				untrack(() => this.props().setReference(null));
				return;
			}
			if (!follow) return;

			const cleanup = () => {
				this.#stopListening?.();
				this.#stopListening = null;
			};

			untrack(() => {
				const openEvent = this.store.data.openEvent;
				if (!openEvent || isMouseBasedEvent(openEvent)) {
					this.#stopListening = on(ownerWindow(floating), 'mousemove', (event) => {
						if (!contains(floating, getTarget(event))) {
							this.#point(event.clientX, event.clientY, domReference);
						} else {
							cleanup();
						}
					});
				} else {
					this.props().setReference(null);
				}
			});

			return cleanup;
		});

		$effect(() => () => untrack(() => this.props().setReference(null)));

		$effect(() => {
			if (this.#options().enabled && !this.store.floatingElement) this.#frozen = false;
		});

		$effect(() => {
			if (!this.#options().enabled && this.store.isOpen()) this.#frozen = true;
		});
	}

	#options() {
		const value = this.props();
		return { enabled: value.enabled ?? true, axis: value.axis ?? 'both' };
	}

	#point(x: number, y: number, trigger: Element | null) {
		if (this.#frozen) return;
		// A focus-opened popup stays on the trigger even if the cursor later crosses it.
		const openEvent = this.store.data.openEvent;
		if (openEvent && !isMouseBasedEvent(openEvent)) return;
		this.props().setReference(
			createVirtualElement(trigger, {
				x,
				y,
				axis: this.#options().axis,
				store: this.store,
				pointerType: this.#pointerType
			})
		);
	}

	#onEnterOrMove(event: MouseEvent) {
		if (!this.#options().enabled) return;
		const trigger = event.currentTarget instanceof Element ? event.currentTarget : null;
		if (!this.store.isOpen()) {
			this.#point(event.clientX, event.clientY, trigger);
		} else if (!this.#stopListening) {
			// The cursor went onto the popup and back to the trigger, so listen again.
			this.#point(event.clientX, event.clientY, trigger);
			this.#restart++;
		}
	}

	#onPointer(event: PointerEvent) {
		if (this.#options().enabled) this.#pointerType = event.pointerType;
	}

	readonly reference = {
		onpointerdown: (event: PointerEvent) => this.#onPointer(event),
		onpointerenter: (event: PointerEvent) => this.#onPointer(event),
		onmousemove: (event: MouseEvent) => this.#onEnterOrMove(event),
		onmouseenter: (event: MouseEvent) => this.#onEnterOrMove(event)
	};
}
