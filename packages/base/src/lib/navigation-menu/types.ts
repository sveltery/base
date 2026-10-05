// Original Base UI 1.8.0 NavigationMenu public declarations at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Native Svelte host, snippet, ref and actions representations.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type -- Preserve Original generic defaults, empty States and erased component namespaces. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent, HTMLProps } from '../internals/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
import type {
  Side,
  Align,
  AnchorPositioningOptions,
} from '../internals/anchor-positioning/types.js';
import type { PortalContainer } from '../floating-ui/hooks/useFloatingPortalNode.svelte.js';
import { REASONS } from '../internals/reasons.js';
export type ElementProps<State, Native = HTMLAttributes<HTMLElement>> = Omit<
  WithBaseUIEvent<Native>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<State> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
  };
export interface NavigationMenuRootState {
  open: boolean;
  nested: boolean;
}
export interface NavigationMenuRootActions {
  unmount(): void;
}
export type NavigationMenuRootChangeEventReason =
  | typeof REASONS.triggerPress
  | typeof REASONS.triggerHover
  | typeof REASONS.outsidePress
  | typeof REASONS.listNavigation
  | typeof REASONS.focusOut
  | typeof REASONS.escapeKey
  | typeof REASONS.linkPress
  | typeof REASONS.none;
export type NavigationMenuRootChangeEventDetails =
  BaseUIChangeEventDetails<NavigationMenuRootChangeEventReason>;
export interface NavigationMenuRootProps<
  Value = any,
> extends ElementProps<NavigationMenuRootState> {
  /** Native bind:actions replaces Original actionsRef; supplying it opts into manual unmount. */
  actions?: NavigationMenuRootActions | null | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  value?: Value | null | undefined;
  defaultValue?: Value | null | undefined;
  onValueChange?:
    ((value: Value | null, eventDetails: NavigationMenuRootChangeEventDetails) => void) | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
}
export interface NavigationMenuListState {
  open: boolean;
}
export interface NavigationMenuListProps extends ElementProps<
  NavigationMenuListState,
  HTMLAttributes<HTMLUListElement>
> {}
export interface NavigationMenuItemState {}
export interface NavigationMenuItemProps extends ElementProps<
  NavigationMenuItemState,
  HTMLAttributes<HTMLLIElement>
> {
  value?: any;
}
export interface NavigationMenuContentState {
  open: boolean;
  transitionStatus: TransitionStatus;
  activationDirection: 'left' | 'right' | 'up' | 'down' | null;
}
export interface NavigationMenuContentProps extends ElementProps<
  NavigationMenuContentState,
  HTMLAttributes<HTMLDivElement>
> {
  keepMounted?: boolean | undefined;
}
export interface NavigationMenuTriggerState {
  open: boolean;
  disabled: boolean;
}
export interface NavigationMenuTriggerProps extends ElementProps<
  NavigationMenuTriggerState,
  HTMLButtonAttributes
> {
  nativeButton?: boolean | undefined;
  disabled?: boolean | undefined;
}
export interface NavigationMenuPortalState {}
export interface NavigationMenuPortalProps extends ElementProps<
  NavigationMenuPortalState,
  HTMLAttributes<HTMLDivElement>
> {
  keepMounted?: boolean | undefined;
  container?: PortalContainer | undefined;
}
type PublicAnchorOptions = {
  [Key in keyof AnchorPositioningOptions]: AnchorPositioningOptions[Key] | undefined;
};
export type UseAnchorPositioningSharedParameters = Omit<
  PublicAnchorOptions,
  | 'open'
  | 'mounted'
  | 'collisionAvoidance'
  | 'floatingRootContext'
  | 'externalTree'
  | 'nodeId'
  | 'keepMounted'
  | 'shift'
  | 'inline'
  | 'adaptiveOrigin'
  | 'lazyFlip'
  | 'transform'
> & { collisionAvoidance?: AnchorPositioningOptions['collisionAvoidance'] | undefined };
export interface NavigationMenuPositionerState {
  open: boolean;
  side: Side;
  align: Align;
  anchorHidden: boolean;
  instant: boolean;
}
export interface NavigationMenuPositionerProps
  extends
    UseAnchorPositioningSharedParameters,
    ElementProps<NavigationMenuPositionerState, HTMLAttributes<HTMLDivElement>> {}
export interface NavigationMenuViewportState {}
export interface NavigationMenuViewportProps extends ElementProps<
  NavigationMenuViewportState,
  HTMLAttributes<HTMLDivElement>
> {}
export interface NavigationMenuPopupState {
  open: boolean;
  transitionStatus: TransitionStatus;
  side: Side;
  align: Align;
  anchorHidden: boolean;
}
export interface NavigationMenuPopupProps extends ElementProps<NavigationMenuPopupState> {}
export interface NavigationMenuBackdropState {
  open: boolean;
  transitionStatus: TransitionStatus;
}
export interface NavigationMenuBackdropProps extends ElementProps<
  NavigationMenuBackdropState,
  HTMLAttributes<HTMLDivElement>
> {}
export interface NavigationMenuArrowState {
  open: boolean;
  side: Side;
  align: Align;
  uncentered: boolean;
}
export interface NavigationMenuArrowProps extends ElementProps<
  NavigationMenuArrowState,
  HTMLAttributes<HTMLDivElement>
> {}
export interface NavigationMenuLinkState {
  active: boolean;
}
export interface NavigationMenuLinkProps extends Omit<
  ElementProps<NavigationMenuLinkState, HTMLAnchorAttributes>,
  'render'
> {
  render?:
    | Snippet<[HTMLAnchorAttributes & HTMLProps, NavigationMenuLinkState, Snippet | undefined]>
    | undefined;
  active?: boolean | undefined;
  closeOnClick?: boolean | undefined;
}
export interface NavigationMenuIconState {
  open: boolean;
}
export interface NavigationMenuIconProps extends ElementProps<
  NavigationMenuIconState,
  HTMLAttributes<HTMLSpanElement>
> {}
