// Base UI v1.8.0 utils/styles.tsx; MIT: THIRD_PARTY_NOTICES.md.
// Native markup replaces the React getElement/stylesheet hoisting boundary.
import StyleDisableScrollbar from './StyleDisableScrollbar.svelte';
const DISABLE_SCROLLBAR_CLASS_NAME = 'base-ui-disable-scrollbar';
export const styleDisableScrollbar = {
  className: DISABLE_SCROLLBAR_CLASS_NAME,
  css: `.${DISABLE_SCROLLBAR_CLASS_NAME}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS_NAME}::-webkit-scrollbar{display:none}`,
  getElement: StyleDisableScrollbar,
};
