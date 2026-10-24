import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';

/** What one slot renders. */
export interface InputOTPSlot {
	/** Whether the selection covers this slot while the input is focused. */
	isActive: boolean;
	/** The character in this slot, or `null` when it is empty. */
	char: string | null;
	/** The `placeholder` character for this slot while the whole value is empty. */
	placeholderChar: string | null;
	/** Whether this slot is active and empty, so it shows a caret. */
	hasFakeCaret: boolean;
}

export interface InputOTPRootState {
	/** One entry per slot. */
	readonly slots: InputOTPSlot[];
	/** Whether the input is focused. */
	readonly isFocused: boolean;
	/** Whether the pointer is over the input and it is not disabled. */
	readonly isHovering: boolean;
}

export interface InputOTPRootProps extends Omit<
	HTMLInputAttributes,
	'value' | 'defaultValue' | 'maxlength' | 'pattern' | 'placeholder' | 'children'
> {
	/** The code. */
	value?: string;
	/** The code an empty `value` starts from. @default '' */
	defaultValue?: string;
	/** The number of slots. */
	maxlength: number;
	/** The text alignment of the input. @default 'left' */
	textAlign?: 'left' | 'center' | 'right';
	/** Every value must match it, for example `REGEXP_ONLY_DIGITS`. Input that doesn't match is dropped. */
	pattern?: string | RegExp;
	/** Characters shown in the empty slots, one per slot, through `placeholderChar`. */
	placeholder?: string;
	/** Called with the value when the last slot fills. */
	onComplete?: (value: string) => void;
	/** Widens the input so a password manager's badge sits outside the slots. @default 'increase-width' */
	pushPasswordManagerStrategy?: 'increase-width' | 'none';
	/** Rewrites pasted text before it is inserted. */
	pasteTransformer?: (pasted: string) => string;
	/** Class for the container that holds the slots and the input. */
	containerClass?: HTMLAttributes<HTMLDivElement>['class'];
	/** CSS that shows the plain input when JavaScript is off. `null` leaves it out. */
	noScriptCSSFallback?: string | null;
	/** Renders the slots from the state. Without it, `children` renders and reads the state with `getInputOTPContext()`. */
	render?: Snippet<[state: InputOTPRootState]>;
	children?: Snippet;
}
