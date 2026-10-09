// Non-composite button behavior for popup triggers and close buttons.
// Derived from packages/react/src/internals/use-button/useButton.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { clickOnSpaceKeyUp, currentHost, dispatchClick, isLink } from './click.js';
import { mergeProps } from './mergeProps.js';

const HANDLER_KEYS = ['onclick', 'onmousedown', 'onpointerdown', 'onkeydown', 'onkeyup'] as const;

type HandlerKey = (typeof HANDLER_KEYS)[number];

function readHandler<T>(props: object, key: HandlerKey) {
	const value = (props as Record<string, unknown>)[key];
	return typeof value === 'function' ? (value as (event: T) => void) : undefined;
}

function omitHandlers(props: object) {
	const rest: Record<PropertyKey, unknown> = {};
	for (const key of Reflect.ownKeys(props)) {
		if (typeof key === 'string' && (HANDLER_KEYS as readonly string[]).includes(key)) continue;
		rest[key] = (props as Record<PropertyKey, unknown>)[key];
	}
	return rest;
}

export function useButton(disabled: boolean, nativeButton: boolean, elementProps: object = {}) {
	const onclick = readHandler<MouseEvent>(elementProps, 'onclick');
	const onmousedown = readHandler<MouseEvent>(elementProps, 'onmousedown');
	const onpointerdown = readHandler<PointerEvent>(elementProps, 'onpointerdown');
	const onkeydown = readHandler<KeyboardEvent>(elementProps, 'onkeydown');
	const onkeyup = readHandler<KeyboardEvent>(elementProps, 'onkeyup');

	return mergeProps(
		buttonProps(disabled, nativeButton),
		nonNativeKeys(disabled, nativeButton),
		{
			onclick(event: MouseEvent) {
				if (disabled) {
					event.preventDefault();
					return;
				}
				onclick?.(event);
			},
			onmousedown(event: MouseEvent) {
				if (!disabled) onmousedown?.(event);
			},
			onpointerdown(event: PointerEvent) {
				if (disabled) {
					event.preventDefault();
					return;
				}
				onpointerdown?.(event);
			},
			onkeydown(event: KeyboardEvent) {
				if (disabled) return;
				onkeydown?.(event);
			},
			onkeyup(event: KeyboardEvent) {
				if (disabled) return;
				onkeyup?.(event);
			}
		},
		omitHandlers(elementProps)
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
