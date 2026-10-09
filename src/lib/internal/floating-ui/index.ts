// The only door from component files into the floating-ui fork.

export { default as FloatingFocusManager } from '../floating-ui-react/components/FloatingFocusManager.svelte';
export { default as FloatingPortal } from '../floating-ui-react/components/FloatingPortal.svelte';
export {
	setFloatingTree,
	useFloatingNodeId,
	useFloatingParentNodeId,
	useFloatingTree
} from '../floating-ui-react/components/FloatingTree.svelte.js';
export { useClick } from '../floating-ui-react/hooks/useClick.svelte.js';
export { useDismiss } from '../floating-ui-react/hooks/useDismiss.svelte.js';
export { useHoverFloatingInteraction } from '../floating-ui-react/hooks/useHoverFloatingInteraction.svelte.js';
export { useHoverReferenceInteraction } from '../floating-ui-react/hooks/useHoverReferenceInteraction.svelte.js';
export { safePolygon } from '../floating-ui-react/safePolygon.js';
export { CLICK_TRIGGER_IDENTIFIER } from '../floating-ui-react/utils/constants.js';
export { stopEvent } from '../floating-ui-react/utils/event.js';
