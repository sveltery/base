// Non-composite button behavior shared by Popover.Trigger and Popover.Close.
// Derived from the non-composite path of packages/react/src/internals/use-button/useButton.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { currentHost, dispatchClick, isLink } from '../internal/click.js';
import type { LooseProps } from './loose-props.js';

export function buttonProps(disabled: boolean, nativeButton: boolean): LooseProps {
	if (nativeButton) {
		return {
			type: 'button',
			...(disabled ? { disabled: true } : { tabindex: 0 })
		};
	}
	return {
		role: 'button',
		...(disabled ? { 'aria-disabled': true as const, tabindex: -1 } : { tabindex: 0 })
	};
}

export function guardDisabled(disabled: boolean) {
	return {
		onclick(event: MouseEvent) {
			if (disabled) event.preventDefault();
		},
		onpointerdown(event: PointerEvent) {
			if (disabled) event.preventDefault();
		},
		onmousedown(event: MouseEvent) {
			if (disabled) event.preventDefault();
		},
		onkeydown(event: KeyboardEvent) {
			if (disabled && event.key !== 'Tab') event.preventDefault();
		}
	};
}

export function nonNativeKeys(disabled: boolean, nativeButton: boolean) {
	return {
		onkeydown(event: KeyboardEvent) {
			if (disabled || nativeButton || event.defaultPrevented) return;
			const current = currentHost(event);
			if (!current) return;
			const link = isLink(current, nativeButton);
			const isEnter = event.key === 'Enter';
			const isSpace = event.key === ' ';
			if (!isEnter && !isSpace) return;
			if (link) {
				if (isSpace) event.preventDefault();
				return;
			}
			event.preventDefault();
			if (isEnter) dispatchClick(current, event);
		},
		onkeyup(event: KeyboardEvent) {
			if (disabled || nativeButton || event.defaultPrevented || event.key !== ' ') return;
			const current = currentHost(event);
			if (!current || isLink(current, nativeButton)) return;
			dispatchClick(current, event);
		}
	};
}
