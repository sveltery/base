// Derived from Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Tabs and Toolbar share this skip rule. RadioGroup also skips `aria-disabled`.

/** Natively disabled and hidden hosts cannot take the tab stop. `aria-disabled` can. */
export function isSkipped(element: HTMLElement) {
	if (!element.isConnected) return true;
	if (element.matches(':disabled')) return true;
	const styles = getComputedStyle(element);
	if (styles.visibility === 'hidden' || styles.visibility === 'collapse') return true;
	if (typeof element.checkVisibility === 'function') return !element.checkVisibility();
	return styles.display === 'none' || styles.display === 'contents';
}
