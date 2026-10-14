// Button behavior for native and non-native hosts, shared by every part that acts as a button.
// Derived from Base UI v1.8.0 packages/react/src/internals/use-button/useButton.ts
// and packages/react/src/utils/useFocusableWhenDisabled.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). Composite `aria-disabled` follows v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { DEV } from 'esm-env';
import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { error } from '@sveltery/utils';
import { dispatchClick } from './click.js';

export interface ButtonOptions {
	disabled: boolean;
	/** `nativeButton`: the host is a `<button>`. */
	native: boolean;
	/** A disabled button stays focusable. A native one gets `aria-disabled` instead of `disabled`. */
	focusableWhenDisabled?: boolean;
	/** Composite items click on Space keydown. Their composite owns `tabindex`. */
	composite?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each part types its own currentTarget
type Handler = ((event: any) => unknown) | null | undefined;

interface ButtonHandlers {
	onclick?: Handler;
	onmousedown?: Handler;
	onpointerdown?: Handler;
	onkeydown?: Handler;
	onkeyup?: Handler;
}

/** `external` with the button attributes added and its handlers wrapped. */
export type WithButtonBehavior<T> = T & {
	onclick: (event: MouseEvent) => void;
	onmousedown: (event: MouseEvent) => void;
	onpointerdown: (event: PointerEvent) => void;
	onkeydown: (event: KeyboardEvent) => void;
	onkeyup: (event: KeyboardEvent) => void;
} & Record<symbol, Attachment<HTMLElement>>;

const NATIVE_MISMATCH =
	'A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` snippet, or set `nativeButton` to `false`.';
const NON_NATIVE_MISMATCH =
	'A component that acts as a button expected a non-<button> because the `nativeButton` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as `role` or `aria-disabled`). Use a non-<button> in the `render` snippet, or set `nativeButton` to `true`.';

function currentHost(event: Event): HTMLElement | null {
	const current = event.currentTarget;
	if (!(current instanceof HTMLElement) || event.target !== current) return null;
	return current;
}

function isButton(element: HTMLElement) {
	return element.tagName === 'BUTTON';
}

function isLink(element: HTMLElement) {
	return element.tagName === 'A' && Boolean((element as HTMLAnchorElement).href);
}

export class ButtonBehavior {
	readonly #checkKey = createAttachmentKey();
	readonly #keepFocusableKey = createAttachmentKey();

	constructor(private readonly options: () => ButtonOptions) {}

	#checkHost = (node: HTMLElement) => {
		const native = this.options().native;
		if (native && !isButton(node)) error(NATIVE_MISMATCH);
		else if (!native && isButton(node)) error(NON_NATIVE_MISMATCH);
	};

	/**
	 * A focusable disabled composite button ends without native `disabled`, even when a part it
	 * renders, such as a Menu.Trigger given Toolbar.Button's forwarded `disabled`, set it.
	 */
	#keepFocusable = (node: HTMLElement) => {
		const { disabled, native, focusableWhenDisabled, composite } = this.options();
		if (composite && disabled && (focusableWhenDisabled || !native) && isButton(node)) {
			(node as HTMLButtonElement).disabled = false;
		}
	};

	/**
	 * Host props: button attributes, then `external`, with its click, press and key handlers
	 * wrapped. A disabled button skips them. `preventDefault()` in a handler skips activation.
	 */
	props<T extends object>(external: T): WithButtonBehavior<T> {
		const { onclick, onmousedown, onpointerdown, onkeydown, onkeyup, ...rest } = external as T &
			ButtonHandlers;
		const { disabled, native, focusableWhenDisabled, composite = false } = this.options();
		// Upstream `useFocusableWhenDisabled`: a composite item that leaves the option unset is
		// focusable when disabled for `aria-disabled`, and still gets native `disabled`.
		const focusableComposite = composite && focusableWhenDisabled !== false;
		const nonFocusableComposite = composite && focusableWhenDisabled === false;

		return {
			...(native ? { type: 'button' as const } : { role: 'button' as const }),
			...(composite ? {} : { tabindex: !native && disabled && !focusableWhenDisabled ? -1 : 0 }),
			...((native && (focusableWhenDisabled || focusableComposite)) || (!native && disabled)
				? { 'aria-disabled': disabled }
				: {}),
			...(native && (!focusableWhenDisabled || nonFocusableComposite) && disabled
				? { disabled: true as const }
				: {}),
			...(DEV ? { [this.#checkKey]: this.#checkHost } : {}),
			[this.#keepFocusableKey]: this.#keepFocusable,
			...rest,
			onclick: (event: MouseEvent) => {
				if (this.options().disabled) {
					event.preventDefault();
					return;
				}
				onclick?.(event);
			},
			// Pinned behavior, tracked in https://github.com/sveltery/base/issues/66 :
			// a disabled mousedown does not cancel its default, so a chorded press can still focus.
			onmousedown: (event: MouseEvent) => {
				if (!this.options().disabled) onmousedown?.(event);
			},
			onpointerdown: (event: PointerEvent) => {
				if (this.options().disabled) {
					event.preventDefault();
					return;
				}
				onpointerdown?.(event);
			},
			onkeydown: (event: KeyboardEvent) => this.#keydown(event, onkeydown),
			onkeyup: (event: KeyboardEvent) => this.#keyup(event, onkeyup)
		} as WithButtonBehavior<T>;
	}

	#keydown(event: KeyboardEvent, onkeydown: Handler) {
		const { disabled, native, focusableWhenDisabled, composite } = this.options();
		if (disabled) {
			// Let Tab leave a focusable disabled button. Block every other key's default.
			if (focusableWhenDisabled && event.key !== 'Tab') event.preventDefault();
			return;
		}

		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const host = currentHost(event);
		if (!host) return;
		const isEnter = event.key === 'Enter';
		const isSpace = event.key === ' ';

		// preventDefault also stops a native button from clicking again on keyup.
		if (composite && isSpace) {
			event.preventDefault();
			if (!native || isButton(host)) dispatchClick(host, event);
			return;
		}

		// Native buttons activate themselves. Links keep Enter and only stop Space from scrolling.
		const link = !native && isLink(host);
		if (native || link || (!isEnter && !isSpace)) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
		if (isEnter) dispatchClick(host, event);
	}

	/** A prevented keydown does not cancel the Space click. `preventDefault()` on this keyup does. */
	#keyup(event: KeyboardEvent, onkeyup: Handler) {
		const { disabled, native, composite } = this.options();
		if (disabled) return;

		onkeyup?.(event);
		if (event.defaultPrevented || event.key !== ' ') return;

		const host = currentHost(event);
		if (!host) return;
		if (composite) {
			// The keydown already clicked. Swallow the native button's own Space keyup click.
			if (native && isButton(host)) event.preventDefault();
			return;
		}
		if (!native) dispatchClick(host, event);
	}
}
