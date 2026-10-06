// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { isElement, isHTMLElement } from '@floating-ui/utils/dom';
import { activeElement, contains, getTarget } from '@sveltery/utils/shadowDom';
import { FOCUSABLE_ATTRIBUTE, TYPEABLE_SELECTOR } from './constants.js';
import type { PopupTriggerMap } from '../../utils/popups/popupTriggerMap.svelte.js';
// Selected TooltipTriggerDataAttributes value; retain the original marker.
const triggerDisabled = 'data-trigger-disabled';

export { activeElement, contains, getTarget };
export { matchesFocusVisible } from './matchesFocusVisible.js';

export function isTargetInsideEnabledTrigger(
  target: EventTarget | null,
  triggerElements: PopupTriggerMap,
) {
  if (!isElement(target)) {
    return false;
  }

  const targetElement = target as Element;

  if (triggerElements.hasElement(targetElement)) {
    return !targetElement.hasAttribute(triggerDisabled);
  }

  for (const [, trigger] of triggerElements.entries()) {
    if (contains(trigger, targetElement)) {
      return !trigger.hasAttribute(triggerDisabled);
    }
  }

  return false;
}

export function isEventTargetWithin(event: Event, node: Node | null | undefined) {
  if (node == null) {
    return false;
  }

  if ('composedPath' in event) {
    return event.composedPath().includes(node);
  }

  // TS thinks `event` is of type never as it assumes all browsers support composedPath, but browsers without shadow dom don't
  const eventAgain = event as Event;
  return eventAgain.target != null && node.contains(eventAgain.target as Node);
}

export function isRootElement(element: Element): boolean {
  return element.matches('html,body');
}

export function isTypeableElement(element: unknown): boolean {
  return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR);
}

export function isInteractiveElement(element: Element | null) {
  return (
    element?.closest(
      `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${TYPEABLE_SELECTOR}`,
    ) != null
  );
}

export function isTypeableCombobox(element: Element | null) {
  if (!element) {
    return false;
  }
  return element.getAttribute('role') === 'combobox' && isTypeableElement(element);
}

export function getFloatingFocusElement(
  floatingElement: HTMLElement | null | undefined,
): HTMLElement | null {
  if (!floatingElement) {
    return null;
  }
  // Try to find the element that has `{...getFloatingProps()}` spread on it.
  // This indicates the floating element is acting as a positioning wrapper, and
  // so focus should be managed on the child element with the event handlers and
  // aria props.
  return floatingElement.hasAttribute(FOCUSABLE_ATTRIBUTE)
    ? floatingElement
    : floatingElement.querySelector(`[${FOCUSABLE_ATTRIBUTE}]`) || floatingElement;
}
