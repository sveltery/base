// Derived from Base UI v1.9.0 packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The trigger's open logic and focus guards. The component renders the button.
// The root's `NavigationMenuSizing` sizes the popup.
// Upstream reads `value` from the render before the event. Handlers here read it once at the start,
// and the keyboard handler reads it before it opens the item.

import { flushSync, untrack } from 'svelte';
import {
	applySafePolygonPointerEventsMutation,
	ClickInteraction,
	clearSafePolygonPointerEventsMutation,
	getNextTabbable,
	getPreviousTabbable,
	getTabbableAfterElement,
	hoverInteraction,
	HoverReferenceInteraction,
	isOutsideEvent,
	safePolygon,
	useFloatingTree
} from '@sveltery/floating-ui-svelte';
import {
	closest,
	contains,
	createChangeEventDetails,
	REASONS,
	ScopedTimeout,
	type BaseUIChangeEventDetails
} from '@sveltery/utils';
import { getCssDimensions } from '../internal/getCssDimensions.js';
import { PATIENT_CLICK_THRESHOLD } from './constants.js';
import type { NavigationMenuRootStore } from './root-store.svelte.js';
import { NavigationMenuTriggerFloating } from './trigger-floating.svelte.js';
import type { NavigationMenuChangeReason } from './types.js';
import { getPlacementFromElements, isOutsideMenuEvent } from './utils.js';

type OpenEvent = (MouseEvent | KeyboardEvent) & { currentTarget: EventTarget | null };

export interface NavigationMenuTriggerOptions {
	itemValue: () => unknown;
	disabled: () => boolean;
	direction: () => 'ltr' | 'rtl';
	floatingId: string;
}

export class NavigationMenuTriggerController {
	readonly store: NavigationMenuTriggerFloating;
	readonly hover: HoverReferenceInteraction;
	readonly click: ClickInteraction;
	element = $state<HTMLElement | null>(null);
	readonly isActiveItem = $derived.by(
		() => this.root.open && this.root.value === this.options.itemValue()
	);

	#stickIfOpen = $state(true);
	#pointerType = $state('');
	/** Whether this item was active when the press started. Upstream reads it from the render. */
	#pressToggle = false;
	readonly #tree = useFloatingTree();
	readonly #stickIfOpenTimeout = new ScopedTimeout();
	readonly #mousePolygon: ReturnType<typeof safePolygon>;
	readonly #touchPolygon: ReturnType<typeof safePolygon>;

	constructor(
		private readonly root: NavigationMenuRootStore,
		private readonly options: NavigationMenuTriggerOptions
	) {
		this.store = new NavigationMenuTriggerFloating(root, options.floatingId, (open, details) =>
			this.#handleOpenChange(open, details)
		);
		const getScope = () => this.#getScope();
		this.#mousePolygon = safePolygon({ blockPointerEvents: true, getScope });
		this.#touchPolygon = safePolygon({ blockPointerEvents: false, getScope });

		this.hover = new HoverReferenceInteraction(this.store, () => ({
			enabled: this.#hoverInteractionsEnabled,
			move: false,
			handleClose: this.#hasCloseContext()
				? this.#pointerType === 'touch'
					? this.#touchPolygon
					: this.#mousePolygon
				: null,
			restMs: root.mounted && root.positionerElement ? 0 : root.delay,
			delay: { close: root.closeDelay },
			placement: () => this.#placement()
		}));
		this.click = new ClickInteraction(this.store, () => ({
			enabled: this.#interactionsEnabled,
			stickIfOpen: this.#stickIfOpen,
			toggle: this.#pressToggle
		}));

		$effect(() => {
			if (root.open) return;
			this.#stickIfOpenTimeout.clear();
			untrack(() => (this.#pointerType = ''));
		});

		$effect(() => {
			const instance = hoverInteraction(this.store);
			if (!root.open) {
				untrack(() => {
					this.store.data.openEvent = undefined;
					instance.pointerType = undefined;
					instance.interactedInside = false;
					instance.restTimeoutPending = false;
					instance.openChangeTimeout.clear();
					instance.restTimeout.clear();
				});
			}
			return () => clearSafePolygonPointerEventsMutation(instance);
		});

		$effect(() => {
			if (!this.isActiveItem) return;
			const store = this.store;
			const element = this.element;
			untrack(() => {
				root.activeTrigger = store;
				root.prevTriggerElement = element;
			});
		});
	}

	get disabled() {
		return this.options.disabled();
	}

	get #itemValue() {
		return this.options.itemValue();
	}

	get #interactionsEnabled() {
		return (this.root.positionerElement != null || this.root.value == null) && !this.disabled;
	}

