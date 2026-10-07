import type { Snippet } from 'svelte';

/** Reading direction. Matches Base UI `TextDirection`. */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Live reading direction from the nearest `DirectionProvider`.
 * `direction` is `ltr` when no provider is mounted.
 * Read it in the template or in `$derived`.
 *
 * Upstream `useDirection()` returns the string itself. Svelte keeps the
 * provider prop as the source of truth, so callers read this property
 * instead of copying it into state.
 */
export interface DirectionReading {
	readonly direction: TextDirection;
}

export interface DirectionProviderProps {
	/**
	 * The reading direction of the text.
	 * @default 'ltr'
	 */
	direction?: TextDirection;
	children?: Snippet;
}
