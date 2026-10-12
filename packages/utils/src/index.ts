export {
	REASONS,
	createChangeEventDetails,
	createGenericEventDetails,
	type BaseUIChangeEventDetails,
	type BaseUIGenericEventDetails
} from './event-details.js';
export { default as FocusGuard } from './FocusGuard.svelte';
export {
	useOpenInteractionType,
	type OpenInteractionType,
	type OpenPointerKind
} from './openInteraction.js';
export { ownerDocument, ownerWindow } from './owner.js';
export { platform } from './platform.js';
export { activeElement, contains, getTarget } from './shadow-dom.js';
export {
	AnimationFrame,
	Interval,
	Timeout,
	TimeoutManager,
	resetAnimationFrameScheduler
} from './timeout.js';
export { useAnimationFrame, useInterval, useTimeout } from './timeout.svelte.js';
export { visuallyHidden, visuallyHiddenInput, visuallyHiddenStyle } from './visuallyHidden.js';
