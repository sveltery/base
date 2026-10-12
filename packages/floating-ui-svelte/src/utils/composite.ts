// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/composite.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Phase 1a ports isElementVisible only. List navigation stays in this file later.

export function isHiddenByStyles(styles: CSSStyleDeclaration) {
	return styles.visibility === 'hidden' || styles.visibility === 'collapse';
}

export function isElementVisible(
	element: Element | null,
	styles: CSSStyleDeclaration | null = element ? getComputedStyle(element) : null
) {
	if (!element || !element.isConnected || !styles || isHiddenByStyles(styles)) {
		return false;
	}

	if (typeof element.checkVisibility === 'function') {
		return element.checkVisibility();
	}

	return styles.display !== 'none' && styles.display !== 'contents';
}
