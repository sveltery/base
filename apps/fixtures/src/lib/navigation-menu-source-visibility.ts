// Observable pass predicate of @testing-library/jest-dom6.9.1 toBeVisible, MIT.
// Exact version and tarball integrity are pinned by Original47b40521's lockfile.
// Copyright (c) 2017 Kent C. Dodds; parity/navigation-menu/source-test-library-LICENSE.txt.
function isStyleVisible(element: Element) {
  const { getComputedStyle } = element.ownerDocument.defaultView!;
  const { display, visibility, opacity } = getComputedStyle(element) as { display: string; visibility: string; opacity: string | number };
  return display !== 'none' && visibility !== 'hidden' && visibility !== 'collapse' && opacity !== '0' && opacity !== 0;
}

function isAttributeVisible(element: Element, previousElement?: Element) {
  let detailsVisibility;
  if (previousElement) {
    detailsVisibility = element.nodeName === 'DETAILS' && previousElement.nodeName !== 'SUMMARY' ? element.hasAttribute('open') : true;
  } else {
    detailsVisibility = element.nodeName === 'DETAILS' ? element.hasAttribute('open') : true;
  }
  return !element.hasAttribute('hidden') && detailsVisibility;
}

function isElementVisible(element: Element, previousElement?: Element): boolean {
  return isStyleVisible(element) && isAttributeVisible(element, previousElement) && (!element.parentElement || isElementVisible(element.parentElement, element));
}

export function isSourceVisible(element: Element) {
  const isInDocument = element.ownerDocument === element.getRootNode({ composed: true });
  return isInDocument && isElementVisible(element);
}