	get #hoverInteractionsEnabled() {
		return (this.root.hoverFloatingElement != null || this.root.value == null) && !this.disabled;
	}

	/**
	 * Upstream reads the safe polygon's context from the positioner's floating context,
	 * or measures it for a nested viewport without a positioner.
	 */
	#hasCloseContext() {
		if (this.root.positionerElement) return true;
		return this.root.nested && this.root.hoverFloatingElement != null;
	}

	#placement() {
		if (this.root.positionerElement) return this.root.positioning?.physicalSide ?? null;
		const floating = this.root.hoverFloatingElement;
		if (!this.element || !floating) return null;
		return getPlacementFromElements(this.element, floating);
	}

	#getScope(): HTMLElement | null {
		if (this.root.nested && this.root.positionerElement) return null;
		return closest(this.element, 'ul') as HTMLElement | null;
	}

	#handleOpenChange(nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>) {
		const details = eventDetails as BaseUIChangeEventDetails<NavigationMenuChangeReason>;
		const isHover = details.reason === REASONS.triggerHover;

		if (!this.#interactionsEnabled) return;
		if (this.#pointerType === 'touch' && isHover) return;
		if (!nextOpen && this.root.value !== this.#itemValue) return;

		if (isHover) {
			// A click soon after a hover open keeps the popup open. A patient click closes it.
			this.#stickIfOpen = true;
			this.#stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
				this.#stickIfOpen = false;
			});
		}

		if (nextOpen) {
			this.root.setValue(this.#itemValue, details);
		} else {
			this.root.setValue(null, details);
			this.#pointerType = '';
		}
	}

	#handleActivation(event: OpenEvent, value: unknown) {
		const root = this.root;
		const currentTarget = event.currentTarget as HTMLElement;
		const itemValue = this.#itemValue;
		const prevTriggerRect = root.prevTriggerElement?.getBoundingClientRect();
		const element = this.element;

		if (root.mounted && prevTriggerRect && element) {
			const nextTriggerRect = element.getBoundingClientRect();
			const isMovingRight = nextTriggerRect.left > prevTriggerRect.left;
			const isMovingDown = nextTriggerRect.top > prevTriggerRect.top;

			if (root.orientation === 'horizontal' && nextTriggerRect.left !== prevTriggerRect.left) {
				root.setActivationDirection(isMovingRight ? 'right' : 'left');
			} else if (root.orientation === 'vertical' && nextTriggerRect.top !== prevTriggerRect.top) {
				root.setActivationDirection(isMovingDown ? 'down' : 'up');
			}
		}

		// Moving to another trigger forgets the open event, so a click, a hover on another
		// trigger, and a hover back cannot leave the popup stuck open.
		if (event.type !== 'click' && value != null) this.store.data.openEvent = undefined;

		if (this.#pointerType === 'touch' && event.type !== 'click') return;

		// A keyboard open already set the value with the `listNavigation` reason.
		if (value != null && event.type !== 'keydown') {
			root.setValue(
				itemValue,
				createChangeEventDetails(
					event.type === 'mouseenter' ? REASONS.triggerHover : REASONS.triggerPress,
					event
				)
			);
		}

		const floating = root.hoverFloatingElement;
		if (
			event.type === 'mouseenter' &&
			this.#pointerType !== 'touch' &&
			(!root.nested || !root.positionerElement) &&
			floating
		) {
			const instance = hoverInteraction(this.store);
			const apply = () => {
				applySafePolygonPointerEventsMutation(instance, {
					scopeElement: this.#getScope() ?? currentTarget.ownerDocument.body,
					referenceElement: currentTarget,
					floatingElement: floating
				});
			};
			if (value != null && value !== itemValue) queueMicrotask(apply);
			else apply();
		}
	}

	/** `value` is the value before the event, which a keyboard open has already changed. */
	#handleOpenEvent(event: OpenEvent, value: unknown = this.root.value) {
		if (this.disabled) return;
		const popup = this.root.popupElement;
		const positioner = this.root.positionerElement;

		if (!popup || !positioner) {
			this.#handleActivation(event, value);
			return;
		}

		const size = getCssDimensions(popup);
		const shouldSkipAutoSizeSync =
			value != null &&
			value !== this.#itemValue &&
			(event.type === 'click' || this.#pointerType !== 'touch');

		this.#handleActivation(event, value);
		// The resize measures the content of the item just activated.
		flushSync();
		if (shouldSkipAutoSizeSync) this.root.sizing.skipNextAutoSizeSync();
		this.root.sizing.resize(this.#itemValue, size);
	}

	/** Trigger handlers. `mergeProps` runs these before the click and hover interactions. */
	readonly handlers = {
		onmouseenter: (event: MouseEvent) => this.#handleOpenEvent(event as OpenEvent),
		onclick: (event: MouseEvent) => {
			this.#pressToggle = this.isActiveItem;
			this.#handleOpenEvent(event as OpenEvent);
		},
		onpointerenter: (event: PointerEvent) => {
			this.#pointerType = event.pointerType;
		},
		onpointerdown: (event: PointerEvent) => {
			this.#pointerType = event.pointerType;
			clearSafePolygonPointerEventsMutation(hoverInteraction(this.store));
		},
		onfocus: () => {
			if (this.isActiveItem) this.root.viewportInert = false;
		},
		onmouseleave: () => {
			if (this.root.value == null) {
				clearSafePolygonPointerEventsMutation(hoverInteraction(this.store));
			}
		},
		onkeydown: (event: KeyboardEvent) => {
			// Nested triggers leave the arrow keys to the composite of the parent content.
			if (this.root.nested) return;
			const verticalOpenKey = this.options.direction() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
			const openHorizontal = this.root.orientation === 'horizontal' && event.key === 'ArrowDown';
			const openVertical = this.root.orientation === 'vertical' && event.key === verticalOpenKey;
			if (!openHorizontal && !openVertical) return;
			const value = this.root.value;
			this.root.setValue(this.#itemValue, createChangeEventDetails(REASONS.listNavigation, event));
			this.#handleOpenEvent(event as OpenEvent, value);
			event.preventDefault();
			event.stopPropagation();
		},
		onblur: (event: FocusEvent) => {
			const { popupElement, positionerElement, rootElement, nodeId } = this.root;
			if (
				positionerElement &&
				popupElement &&
				isOutsideMenuEvent(
					{ currentTarget: event.currentTarget, relatedTarget: event.relatedTarget },
					{ popupElement, rootElement, tree: this.#tree, nodeId }
				)
			) {
				this.root.setValue(null, createChangeEventDetails(REASONS.focusOut, event));
			}
		}
	};

	attachElement = (node: HTMLElement) => {
		this.element = node;
		this.store.domReferenceElement = node;
		return () => {
			if (this.element === node) this.element = null;
			if (this.store.domReferenceElement === node) this.store.domReferenceElement = null;
		};
	};

	focusBeforeOutside = (event: FocusEvent) => {
		const reference = this.root.hoverFloatingElement;
		if (reference && isOutsideEvent(event, reference)) {
			this.root.guards.beforeInside?.focus();
			return;
		}
		getPreviousTabbable(this.element)?.focus();
	};

	focusAfterOutside = (event: FocusEvent) => {
		const root = this.root;
		const reference = root.hoverFloatingElement;
		if (reference && isOutsideEvent(event, reference)) {
			root.viewportInert = false;
			flushSync();
			(root.guards.afterInside ?? this.element)?.focus();
			return;
		}

		let nextTabbable = getNextTabbable(this.element);
		if (
			root.nested &&
			!root.positionerElement &&
			nextTabbable &&
			contains(reference, nextTabbable)
		) {
			nextTabbable = getTabbableAfterElement(root.guards.afterInside);
		}
		nextTabbable?.focus();

		if ((!root.nested || root.positionerElement) && !contains(root.rootElement, nextTabbable)) {
			root.setValue(null, createChangeEventDetails(REASONS.focusOut, event));
		}
	};
}
