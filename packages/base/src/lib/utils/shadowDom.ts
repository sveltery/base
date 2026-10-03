// Base UI v1.8.0 utils/shadowDom.ts activeElement; MIT: THIRD_PARTY_NOTICES.md.
export function activeElement(doc: Document) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) element = element.shadowRoot.activeElement;
  return element;
}
