export function activeElement(document: Document): HTMLElement | null {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element as HTMLElement | null;
}
export function tabbables(node: HTMLElement): HTMLElement[] {
  const candidates = [...node.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex],[contenteditable="true"]')].filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[hidden],[inert]') && element.getClientRects().length > 0 && element.ownerDocument.defaultView!.getComputedStyle(element).visibility !== 'hidden');
  // A named radio group contributes its checked input, or its first input when none is checked.
  // Compare names directly (rather than interpolating CSS selectors) and preserve form ownership.
  return candidates.filter(element => {
    if (element.tagName !== 'INPUT') return true;
    const input = element as HTMLInputElement;
    if (input.type !== 'radio' || !input.name) return true;
    const group = candidates.filter(candidate => candidate.tagName === 'INPUT' && (candidate as HTMLInputElement).type === 'radio' && (candidate as HTMLInputElement).name === input.name && (candidate as HTMLInputElement).form === input.form) as HTMLInputElement[];
    return (group.find(radio => radio.checked) ?? group[0]) === input;
  });
}
