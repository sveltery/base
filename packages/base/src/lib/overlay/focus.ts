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
// Candidate and filtering rules ported from floating-ui-react/utils/tabbable.ts.
const candidateSelector = 'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
function detailsSummary(details: Element): Element | undefined {
  return [...details.children].find(child => child.localName === 'summary');
}
function isCandidate(element: Element): boolean {
  return element.matches(candidateSelector)
    && (element.localName !== 'summary' || (element.parentElement?.localName === 'details' && detailsSummary(element.parentElement) === element))
    && (element.localName !== 'details' || !detailsSummary(element))
    && (element.localName !== 'input' || (element as HTMLInputElement).type !== 'hidden');
}
function isFocusable(element: Element): boolean {
  if (!element.isConnected || element.matches(':disabled')) return false;
  for (let current: Element | null = element; current; current = parent(current)) {
    if (current.matches('[hidden],[inert]')) return false;
    const ancestor = current !== element;
    if (ancestor && current.localName === 'details' && !(current as HTMLDetailsElement).open) {
      const summary = detailsSummary(current);
      if (!summary || !contains(summary, element)) return false;
    }
    // Slots have no box. Ancestors may use display:contents or have visibility
    // overridden by descendants; only a candidate's own visibility is decisive.
    if (current.localName === 'slot') continue;
    const styles = current.ownerDocument.defaultView!.getComputedStyle(current);
    if (ancestor) {
      if (styles.display === 'none') return false;
    } else {
      if (styles.visibility === 'hidden' || styles.visibility === 'collapse') return false;
      if (typeof current.checkVisibility === 'function') {
        if (!current.checkVisibility()) return false;
      } else if (styles.display === 'none' || styles.display === 'contents') return false;
    }
  }
  return true;
}
function tabIndex(element: HTMLElement): number {
  // Match the pinned helper, including explicit negative values for these
  // native candidates. Other elements retain their actual negative tab index.
  if (element.tabIndex < 0 && (element.localName === 'details' || element.localName === 'audio' || element.localName === 'video' || element.isContentEditable)) return 0;
  return element.tabIndex;
}
export function tabbables(node: HTMLElement | ShadowRoot): HTMLElement[] {
  const candidates: HTMLElement[] = [];
  function walk(container: Element | ShadowRoot) {
    for (const element of children(container)) {
      if (isCandidate(element) && isFocusable(element)) candidates.push(element as HTMLElement);
      walk(element);
    }
  }
  walk(node);
  // A named radio group contributes its checked input, or its first input when none is checked.
  // Compare names directly, retaining form AND tree-root ownership across shadow boundaries.
  // Resolve that owner from focusable candidates before excluding negative tabindex values.
  return candidates.filter(element => {
    if (tabIndex(element) < 0) return false;
    if (element.tagName !== 'INPUT') return true;
    const input = element as HTMLInputElement;
    if (input.type !== 'radio' || !input.name) return true;
    const group = candidates.filter(candidate => candidate.tagName === 'INPUT' && (candidate as HTMLInputElement).type === 'radio' && (candidate as HTMLInputElement).name === input.name && (candidate as HTMLInputElement).form === input.form && candidate.getRootNode() === input.getRootNode()) as HTMLInputElement[];
    return (group.find(radio => radio.checked) ?? group[0]) === input;
  });
}
