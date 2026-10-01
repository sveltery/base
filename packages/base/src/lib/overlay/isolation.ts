// Behavior reference: Base UI v1.8.0 FloatingFocusManager/markOthers (47b40521).
// MIT; see THIRD_PARTY_NOTICES.md. Svelte owns registration through DOM attachments.
type Attribute = 'aria-hidden' | 'data-base-ui-inert';
interface Claim { count: number; external: boolean }
interface Ownership { 'aria-hidden': Map<Element, Claim>; 'data-base-ui-inert': Map<Element, Claim> }
const documents = new WeakMap<Document, Ownership>();

function outside(body: HTMLElement, targets: Element[]) {
  const stops = new Set<Element>();
  const keep = new Set<Node>();
  for (let target of targets) {
    // A shadow target keeps its host; traversal remains scoped to the body tree.
    while (!body.contains(target)) {
      const root = target.getRootNode();
      if (root.nodeType !== 11 || !('host' in root)) break;
      target = (root as ShadowRoot).host;
    }
    if (!body.contains(target)) continue;
    stops.add(target);
    for (let node: Node | null = target; node; node = node.parentNode) keep.add(node);
  }
  const result: Element[] = [];
  function walk(parent: Element) {
    if (stops.has(parent)) return;
    for (const child of parent.children) {
      if (child.localName === 'script') continue;
      if (keep.has(child)) walk(child);
      else result.push(child);
    }
  }
  walk(body);
  return result;
}

/** Claim existing outside DOM until this popup closes or its attachment is removed. */
export function isolateDialog(popup: HTMLElement, modal: boolean) {
  const document = popup.ownerDocument;
  const ownership = documents.get(document) ?? { 'aria-hidden': new Map(), 'data-base-ui-inert': new Map() };
  documents.set(document, ownership);
  const portal = popup.closest('[data-base-ui-portal]');
  const inside = [popup, ...portal?.querySelectorAll('[data-base-ui-portal]') ?? []];
  const claims: [Attribute, Element][] = [];
  function claim(attribute: Attribute, targets: Element[]) {
    const map = ownership[attribute];
    for (const node of outside(document.body, targets)) {
      let entry = map.get(node);
      const value = node.getAttribute(attribute);
      if (!entry) {
        entry = { count: 0, external: attribute === 'aria-hidden' && value !== null && value !== 'false' };
        map.set(node, entry);
      }
      entry.count++;
      if (attribute === 'data-base-ui-inert' || value === null || value === 'false') node.setAttribute(attribute, attribute === 'aria-hidden' ? 'true' : '');
      claims.push([attribute, node]);
    }
  }
  // Live regions and their ancestors remain exposed to assistive technology.
  // The marker is intentionally independent; it is not the native inert attribute.
  if (modal) claim('aria-hidden', [...inside, ...document.body.querySelectorAll('[aria-live]')]);
  claim('data-base-ui-inert', inside);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const [attribute, node] of claims) {
      const map = ownership[attribute];
      const entry = map.get(node)!;
      if (--entry.count === 0) {
        if (!entry.external) node.removeAttribute(attribute);
        map.delete(node);
      }
    }
    if (!ownership['aria-hidden'].size && !ownership['data-base-ui-inert'].size) documents.delete(document);
  };
}
