// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PreviewCardHandle } from './store/PreviewCardHandle.svelte.js';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PreviewCardRootState {}
export type PreviewCardRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'imperative-action' | 'none';
export type PreviewCardRootChangeEventDetails = BaseUIChangeEventDetails<PreviewCardRootChangeEventReason, { preventUnmountOnClose(): void }>;
export interface PreviewCardRootActions { unmount(): void; close(): void }
export interface PreviewCardRootProps<Payload = unknown> {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: PreviewCardRootChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actions?: PreviewCardRootActions | null | undefined;
  handle?: PreviewCardHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
}

import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { Side, Align, AnchorPositioningOptions } from '../internals/anchor-positioning/types.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export type ElementProps<State, Native = HTMLAttributes<HTMLElement>> = Omit<WithBaseUIEvent<Native>, 'class' | 'style' | 'children'> & BaseUIComponentProps<State> & { children?: Snippet | undefined; ref?: HTMLElement | null | undefined };
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PreviewCardPortalState {}
export type PreviewCardPortalProps = ElementProps<PreviewCardPortalState> & {
  keepMounted?: boolean | undefined;
  container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined;
};
export interface PreviewCardArrowState {
  open: boolean; side: Side; align: Align; uncentered: boolean;
}
export type PreviewCardArrowProps = ElementProps<PreviewCardArrowState>;
export interface PreviewCardBackdropState { open: boolean; transitionStatus: TransitionStatus }
export type PreviewCardBackdropProps = ElementProps<PreviewCardBackdropState>;

import type { HTMLAnchorAttributes } from 'svelte/elements';
import type { ComponentRenderFn, HTMLProps } from '../internals/types.js';
export interface PreviewCardTriggerState { open: boolean }
export type PreviewCardTriggerProps<Payload = unknown> = Omit<ElementProps<PreviewCardTriggerState, HTMLAnchorAttributes>, 'render'> & {
  handle?: PreviewCardHandle<Payload> | undefined;
  payload?: NoInfer<Payload> | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  render?: ComponentRenderFn<HTMLAnchorAttributes & HTMLProps, PreviewCardTriggerState> | undefined;
};

// Source public shared positioning fields; private mounted/tree/middleware fields stay internal.
type PublicAnchorPositioning = Pick<AnchorPositioningOptions, 'anchor' | 'positionMethod' | 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'collisionBoundary' | 'collisionPadding' | 'sticky' | 'arrowPadding' | 'disableAnchorTracking' | 'collisionAvoidance'>;
type PositioningProps = { [K in keyof PublicAnchorPositioning]?: PublicAnchorPositioning[K] | undefined };
export interface PreviewCardPositionerState { open: boolean; side: Side; align: Align; anchorHidden: boolean; instant: 'dismiss' | 'focus' | undefined }
export type PreviewCardPositionerProps = ElementProps<PreviewCardPositionerState> & PositioningProps;

export interface PreviewCardPopupState { open: boolean; side: Side; align: Align; instant: 'dismiss' | 'focus' | undefined; transitionStatus: TransitionStatus }
export type PreviewCardPopupProps = ElementProps<PreviewCardPopupState>;

export interface PreviewCardViewportState { activationDirection: string | undefined; transitioning: boolean; instant: 'dismiss' | 'focus' | undefined }
export type PreviewCardViewportProps = ElementProps<PreviewCardViewportState>;
