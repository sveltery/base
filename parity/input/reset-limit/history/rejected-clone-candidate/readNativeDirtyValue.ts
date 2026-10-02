// Scratch measurement of the HTML dirty value flag on a detached native clone only.
// input cloning/reset/default setters: https://html.spec.whatwg.org/multipage/input.html#the-input-element
// textarea cloning/reset/children setters: https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element
const valueModeTypes = new Set(['text', 'search', 'tel', 'url', 'email', 'password', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'range', 'color']);
export function readNativeDirtyValue(node: HTMLElement): boolean | undefined {
  if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml') return undefined;
  if (node.localName === 'input') {
    if (!valueModeTypes.has((node as HTMLInputElement).type)) return undefined;
    const clone = node.cloneNode(false) as HTMLInputElement;
    clone.type = 'text';
    const before = clone.value; clone.defaultValue = `${before}x`;
    return clone.value === before;
  }
  if (node.localName === 'textarea') {
    const clone = node.cloneNode(false) as HTMLTextAreaElement;
    const before = clone.value; clone.defaultValue = `${before}x`;
    return clone.value === before;
  }
  return undefined;
}
export function readNativeInputDirtyValue(node: HTMLElement): boolean | undefined {
  const view = node.ownerDocument.defaultView;
  if (node.localName !== 'input' || !view || Object.getPrototypeOf(node) !== view.HTMLInputElement.prototype || node.hasAttribute('is')) return undefined;
  return readNativeDirtyValue(node);
}
