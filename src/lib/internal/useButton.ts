// Non-composite button behavior for popup triggers and close buttons.
// Derived from packages/react/src/internals/use-button/useButton.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { clickOnSpaceKeyUp, currentHost, dispatchClick, isLink } from './click.js';
import { mergeProps } from './mergeProps.js';

export function useButton(disabled: boolean, nativeButton: boolean) {
	return mergeProps(
		buttonProps(disabled, nativeButton),
		nonNativeKeys(disabled, nativeButton),
		guardDisabled(disabled)
	);
}

function buttonProps(disabled: boolean, nativeButton: boolean) {
	if (nativeButton) {
		return {
			type: 'button' as const,
			...(disabled ? { disabled: true } : { tabindex: 0 })
		};
	}
	return {
		role: 'button' as const,
		...(disabled ? { 'aria-disabled': true as const, tabindex: -1 } : { tabindex: 0 })
	};
}

function guardDisabled(disabled: boolean) {
	return {
		onclick(event: MouseEvent) {
			if (!disabled) return;
			event.preventDefault();
			event.preventBaseUIHandler?.();
		},
		onpointerdown(event: PointerEvent) {
			if (!disabled) return;
			event.preventDefault();
			event.preventBaseUIHandler?.();
		},
		onmousedown(event: MouseEvent) {
			if (disabled) event.preventBaseUIHandler?.();
		},
		onkeydown(event: KeyboardEvent) {
			if (disabled && event.key !== 'Tab') event.preventBaseUIHandler?.();
		}
	};
}

function nonNativeKeys(disabled: boolean, nativeButton: boolean) {
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
			if (disabled) return;
			const current = currentHost(event);
			if (current && isLink(current, nativeButton)) return;
			clickOnSpaceKeyUp(event, nativeButton);
		}
	};
}
