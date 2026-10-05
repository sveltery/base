// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PopoverHandle } from './store/PopoverHandle.svelte.js';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PopoverRootState {}
export type PopoverRootChangeEventReason =
  | 'trigger-hover'
  | 'trigger-focus'
  | 'trigger-press'
  | 'outside-press'
  | 'escape-key'
  | 'close-press'
  | 'focus-out'
  | 'imperative-action'
  | 'none';
export type PopoverRootChangeEventDetails = BaseUIChangeEventDetails<
  PopoverRootChangeEventReason,
  { preventUnmountOnClose(): void }
>;
export interface PopoverRootActions {
  unmount(): void;
  close(): void;
}
export interface PopoverRootProps<Payload = unknown> {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: PopoverRootChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actions?: PopoverRootActions | null | undefined;
  handle?: PopoverHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
  modal?: boolean | 'trap-focus' | undefined;
}

import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type {
  Side,
  Align,
  AnchorPositioningOptions,
} from '../internals/anchor-positioning/types.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export type ElementProps<State, Native = HTMLAttributes<HTMLElement>> = Omit<
  WithBaseUIEvent<Native>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<State> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
  };
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PopoverPortalState {}
export type PopoverPortalProps = ElementProps<PopoverPortalState> & {
  keepMounted?: boolean | undefined;
  container?:
    HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined;
};
export interface PopoverArrowState {
  open: boolean;
  side: Side;
  align: Align;
  uncentered: boolean;
}
export type PopoverArrowProps = ElementProps<PopoverArrowState>;
export interface PopoverBackdropState {
  open: boolean;
  transitionStatus: TransitionStatus;
}
export type PopoverBackdropProps = ElementProps<PopoverBackdropState>;

import type { HTMLButtonAttributes } from 'svelte/elements';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PopoverTitleState {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PopoverDescriptionState {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface PopoverCloseState {}
export type PopoverTitleProps = ElementProps<PopoverTitleState>;
export type PopoverDescriptionProps = ElementProps<PopoverDescriptionState>;
export type PopoverCloseProps = ElementProps<PopoverCloseState, HTMLButtonAttributes> & {
  nativeButton?: boolean | undefined;
  disabled?: boolean | undefined;
};
export interface PopoverTriggerState {
  disabled: boolean;
  open: boolean;
}
export type PopoverTriggerProps<Payload = unknown> = Omit<
  ElementProps<PopoverTriggerState, HTMLButtonAttributes>,
  'disabled'
> & {
  handle?: PopoverHandle<Payload> | undefined;
  payload?: NoInfer<Payload> | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  nativeButton?: boolean | undefined;
  disabled?: boolean | undefined;
  openOnHover?: boolean | undefined;
};

// Source public shared positioning fields; private mounted/tree/middleware fields stay internal.
type PublicAnchorPositioning = Pick<
  AnchorPositioningOptions,
  | 'anchor'
  | 'positionMethod'
  | 'side'
  | 'align'
  | 'sideOffset'
  | 'alignOffset'
  | 'collisionBoundary'
  | 'collisionPadding'
  | 'sticky'
  | 'arrowPadding'
  | 'disableAnchorTracking'
  | 'collisionAvoidance'
>;
type PositioningProps = {
  [K in keyof PublicAnchorPositioning]?: PublicAnchorPositioning[K] | undefined;
};
export interface PopoverPositionerState {
  open: boolean;
  side: Side;
  align: Align;
  anchorHidden: boolean;
  instant: string | undefined;
}
export type PopoverPositionerProps = ElementProps<PopoverPositionerState> & PositioningProps;

export interface PopoverPopupState {
  open: boolean;
  side: Side;
  align: Align;
  instant: 'dismiss' | 'click' | 'focus' | 'trigger-change' | undefined;
  transitionStatus: TransitionStatus;
}
import type { InteractionType } from '@sveltery/utils/useEnhancedClickHandler';
export type PopoverPopupFocusTarget =
  | boolean
  | { current: HTMLElement | null }
  | ((interactionType: InteractionType) => void | boolean | HTMLElement | null);
export type PopoverPopupProps = ElementProps<PopoverPopupState> & {
  initialFocus?: PopoverPopupFocusTarget | undefined;
  finalFocus?: PopoverPopupFocusTarget | undefined;
};

export interface PopoverViewportState {
  activationDirection: string | undefined;
  transitioning: boolean;
  instant: 'dismiss' | 'click' | 'focus' | 'trigger-change' | undefined;
}
export type PopoverViewportProps = ElementProps<PopoverViewportState>;

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverRoot {
  export type Props<Payload = unknown> = PopoverRootProps<Payload>;
  export type State = PopoverRootState;
  export type Actions = PopoverRootActions;
  export type ChangeEventReason = PopoverRootChangeEventReason;
  export type ChangeEventDetails = PopoverRootChangeEventDetails;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverTrigger {
  export type Props<Payload = unknown> = PopoverTriggerProps<Payload>;
  export type State = PopoverTriggerState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverPortal {
  export type Props = PopoverPortalProps;
  export type State = PopoverPortalState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverPositioner {
  export type Props = PopoverPositionerProps;
  export type State = PopoverPositionerState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverPopup {
  export type Props = PopoverPopupProps;
  export type State = PopoverPopupState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverArrow {
  export type Props = PopoverArrowProps;
  export type State = PopoverArrowState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverBackdrop {
  export type Props = PopoverBackdropProps;
  export type State = PopoverBackdropState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverTitle {
  export type Props = PopoverTitleProps;
  export type State = PopoverTitleState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverDescription {
  export type Props = PopoverDescriptionProps;
  export type State = PopoverDescriptionState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverClose {
  export type Props = PopoverCloseProps;
  export type State = PopoverCloseState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace PopoverViewport {
  export type Props = PopoverViewportProps;
  export type State = PopoverViewportState;
}
