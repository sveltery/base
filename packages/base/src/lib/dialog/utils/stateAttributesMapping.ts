// Ported from Base UI v1.8.0 dialog/utils/stateAttributesMapping.ts; MIT: THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping.js';
import { popupStateMapping } from '../../utils/popupStateMapping.js';
import type { TransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
import * as DialogPopupDataAttributes from '../popup/DialogPopupDataAttributes.js';

/**
 * Shared by `Dialog.Popup` and `Dialog.Viewport`, whose states have the same shape.
 * `nested` is not mapped: unmapped `true` booleans already render as `data-nested`.
 */
export const dialogStateAttributesMapping: StateAttributesMapping<{
  open: boolean;
  transitionStatus: TransitionStatus;
  nested: boolean;
  nestedDialogOpen: boolean;
}> = {
  ...popupStateMapping,
  ...transitionStatusMapping,
  nestedDialogOpen(value) {
    return value ? { [DialogPopupDataAttributes.nestedDialogOpen]: '' } : null;
  },
};
