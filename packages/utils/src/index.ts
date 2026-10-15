export { areArraysEqual } from './areArraysEqual.js';
export {
	REASONS,
	createChangeEventDetails,
	createGenericEventDetails,
	type BaseUIChangeEventDetails,
	type BaseUIGenericEventDetails,
	type BaseUIHighlightEventDetails,
	type ReasonToEvent
} from './event-details.js';
export { default as FocusGuard } from './FocusGuard.svelte';
export { matchesFocusVisible } from './focus-visible.js';
export { error, resetLogged, warn } from './log.js';
export {
	useOpenInteractionType,
	type OpenInteractionType,
	type OpenPointerKind
} from './openInteraction.js';
export { ownerDocument, ownerWindow } from './owner.js';
export { platform } from './platform.js';
export { activeElement, closest, contains, getTarget } from './shadow-dom.js';
export {
	AnimationFrame,
	Interval,
	Timeout,
	TimeoutManager,
	resetAnimationFrameScheduler
} from './timeout.js';
export { ScopedAnimationFrame, ScopedInterval, ScopedTimeout } from './timeout.svelte.js';
export { visuallyHidden, visuallyHiddenInput, visuallyHiddenStyle } from './visuallyHidden.js';
