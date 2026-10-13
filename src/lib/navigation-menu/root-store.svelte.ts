// Derived from Base UI v1.9.0 packages/react/src/navigation-menu/root/NavigationMenuRoot.tsx,
// packages/react/src/navigation-menu/root/NavigationMenuRootContext.ts, and
// packages/react/src/internals/useUnmountAfterClose.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// One store per root. The value is the open item: a nullish value is closed.
// `NavigationMenuFloating` is the positioning and portal store. Its reference is the active
// trigger, which upstream passes in as the trigger's floating root context.

import { untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { FloatingRootStore } from '@sveltery/floating-ui-svelte';
import {
	activeElement,
	contains,
	createChangeEventDetails,
	ownerDocument,
	REASONS,
	type BaseUIChangeEventDetails
} from '@sveltery/utils';
import { attachPreventUnmountOnClose, type AnchorPositioning } from '../internal/popups/index.js';
import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
import type { NavigationMenuTriggerFloating } from './trigger-floating.svelte.js';
import type {
	NavigationMenuActivationDirection,
	NavigationMenuChangeEventDetails,
	NavigationMenuChangeReason,
	NavigationMenuOrientation
} from './types.js';
import { StyleVars } from './style-vars.svelte.js';
import { getPositionerFixedSize, setSharedFixedSize, type SizeTargets } from './utils.js';

const BLOCKED_RETURN_FOCUS_REASONS = new Set<string>([
	REASONS.triggerHover,
	REASONS.outsidePress,
	REASONS.focusOut
]);

export type NavigationMenuSetValueDetails = BaseUIChangeEventDetails<NavigationMenuChangeReason> &
	Partial<Pick<NavigationMenuChangeEventDetails, 'preventUnmountOnClose'>>;

export interface NavigationMenuRootOptions {
	readValue: () => unknown;
	writeValue: (value: unknown) => void;
	onValueChange: () =>
		((value: unknown, details: NavigationMenuChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	delay: () => number;
	closeDelay: () => number;
	orientation: () => NavigationMenuOrientation;
	nested: boolean;
	parent: NavigationMenuRootStore | undefined;
	floatingId: string;
}

/** Positions the popup against the active trigger. The positioner and the portal use it. */
export class NavigationMenuFloating extends FloatingRootStore {
	constructor(
		private readonly root: NavigationMenuRootStore,
		nested: boolean,
		floatingId: string
	) {
		super({ nested, floatingId, floatingElementKind: 'positioner' });
	}

	override get referenceElement() {
		return this.root.activeTrigger?.domReferenceElement ?? null;
	}

	override isOpen() {
		return this.root.open;
	}
}

export class NavigationMenuRootStore {
	readonly floating: NavigationMenuFloating;
	readonly nested: boolean;
	readonly parent: NavigationMenuRootStore | undefined;
	/** Floating tree node of this root. Set by the root during init. */
	nodeId: string | null = null;

	rootElement = $state<HTMLElement | null>(null);
	popupElement = $state<HTMLElement | null>(null);
	viewportElement = $state<HTMLElement | null>(null);
	/** The inner container of a viewport without a positioner. */
	viewportTargetElement = $state<HTMLElement | null>(null);
	/** The floating store of the trigger that owns the open popup. */
	activeTrigger = $state.raw<NavigationMenuTriggerFloating | null>(null);
	/** The open content element the size observer watches. */
	currentContent = $state.raw<HTMLElement | null>(null);
	/** Positioning of the mounted positioner. Its side feeds the safe polygon. */
	positioning = $state.raw<AnchorPositioning | null>(null);
	/** Dismiss handlers from the list. Empty while no trigger is active. */
	dismissReference = $state.raw<HTMLAttributes<HTMLElement>>({});
	dismissFloating = $state.raw<HTMLAttributes<HTMLElement>>({});
	preventUnmountOnClose = $state(false);
	/** Set when focus leaves an inline viewport, so Tab cannot loop into it. Clears when the value changes. */
	viewportInert = $derived.by(() => {
		void this.value;
		return false;
	});

	closeReason: string | undefined;
	prevTriggerElement: Element | null | undefined = null;
	readonly guards: {
		beforeInside: HTMLElement | null;
		afterInside: HTMLElement | null;
		beforeOutside: HTMLElement | null;
		afterOutside: HTMLElement | null;
	} = { beforeInside: null, afterInside: null, beforeOutside: null, afterOutside: null };
	/** Size variables of the popup and the positioner. The parts render them in their style. */
	readonly popupVars = new StyleVars();
	readonly positionerVars = new StyleVars();
	/** Shared so a newly active trigger can cancel a reset the previous trigger scheduled. */
	readonly popupAutoSizeReset: { abortController: AbortController | null; owner: unknown } = {
		abortController: null,
		owner: null
	};

	#activationDirection = $state<NavigationMenuActivationDirection>(null);
	readonly #transition: TransitionStatus;

	constructor(private readonly options: NavigationMenuRootOptions) {
		this.nested = options.nested;
		this.parent = options.parent;
		this.floating = new NavigationMenuFloating(this, options.nested, options.floatingId);
		this.#transition = new TransitionStatus(() => this.open);

		// Opening starts a new close cycle.
		$effect.pre(() => {
			if (this.open) untrack(() => (this.preventUnmountOnClose = false));
		});

		useOpenChangeComplete(() => ({
			enabled: this.mounted && !this.open && !this.preventUnmountingOnClose,
			open: this.open,
			element: this.popupElement,
			onComplete: () => {
				if (!this.open) this.forceUnmount();
			}
		}));

		// The viewport target may be the animated element instead of the popup.
		useOpenChangeComplete(() => ({
			enabled: this.mounted && !this.open && !this.preventUnmountingOnClose,
			open: this.open,
			element: this.viewportTargetElement,
			onComplete: () => {
				if (!this.open) this.forceUnmount();
			}
		}));

		// A close keeps the last fixed size, so the closing transition starts from it.
		$effect(() => {
			if (this.open) return;
			const positioner = this.positionerElement;
			const popup = this.popupElement;
			if (!positioner || !popup) return;
			const size = getPositionerFixedSize(positioner);
			if (!size) return;
			untrack(() =>
				setSharedFixedSize(this.sizeTargets(popup, positioner), size.width, size.height)
			);
		});
	}

	sizeTargets(popup: HTMLElement, positioner: HTMLElement): SizeTargets {
		return { popup, positioner, popupVars: this.popupVars, positionerVars: this.positionerVars };
	}

	get value(): unknown {
		return this.options.readValue() ?? null;
	}

	get open() {
		return this.value != null;
	}

	get mounted() {
		return this.#transition.mounted;
	}

	get transitionStatus() {
		return this.#transition.transitionStatus;
	}

	get preventUnmountingOnClose() {
		return this.open ? false : this.preventUnmountOnClose;
	}

	get positionerElement() {
		return this.floating.positionerElement;
	}

	/** The element hover and safe-polygon logic treat as the floating element. */
	get hoverFloatingElement() {
		return this.positionerElement ?? this.viewportElement;
	}

	get activationDirection(): NavigationMenuActivationDirection {
		return this.open ? this.#activationDirection : null;
	}

	setActivationDirection(direction: NavigationMenuActivationDirection) {
		this.#activationDirection = direction;
	}

	get delay() {
		return this.options.delay();
	}

	get closeDelay() {
		return this.options.closeDelay();
	}

	get orientation() {
		return this.options.orientation();
	}

	setValue(next: unknown, eventDetails: NavigationMenuSetValueDetails) {
		const value = this.value;
		if (next == null) this.closeReason = eventDetails.reason;

		const details = eventDetails as NavigationMenuChangeEventDetails;
		const readPreventUnmount = attachPreventUnmountOnClose(details);

		if (next !== value) untrack(() => this.options.onValueChange()?.(next, details));
		if (details.isCanceled) return;

		if (next == null) {
			// A redundant close skips `onValueChange`, so it keeps the opt-out it recorded.
			if (value != null) this.preventUnmountOnClose = readPreventUnmount();
			this.#activationDirection = null;
			this.activeTrigger = null;
		}

		this.options.writeValue(next);

		if (this.nested && next == null && details.reason === REASONS.linkPress && this.parent) {
			this.parent.setValue(null, details);
		}
	}

	close() {
		this.setValue(null, createChangeEventDetails(REASONS.imperativeAction));
	}

	/** Ends the closing phase. Ignored while open or already unmounted. */
	forceUnmount() {
		if (!this.#transition.mounted || this.open) return;
		this.#onUnmount();
		this.#transition.setMounted(false);
	}

	#onUnmount() {
		const popup = this.popupElement;
		const active = activeElement(ownerDocument(this.rootElement));
		const blocked = this.closeReason ? BLOCKED_RETURN_FOCUS_REASONS.has(this.closeReason) : false;
		const trigger = this.prevTriggerElement;

		if (
			!blocked &&
			trigger instanceof HTMLElement &&
			popup &&
			(active === ownerDocument(popup).body || contains(popup, active))
		) {
			trigger.focus({ preventScroll: true });
			this.prevTriggerElement = undefined;
		}

		untrack(() => this.options.onOpenChangeComplete()?.(false));
		this.#activationDirection = null;
		this.activeTrigger = null;
		this.currentContent = null;
		this.closeReason = undefined;
	}
}
