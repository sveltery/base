// Base UI v1.8.0 utils/shadowDom.ts activeElement; MIT: THIRD_PARTY_NOTICES.md.
export function activeElement(doc: Document) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) element = element.shadowRoot.activeElement;
  return element;
}

// Base UI packages/utils/src/shadowDom.ts used getTarget body.
export function getTarget(event: Event) {
  if ('composedPath' in event) return event.composedPath()[0] ?? event.target;
  return (event as Event).target;
}
