// Derived from Base UI v1.8.0 packages/react/src/utils/dispatchClickWithModifiers.ts
// and the host check in packages/react/src/internals/use-button/useButton.ts
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

/**
 * Space on keyup clicks a non-native host. The caller already ran `onkeyup`.
 * A prevented keydown does not cancel this keyup. `preventDefault()` on this keyup does.
 */
export function clickOnSpaceKeyUp(event: KeyboardEvent, nativeButton: boolean) {
	if (event.defaultPrevented || nativeButton || event.key !== ' ') return;
	const current = currentHost(event);
	if (current) dispatchClick(current, event);
}

/**
 * Disabled hosts ignore keyup. Otherwise the consumer runs, then Space clicks a non-native host.
 */
export function forwardKeyUp<T extends HTMLElement>(
	event: KeyboardEvent & { currentTarget: EventTarget & T },
	disabled: boolean,
	onkeyup: ((event: KeyboardEvent & { currentTarget: EventTarget & T }) => void) | undefined | null,
	nativeButton: boolean
) {
	if (disabled) return;
	onkeyup?.(event);
	clickOnSpaceKeyUp(event, nativeButton);
}

export function currentHost(event: Event): HTMLElement | null {
	const current = event.currentTarget;
	if (!(current instanceof HTMLElement) || event.target !== current) return null;
	return current;
}

export function isLink(element: HTMLElement, nativeButton: boolean) {
	return !nativeButton && element instanceof HTMLAnchorElement && Boolean(element.href);
}
