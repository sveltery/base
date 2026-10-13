// Helpers that already live in this package and that NavigationMenu needs from outside it.
// The safe-polygon pointer-events lock keeps one owner per scope element in a module map,
// so a copy outside this package would not see the lock that hover interactions applied.

export {
	applySafePolygonPointerEventsMutation,
	clearSafePolygonPointerEventsMutation,
	hoverInteraction
} from './hooks/useHoverInteractionSharedState.svelte.js';
export { getNodeChildren } from './components/FloatingTreeStore.js';
export {
	disableFocusInside,
	enableFocusInside,
	getNextTabbable,
	getPreviousTabbable
} from './utils/tabbable.js';
