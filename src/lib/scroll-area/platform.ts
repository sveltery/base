// Derived from Base UI v1.8.0 packages/utils/src/platform/engine.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Scroll area only branches on WebKit, where `CSS.registerProperty({ inherits: false })`
// breaks `inherit` on child elements.

export const webkit =
	typeof CSS !== 'undefined' && !!CSS.supports?.('-webkit-backdrop-filter:none');
