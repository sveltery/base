// Derived from Base UI v1.8.0 COMPOSITE_KEYS
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Arrow, Home, and End stay inside a composite. Slider adds Page Up and Page Down beside this set.

export const ARROW_DOWN = 'ArrowDown';
export const ARROW_UP = 'ArrowUp';
export const ARROW_RIGHT = 'ArrowRight';
export const ARROW_LEFT = 'ArrowLeft';
export const HOME = 'Home';
export const END = 'End';

export const COMPOSITE_KEYS = new Set([ARROW_DOWN, ARROW_UP, ARROW_RIGHT, ARROW_LEFT, HOME, END]);

/** Arrow keys only. Toolbar and RadioGroup do not treat Home or End as composite keys. */
export const ARROW_KEYS = new Set([ARROW_DOWN, ARROW_UP, ARROW_RIGHT, ARROW_LEFT]);
