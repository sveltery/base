// Derived from Base UI v1.9.0 packages/react/src/utils/styles.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export const DISABLE_SCROLLBAR_CLASS = 'base-ui-disable-scrollbar';

export const DISABLE_SCROLLBAR_CSS = `.${DISABLE_SCROLLBAR_CLASS}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS}::-webkit-scrollbar{display:none}`;

const PRECEDENCE = 'base-ui:low';
const HOISTED_SELECTOR = `style[data-href="${DISABLE_SCROLLBAR_CLASS}"]`;

function shadowRoot(node: Node) {
	const root = node.getRootNode();
	return root.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? (root as ShadowRoot) : null;
}

export function isDisableScrollbarStyleHoisted() {
	return typeof document !== 'undefined' && document.querySelector(HOISTED_SELECTOR) !== null;
}

/**
 * Inserts the style once per document or shadow root and never removes it, as React 19 does
 * for `<style href precedence>`: after the last style of the same precedence, else after the
 * last precedence style, else first in the head.
 */
export function hoistDisableScrollbarStyle(node: Node, nonce: string | undefined) {
	const doc = node.ownerDocument!;
	const shadow = shadowRoot(node);
	const root = shadow ?? doc;
	if (root.querySelector(HOISTED_SELECTOR)) return;

	const style = doc.createElement('style');
	style.dataset.href = DISABLE_SCROLLBAR_CLASS;
	style.dataset.precedence = PRECEDENCE;
	if (nonce != null) style.setAttribute('nonce', nonce);
	style.textContent = DISABLE_SCROLLBAR_CSS;

	const ranked = root.querySelectorAll<HTMLElement>(
		'link[rel="stylesheet"][data-precedence],style[data-precedence]'
	);
	const last = ranked.length ? ranked[ranked.length - 1] : null;
	let prior = last;
	for (const item of ranked) {
		if (item.dataset.precedence === PRECEDENCE) prior = item;
		else if (prior !== last) break;
	}
	if (prior) prior.after(style);
	else (shadow ?? doc.head).prepend(style);
}
