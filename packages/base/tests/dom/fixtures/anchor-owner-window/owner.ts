// Exact pinned Base UI 1.8.0 business fixture; MIT: parity/navigation-menu/UPSTREAM_LICENSE.
// Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; test-only import/type transport.
export { getWindow as ownerWindow } from '@floating-ui/utils/dom';

export function ownerDocument(node: Element | null) {
  return node?.ownerDocument || document;
}
