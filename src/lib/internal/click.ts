// Derived from Base UI v1.9.0 packages/react/src/utils/dispatchClickWithModifiers.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Untrusted constructed clicks carry modifier state. `detail: 0` and an empty `pointerType`
// match a keyboard click. A click that stands for a mouse gesture passes `detail: 1` and
// `pointerType: 'mouse'`. Chromium does not run link or form activation for this event;
// HTMLElement.click() would, and would drop the modifiers.

export function dispatchClick(
	target: HTMLElement,
	source: { shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean },
	{ detail = 0, pointerType = '' }: { detail?: number; pointerType?: string } = {}
) {
	const view = target.ownerDocument.defaultView ?? window;
	target.dispatchEvent(
		new view.PointerEvent('click', {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail,
			pointerType,
			shiftKey: source.shiftKey,
			ctrlKey: source.ctrlKey,
			altKey: source.altKey,
			metaKey: source.metaKey
		})
	);
}
