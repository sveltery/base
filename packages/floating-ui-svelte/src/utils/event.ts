// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/event.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { platform } from '@sveltery/utils';

export function stopEvent(event: Event) {
	event.preventDefault();
	event.stopPropagation();
}

export function isVirtualClick(event: MouseEvent | PointerEvent): boolean {
	if ('pointerType' in event && event.pointerType === '' && event.isTrusted) return true;
	if (platform.os.android && 'pointerType' in event && event.pointerType) {
		return event.type === 'click' && event.buttons === 1;
	}
	return event.detail === 0 && !('pointerType' in event && event.pointerType);
}

export function isVirtualPointerEvent(event: PointerEvent) {
	if (platform.env.jsdom) return false;
	return (
		(!platform.os.android && event.width === 0 && event.height === 0) ||
		// Chrome reports a screen reader press as a 1x1 mouse `pointerdown` with no pressure.
		// TalkBack can report a pressed button. A desktop mouse press can report no pressure.
		(event.type === 'pointerdown' &&
			event.width === 1 &&
			event.height === 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'mouse' &&
			(platform.os.android || event.buttons === 0)) ||
		(event.width < 1 &&
			event.height < 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'touch')
	);
}

export function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean) {
	const values: Array<string | undefined> = ['mouse', 'pen'];
	if (!strict) values.push('', undefined);
	return values.includes(pointerType);
}
