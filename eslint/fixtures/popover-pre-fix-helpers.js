// Copied from the pre-fix Popover helpers (button.ts, open-method.ts,
// focus-target.ts, adaptive-origin.ts, constants.ts, handle.svelte.ts).
// Types and runes are stripped so the lint parser can read the copy.
// This file must keep failing sveltery/no-copied-helper.

export function buttonProps(disabled, nativeButton) {
	if (nativeButton) {
		return {
			type: 'button',
			...(disabled ? { disabled: true } : { tabindex: 0 })
		};
	}
	return {
		role: 'button',
		...(disabled ? { 'aria-disabled': true, tabindex: -1 } : { tabindex: 0 })
	};
}

export function guardDisabled(disabled) {
	return {
		onclick(event) {
			if (disabled) event.preventDefault();
		},
		onpointerdown(event) {
			if (disabled) event.preventDefault();
		},
		onmousedown(event) {
			if (disabled) event.preventDefault();
		},
		onkeydown(event) {
			if (disabled && event.key !== 'Tab') event.preventDefault();
		}
	};
}

export function nonNativeKeys(disabled, nativeButton) {
	return {
		onkeydown(event) {
			if (disabled || nativeButton || event.defaultPrevented) return;
			const current = event.currentTarget;
			if (!current) return;
			const isEnter = event.key === 'Enter';
			const isSpace = event.key === ' ';
			if (!isEnter && !isSpace) return;
			event.preventDefault();
		},
		onkeyup(event) {
			if (disabled || nativeButton || event.defaultPrevented || event.key !== ' ') return;
			const current = event.currentTarget;
			if (!current) return;
		}
	};
}

export function openMethodProps(store, readOpen) {
	let pointer;
	return {
		onpointerdown(event) {
			pointer = event.pointerType;
			store.lastInteraction = pointer === 'touch' ? 'touch' : 'mouse';
		},
		onkeydown(event) {
			if (event.key === 'Enter' || event.key === ' ') store.lastInteraction = 'keyboard';
		},
		onclick(event) {
			if (readOpen()) return;
			store.openMethod = event.detail === 0 ? 'keyboard' : 'mouse';
			store.lastInteraction = store.openMethod;
		}
	};
}

export function resolveFocus(spec, interaction, popup) {
	const kind = interaction || '';
	if (spec === undefined) {
		if (kind === 'touch') return popup ?? false;
		return true;
	}
	if (typeof spec === 'function') {
		const result = spec(kind);
		if (result instanceof HTMLElement) return result;
		if (result === false || result === undefined) return false;
		return true;
	}
	if (spec instanceof HTMLElement) return spec;
	if (spec === false) return false;
	return true;
}

export const adaptiveOrigin = {
	name: 'adaptiveOrigin',
	async fn(state) {
		return { x: state.x, y: state.y, data: { sideX: 'left', sideY: 'top' } };
	}
};

export const COMPOSITE_KEYS = new Set([
	'ArrowDown',
	'ArrowUp',
	'ArrowRight',
	'ArrowLeft',
	'Home',
	'End'
]);

export class PopoverHandle {
	constructor() {
		this.current = null;
		this.fallbackOpen = undefined;
	}

	get isOpen() {
		return this.current?.open ?? false;
	}

	attach(store) {
		this.current = store;
		return () => {
			this.current = null;
		};
	}

	open(triggerId) {
		this.current?.setOpen(true, triggerId);
	}
}
