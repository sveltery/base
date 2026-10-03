// Extracted from Base UI v1.8.0 floating-ui-react/utils/element.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { platform } from '../../utils/platform/index.js';
export function matchesFocusVisible(element: Element | null) {
  // JSDOM does not match :focus-visible when the element has :focus.
  if (!element || platform.env.jsdom) return true;
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}
