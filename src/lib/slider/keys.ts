// Arrow, Home, and End are the shared COMPOSITE_KEYS. Slider also handles Page Up and Page Down.
// Those keys change the thumb value. They do not move focus to another thumb.

import {
	ARROW_DOWN,
	ARROW_LEFT,
	ARROW_RIGHT,
	ARROW_UP,
	COMPOSITE_KEYS,
	END,
	HOME
} from '../internal/composite-keys.js';

export { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, COMPOSITE_KEYS, END, HOME };

export const PAGE_UP = 'PageUp';
export const PAGE_DOWN = 'PageDown';

export const ALL_KEYS = new Set([...COMPOSITE_KEYS, PAGE_UP, PAGE_DOWN]);
