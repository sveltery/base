// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useFocus.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// React's `onFocus`/`onBlur` bubble, so the handlers are `focusin`/`focusout`. A nested
// trigger's focus then reaches the parent trigger, as in upstream.
// `REASONS` has no `triggerFocus` yet, so the string lives here.

import { isElement, isHTMLElement } from '@floating-ui/utils/dom';
import { on } from 'svelte/events';
import {
	activeElement,
	contains,
	createChangeEventDetails,
	getTarget,
	ownerDocument,
	ownerWindow,
	platform,
	REASONS,
	ScopedTimeout
} from '@sveltery/utils';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { isTargetInsideEnabledTrigger, isTypeableElement } from '../utils/element.js';

export const TRIGGER_FOCUS_REASON = 'trigger-focus';

const isMacSafari = platform.os.mac && platform.engine.webkit;

export interface UseFocusProps {
	enabled?: boolean;
	/** Milliseconds to wait before opening. Opens at once when 0 or unset. */
	delay?: number | (() => number);
}

function matchesFocusVisible(element: Element) {
	if (platform.env.jsdom) return true;
	try {
		return element.matches(':focus-visible');
	} catch {
		return true;
	}
}

/** Opens the popup while a trigger has focus, like CSS `:focus`. */
export class FocusInteraction {
	readonly #timeout = new ScopedTimeout();
	#blockFocus = false;
	/** The trigger that Escape or a press dismissed, so refocusing it does not reopen. */
	#blockedReference: Element | null = null;
	#keyboardModality = true;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseFocusProps = () => ({})
	) {
		$effect(() => {
			if (!this.#enabled()) return;
			const win = ownerWindow(this.store.domReferenceElement);
			const stops = [
				// Returning to the tab refocuses the trigger. That must not reopen a popup that was closed.
				on(win, 'blur', () => {
					const reference = this.store.domReferenceElement;
					if (
						!this.store.isOpen() &&
						isHTMLElement(reference) &&
						reference === activeElement(ownerDocument(reference))
					) {
						this.#blockFocus = true;
						this.#blockedReference = reference;
					}
				})
			];
			if (isMacSafari) {
				stops.push(
					on(win, 'keydown', () => (this.#keyboardModality = true), { capture: true }),
					on(win, 'pointerdown', () => (this.#keyboardModality = false), { capture: true })
				);
			}
			return () => stops.forEach((stop) => stop());
		});

		$effect(() => {
			if (!this.#enabled()) return;
			return this.store.events.on('openchange', (payload) => {
				const reason = (payload as { reason?: string } | undefined)?.reason;
				if (reason !== REASONS.triggerPress && reason !== REASONS.escapeKey) return;
				const reference = this.store.domReferenceElement;
				if (isElement(reference)) {
					this.#blockedReference = reference;
					this.#blockFocus = true;
				}
			});
		});
	}

	#enabled() {
		return this.props().enabled ?? true;
	}

	#delay() {
		const delay = this.props().delay;
		return (typeof delay === 'function' ? delay() : delay) ?? 0;
	}

	#resetBlockedFocus() {
		this.#blockFocus = false;
		this.#blockedReference = null;
	}

	#open(event: FocusEvent, trigger: HTMLElement) {
		this.store.setOpen(true, createChangeEventDetails(TRIGGER_FOCUS_REASON, event, trigger));
	}

	readonly reference = {
		onmouseleave: () => {
			if (this.#enabled()) this.#resetBlockedFocus();
		},
		onfocusin: (event: FocusEvent) => {
			if (!this.#enabled()) return;
			const currentTarget = event.currentTarget;
			if (!(currentTarget instanceof HTMLElement)) return;

			if (this.#blockFocus) {
				if (this.#blockedReference === currentTarget) return;
				this.#resetBlockedFocus();
			}

			const target = getTarget(event);
			if (isElement(target)) {
				// Safari fails to match `:focus-visible` if focus was initially outside the document.
				if (isMacSafari && !event.relatedTarget) {
					if (!this.#keyboardModality && !isTypeableElement(target)) return;
				} else if (!matchesFocusVisible(target)) {
					return;
				}
			}

			const movedFromOtherEnabledTrigger = isTargetInsideEnabledTrigger(
				event.relatedTarget,
				this.store.triggers.elements()
			);
			const delay = this.#delay();

			if ((this.store.isOpen() && movedFromOtherEnabledTrigger) || !delay) {
				this.#open(event, currentTarget);
				return;
			}

			this.#timeout.start(delay, () => {
				if (!this.#blockFocus) this.#open(event, currentTarget);
			});
		},
		onfocusout: (event: FocusEvent) => {
			if (!this.#enabled()) return;
			this.#resetBlockedFocus();

			const relatedTarget = event.relatedTarget;
			// Non-modal focus management moves focus into the popup right after this guard.
			const movedToFocusGuard =
				isElement(relatedTarget) &&
				relatedTarget.hasAttribute('data-base-ui-focus-guard') &&
				relatedTarget.getAttribute('data-type') === 'outside';

			// Wait for the window blur listener to fire.
			this.#timeout.start(0, () => {
				const reference = this.store.domReferenceElement;
				const active = activeElement(ownerDocument(reference));

				// Focus left the page, keep it open.
				if (!relatedTarget && active === reference) return;

				// Clicking from the trigger into a focusable popup must not hide it. `relatedTarget`
				// only names the shadow host, so the active element decides.
				if (
					contains(this.store.floatingElement, active) ||
					contains(reference, active) ||
					movedToFocusGuard
				) {
					return;
				}

				// Another trigger's focus handler owns the open state.
				if (isTargetInsideEnabledTrigger(relatedTarget ?? active, this.store.triggers.elements())) {
					return;
				}

				this.store.setOpen(false, createChangeEventDetails(TRIGGER_FOCUS_REASON, event));
			});
		}
	};
}
