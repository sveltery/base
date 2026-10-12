// The only door from component files into the popup store.

export { FocusGuard } from '@sveltery/utils';
export { default as InternalBackdrop } from '../InternalBackdrop.svelte';
export {
	CommonPopupDataAttributes,
	CommonTriggerDataAttributes,
	popupStateMapping,
	popupTransitionStateMapping,
	pressableTriggerOpenStateMapping,
	triggerOpenStateMapping
} from '../popupStateMapping.js';
export { useScrollLock } from '../useScrollLock.svelte.js';
export {
	useOpenInteractionType,
	type OpenInteractionType,
	type OpenPointerKind
} from '@sveltery/utils';
export { useAnchoredPopupScrollLock } from '../useAnchoredPopupScrollLock.svelte.js';
export {
	AnchorPositioning,
	anchorAutoUpdateOptions,
	type Align,
	type Side,
	type AnchorPositioningParameters
} from '../useAnchorPositioning.svelte.js';
export { TriggerFocusGuards } from './triggerFocusGuards.js';
export * as CommonPositionerCssVars from '../CommonPositionerCssVars.js';
export type { TransitionStatusValue } from '../useTransitionStatus.svelte.js';
export { PopupTriggerMap } from '@sveltery/floating-ui-svelte';
export {
	FOCUSABLE_POPUP_PROPS,
	attachPreventUnmountOnClose,
	createDefaultInitialFocus,
	createPopupOpenState,
	registerTrigger,
	resolveFocus,
	type PopupFocusTarget
} from './popupStoreUtils.js';
export {
	PopupStore,
	type PopupChangeEventDetails,
	type PopupStoreOptions
} from './store.svelte.js';
export { PopupHandle, type PopupHandleStore } from './popupHandle.svelte.js';
