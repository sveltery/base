// Derived from Base UI v1.9.0 packages/react/src/utils/styles.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The style element is rendered by the component, so only the class and CSS move here.

export const DISABLE_SCROLLBAR_CLASS = 'base-ui-disable-scrollbar';

export const DISABLE_SCROLLBAR_CSS = `.${DISABLE_SCROLLBAR_CLASS}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS}::-webkit-scrollbar{display:none}`;
