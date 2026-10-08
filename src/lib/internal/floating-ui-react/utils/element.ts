// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/element.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// DOM helpers come from the shadowDom module. They are not re-exported.
// The disabled-trigger check uses the attribute string Tooltip will own.

import { isHTMLElement } from '@floating-ui/utils/dom';
import { contains } from '../../shadow-dom.js';
import { TRIGGER_DISABLED_ATTRIBUTE } from './constants.js';

export function isTargetInsideEnabledTrigger(
	target: EventTarget | null,
	triggers: Iterable<Element>
) {
	if (!(target instanceof Element)) return false;
	for (const trigger of triggers) {
		if (trigger === target || contains(trigger, target)) {
			return !trigger.hasAttribute(TRIGGER_DISABLED_ATTRIBUTE);
		}
	}
	return false;
}

const TYPEABLE_SELECTOR =
	'input:not([type="hidden"]):not([disabled]),[contenteditable]:not([contenteditable="false"]),textarea:not([disabled])';

export function isInteractiveElement(element: Element | null) {
	return (
		element?.closest(
			`button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${TYPEABLE_SELECTOR}`
		) != null
	);
}

export function isTypeableElement(element: unknown): boolean {
	return (
		isHTMLElement(element) &&
		(element.localName === 'input' || element.localName === 'textarea' || element.isContentEditable)
	);
}
