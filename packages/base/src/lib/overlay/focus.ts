export function activeElement(document: Document): HTMLElement | null {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element as HTMLElement | null;
}
export function tabbables(node: HTMLElement): HTMLElement[] {
  const candidates = [...node.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex],[contenteditable="true"]')];
  return candidates.filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[hidden],[inert]') && element.getClientRects().length > 0 && element.ownerDocument.defaultView!.getComputedStyle(element).visibility !== 'hidden');
}
