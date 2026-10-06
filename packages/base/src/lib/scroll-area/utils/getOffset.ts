// Ported from Base UI v1.8.0 immutable47b40521; MIT: THIRD_PARTY_NOTICES.md.
export function getOffset(
  element: Element | null,
  prop: 'margin' | 'padding',
  axis: 'x' | 'y',
): number {
  if (!element) {
    return 0;
  }

  const styles = getComputedStyle(element);
  const key = `${prop}${axis === 'x' ? 'Inline' : 'Block'}` as const;
  const start = parseFloat(styles[`${key}Start`]);

  // Safari misreports `marginInlineEnd` in RTL.
  // We have to assume the start/end values are symmetrical, which is likely.
  if (axis === 'x' && prop === 'margin') {
    return start * 2;
  }

  return start + parseFloat(styles[`${key}End`]);
}
