/** Sort key for elements in tree order. Equal elements compare equal. */
export function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
	if (a === b) return 0;
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}
