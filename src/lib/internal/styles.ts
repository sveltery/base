// Derived from Base UI v1.8.0 packages/react/src/utils/styles.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The style element is rendered by the component, so only the class and CSS move here.

export const DISABLE_SCROLLBAR_CLASS = 'base-ui-disable-scrollbar';

export const DISABLE_SCROLLBAR_CSS = `.${DISABLE_SCROLLBAR_CLASS}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS}::-webkit-scrollbar{display:none}`;
