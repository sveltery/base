// The only door from component files into the popup store.

export { default as FocusGuard } from '../FocusGuard.svelte';
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
} from '../openInteraction.js';
export { useAnchoredPopupScrollLock } from '../useAnchoredPopupScrollLock.svelte.js';
export {
	useAnchorPositioning,
	anchorAutoUpdateOptions,
	type Align,
	type Side,
	type UseAnchorPositioningParameters,
	type UseAnchorPositioningReturn
} from '../useAnchorPositioning.svelte.js';
export { useTriggerFocusGuards } from './useTriggerFocusGuards.js';
export * as CommonPositionerCssVars from '../CommonPositionerCssVars.js';
export type { PopupTransitionStatus } from '../useTransitionStatus.svelte.js';
export { PopupTriggerMap } from './popupTriggerMap.js';
export {
	FOCUSABLE_POPUP_PROPS,
	attachPreventUnmountOnClose,
	createDefaultInitialFocus,
	createPopupOpenState,
	registerTrigger,
	resolveFocus,
	type PopupFocusTarget
} from './popupStoreUtils.js';
export { BasePopupHandle, type PopupHandleStore } from './popupHandle.js';
export {
	PopupStore,
	type PopupChangeEventDetails,
	type PopupStoreOptions
} from './store.svelte.js';
