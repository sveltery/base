// Derived from Base UI v1.8.0 packages/utils/src/platform/os.ts and engine.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Only the flags NumberField branches on: iOS keyboard mode, WebKit pointer-lock, Firefox release.

const lowerUserAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent.toLowerCase();
const lowerPlatform = typeof navigator === 'undefined' ? '' : navigator.platform.toLowerCase();
const maxTouchPoints = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints;

export const ios =
	/^i(os$|p)/.test(lowerPlatform) || (lowerPlatform === 'macintel' && maxTouchPoints > 1);

export const webkit =
	typeof CSS !== 'undefined' && !!CSS.supports?.('-webkit-backdrop-filter:none');

export const gecko = !webkit && lowerUserAgent.includes('firefox');
