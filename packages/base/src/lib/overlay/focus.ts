// Composed focus traversal follows pinned Base UI v1.8.0 tabbable/shadowDom (47b40521).
// MIT; see THIRD_PARTY_NOTICES.md. DOM access stays inside calls for SSR-safe imports.
export function activeElement(document: Document): HTMLElement | null {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element as HTMLElement | null;
}
function parent(element: Element): Element | null {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return 'host' in root ? (root as ShadowRoot).host : null;
}
/** Includes descendants through open shadow roots and assigned slots. */
export function contains(container: Node | null | undefined, node: Node | null | undefined): boolean {
  if (!container || !node) return false;
  if (container.contains(node)) return true;
  for (let current: Node | null = node; current; current = current.nodeType === 1 ? parent(current as Element) : current.parentNode) {
    if (current === container) return true;
  }
  return false;
}
function children(node: Element | ShadowRoot): Element[] {
  if (node.nodeType === 1) {
    const element = node as HTMLElement;
    if (element.localName === 'slot') {
      const assigned = (element as HTMLSlotElement).assignedElements({ flatten: true });
      if (assigned.length) return assigned;
    }
    if (element.shadowRoot) return [...element.shadowRoot.children];
  }
  return [...node.children];
}
export function tabbables(node: HTMLElement | ShadowRoot): HTMLElement[] {
  const candidates: HTMLElement[] = [];
  function walk(container: Element | ShadowRoot) {
    for (const element of children(container)) {
      if (element.matches('button,input,select,textarea,a[href],[tabindex],[contenteditable="true"]')) {
        const candidate = element as HTMLElement;
        let hidden = false;
        for (let ancestor: Element | null = element; ancestor; ancestor = parent(ancestor)) {
          if (ancestor.matches('[hidden],[inert]')) { hidden = true; break; }
        }
        if (!hidden && !element.matches(':disabled') && candidate.getClientRects().length > 0 && element.ownerDocument.defaultView!.getComputedStyle(element).visibility !== 'hidden') candidates.push(candidate);
      }
      walk(element);
    }
  }
  walk(node);
  // A named radio group contributes its checked input, or its first input when none is checked.
  // Compare names directly, retaining form AND tree-root ownership across shadow boundaries.
  // Resolve that owner from focusable candidates before excluding negative tabindex values.
  return candidates.filter(element => {
    if (element.tabIndex < 0) return false;
    if (element.tagName !== 'INPUT') return true;
    const input = element as HTMLInputElement;
    if (input.type !== 'radio' || !input.name) return true;
    const group = candidates.filter(candidate => candidate.tagName === 'INPUT' && (candidate as HTMLInputElement).type === 'radio' && (candidate as HTMLInputElement).name === input.name && (candidate as HTMLInputElement).form === input.form && candidate.getRootNode() === input.getRootNode()) as HTMLInputElement[];
    return (group.find(radio => radio.checked) ?? group[0]) === input;
  });
}
