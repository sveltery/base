// Base UI v1.8.0 packages/utils/src/owner.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
export { getWindow as ownerWindow } from '@floating-ui/utils/dom';

export function ownerDocument(node: Element | null) {
  return node?.ownerDocument || document;
}
