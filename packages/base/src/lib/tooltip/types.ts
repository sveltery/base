// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TooltipHandle } from './store/TooltipHandle.svelte.js';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface TooltipRootState {}
export type TooltipRootChangeEventReason =
  | 'trigger-hover'
  | 'trigger-focus'
  | 'trigger-press'
  | 'outside-press'
  | 'escape-key'
  | 'disabled'
  | 'imperative-action'
  | 'none';
export type TooltipRootChangeEventDetails = BaseUIChangeEventDetails<
  TooltipRootChangeEventReason,
  { preventUnmountOnClose(): void }
>;
export interface TooltipRootActions {
  unmount(): void;
  close(): void;
}
export interface TooltipRootProps<Payload = unknown> {
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: TooltipRootChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actions?: TooltipRootActions | null | undefined;
  handle?: TooltipHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
  disabled?: boolean | undefined;
  disableHoverablePopup?: boolean | undefined;
  trackCursorAxis?: 'none' | 'x' | 'y' | 'both' | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve Source empty State assignability.
export interface TooltipProviderState {}
export interface TooltipProviderProps {
  children?: Snippet | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  timeout?: number | undefined;
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
export interface TooltipPortalState {}
export type TooltipPortalProps = ElementProps<TooltipPortalState> & {
  keepMounted?: boolean | undefined;
  container?:
    HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined;
};
export interface TooltipArrowState {
  open: boolean;
  side: Side;
  align: Align;
  uncentered: boolean;
  instant: 'delay' | 'dismiss' | 'focus' | undefined;
}
export type TooltipArrowProps = ElementProps<TooltipArrowState>;

import type { HTMLButtonAttributes } from 'svelte/elements';
export interface TooltipTriggerState {
  open: boolean;
}
export type TooltipTriggerProps<Payload = unknown> = Omit<
  ElementProps<TooltipTriggerState, HTMLButtonAttributes>,
  'disabled'
> & {
  handle?: TooltipHandle<Payload> | undefined;
  payload?: NoInfer<Payload> | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  closeOnClick?: boolean | undefined;
  disabled?: boolean | undefined;
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
export interface TooltipPositionerState {
  open: boolean;
  side: Side;
  align: Align;
  anchorHidden: boolean;
  instant: string | undefined;
}
export type TooltipPositionerProps = ElementProps<TooltipPositionerState> & PositioningProps;

export interface TooltipPopupState {
  open: boolean;
  side: Side;
  align: Align;
  instant: 'delay' | 'focus' | 'dismiss' | undefined;
  transitionStatus: TransitionStatus;
}
export type TooltipPopupProps = ElementProps<TooltipPopupState>;

export interface TooltipViewportState {
  activationDirection: string | undefined;
  transitioning: boolean;
  instant: 'delay' | 'dismiss' | 'focus' | undefined;
}
export type TooltipViewportProps = ElementProps<TooltipViewportState>;

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipProvider {
  export type Props = TooltipProviderProps;
  export type State = TooltipProviderState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipRoot {
  export type Props<Payload = unknown> = TooltipRootProps<Payload>;
  export type State = TooltipRootState;
  export type Actions = TooltipRootActions;
  export type ChangeEventReason = TooltipRootChangeEventReason;
  export type ChangeEventDetails = TooltipRootChangeEventDetails;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipTrigger {
  export type Props<Payload = unknown> = TooltipTriggerProps<Payload>;
  export type State = TooltipTriggerState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipPortal {
  export type Props = TooltipPortalProps;
  export type State = TooltipPortalState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipPositioner {
  export type Props = TooltipPositionerProps;
  export type State = TooltipPositionerState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipPopup {
  export type Props = TooltipPopupProps;
  export type State = TooltipPopupState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipArrow {
  export type Props = TooltipArrowProps;
  export type State = TooltipArrowState;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned prefixed erased part namespace.
export namespace TooltipViewport {
  export type Props = TooltipViewportProps;
  export type State = TooltipViewportState;
}
