// Arrow, Home, and End match Base UI's COMPOSITE_KEYS. Slider also handles Page Up and Page Down.
// Those keys change the thumb value. They do not move focus to another thumb.

import { COMPOSITE_KEYS } from '../internal/compositeKeys.js';

export const ARROW_DOWN = 'ArrowDown';
export const ARROW_UP = 'ArrowUp';
export const ARROW_RIGHT = 'ArrowRight';
export const ARROW_LEFT = 'ArrowLeft';
export const HOME = 'Home';
export const END = 'End';
export const PAGE_UP = 'PageUp';
export const PAGE_DOWN = 'PageDown';

export { COMPOSITE_KEYS };

export const ALL_KEYS = new Set([...COMPOSITE_KEYS, PAGE_UP, PAGE_DOWN]);
