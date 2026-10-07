// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/event.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { platform } from '../../platform.js';

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
		(platform.os.android &&
			event.width === 1 &&
			event.height === 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'mouse') ||
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
