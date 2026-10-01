// Behavior reference: Base UI v1.8.0 FloatingPortal/FloatingFocusManager/tabbable (47b40521).
// MIT; see THIRD_PARTY_NOTICES.md. Guards belong to one Portal/Popup pair, never a document registry.
import type { PortalFocusManager } from '../dialog/context.js';
import { activeElement, tabbables } from './focus.js';

/** Bridge the logical Portal position and the relocated Popup with native focus guards. */
export function preserveTabOrder(portal: HTMLElement, position: Comment, manager: PortalFocusManager) {
  const document = portal.ownerDocument;
  const saved = new Map<HTMLElement, string | null>();
  function restore() {
    for (const [element, value] of saved) {
      if (value === null) element.removeAttribute('tabindex');
      else element.setAttribute('tabindex', value);
    }
    saved.clear();
  }
  function focusBoundary(event: FocusEvent) {
    if (!event.relatedTarget || portal.contains(event.relatedTarget as Node)) return;
    if (event.type === 'focusin') restore();
    else for (const element of tabbables(portal)) {
      if (!saved.has(element)) saved.set(element, element.getAttribute('tabindex'));
      element.tabIndex = -1;
    }
  }
  function adjacent(direction: 1 | -1) {
    const list = tabbables(document.body);
    const index = list.indexOf(activeElement(document)!);
    return list[index === -1 ? direction === 1 ? 0 : list.length - 1 : index + direction] ?? manager.reference();
  }
  function guard(type: 'inside' | 'outside', handle: (event: FocusEvent) => void) {
    const element = document.createElement('span');
    element.tabIndex = 0;
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute('data-base-ui-focus-guard', '');
    element.dataset.type = type;
    element.style.cssText = 'border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;white-space:nowrap;width:1px;top:0;left:0';
    element.addEventListener('focusin', handle);
    return element;
  }
  const fromOutside = (event: FocusEvent) => !event.relatedTarget || !portal.contains(event.relatedTarget as Node);
  const beforeOutside = guard('outside', event => {
    if (fromOutside(event)) beforeInside.focus();
    else adjacent(-1)?.focus();
  });
  const afterOutside = guard('outside', event => {
    if (fromOutside(event)) afterInside.focus();
    else {
      adjacent(1)?.focus();
      manager.closeOnFocusOut(event);
    }
  });
  const beforeInside = guard('inside', event => {
    manager.setPreventReturnFocus(false);
    if (fromOutside(event)) adjacent(1)?.focus();
    else beforeOutside.focus();
  });
  const afterInside = guard('inside', event => {
    if (fromOutside(event)) adjacent(-1)?.focus();
    else {
      manager.setPreventReturnFocus(true);
      afterOutside.focus();
    }
  });
  position.before(beforeOutside);
  position.after(afterOutside);
  manager.node.before(beforeInside);
  manager.node.after(afterInside);
  const guards = [beforeOutside, afterOutside, beforeInside, afterInside];
  for (const guard of guards) manager.guards.add(guard);
  portal.addEventListener('focusin', focusBoundary, true);
  portal.addEventListener('focusout', focusBoundary, true);
  return () => {
    portal.removeEventListener('focusin', focusBoundary, true);
    portal.removeEventListener('focusout', focusBoundary, true);
    restore();
    for (const guard of guards) { manager.guards.delete(guard); guard.remove(); }
  };
}
