// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
import type { HastRoot, HastNode, HastElement } from './types.js';
/**
 * Extracts all text content from a HAST node recursively.
 */
export function getHastTextContent(node: HastRoot | HastNode): string {
  if (node.type === 'text') {
    return node.value || '';
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => getHastTextContent(child)).join('');
  }
  return '';
}

/**
 * Gets the direct text content of a HAST element (non-recursive, first level only).
 */
export function getShallowTextContent(element: HastElement): string {
  let text = '';
  for (const child of element.children) {
    if (child.type === 'text') {
      text += child.value;
    }
  }
  return text;
}
