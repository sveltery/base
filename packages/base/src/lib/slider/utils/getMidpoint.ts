// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md; parity/slider/source-correspondence.md.
export function getMidpoint(element: HTMLElement, vertical: boolean): number {
  const rect = element.getBoundingClientRect();
  return vertical ? (rect.top + rect.bottom) / 2 : (rect.left + rect.right) / 2;
}
