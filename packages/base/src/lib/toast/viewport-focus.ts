// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
/** Scoped shadow-DOM helpers; Toast does not depend on Dialog's focus implementation. */
export function activeElement(doc: Document): Element | null {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element;
}
export function contains(parent: HTMLElement | null, child: EventTarget | null): boolean {
  let node = child as Node | null;
  while (parent && node && typeof node.nodeType === 'number') {
    if (parent.contains(node)) return true;
    const root = node.getRootNode();
    node = 'host' in root ? (root as ShadowRoot).host : null;
  }
  return false;
}
export function getTarget(event: Event): EventTarget | null {
  return event.composedPath()[0] ?? event.target;
}
export function isFocusVisible(element: Element | null): boolean {
  // Pinned upstream also treats jsdom as focus-visible to compensate for its selector model.
  if (!element || /jsdom/i.test(element.ownerDocument.defaultView?.navigator.userAgent ?? '')) return true;
  try { return element.matches(':focus-visible'); } catch { return true; }
}
