// Derived from Base UI v1.8.0 packages/react/src/utils/dispatchClickWithModifiers.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Untrusted constructed clicks carry modifier state. detail 0 matches a keyboard click.
// Chromium does not run link or form activation for this event; HTMLElement.click() would,
// and would drop the modifiers.

export function dispatchClick(
	target: HTMLElement,
	source: { shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }
) {
	const view = target.ownerDocument.defaultView ?? window;
	target.dispatchEvent(
		new view.PointerEvent('click', {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail: 0,
			shiftKey: source.shiftKey,
			ctrlKey: source.ctrlKey,
			altKey: source.altKey,
			metaKey: source.metaKey
		})
	);
}
