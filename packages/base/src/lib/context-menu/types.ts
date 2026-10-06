// Original Base UI 1.8.0 context-menu public type contracts; MIT: THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace -- Original erased namespace and empty State contracts. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
  ElementProps,
  MenuRoot,
  MenuPositionerState,
  MenuPositionerProps,
} from '../menu/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';

export interface ContextMenuRootState {}

export interface ContextMenuRootProps extends Omit<
  MenuRoot.Props,
  // Context Menu has no detached-trigger support (it opens from a right-click/long-press
  // area, not a registered trigger), so these inherited props are not applicable.
  | 'handle'
  | 'triggerId'
  | 'defaultTriggerId'
  | 'modal'
  | 'openOnHover'
  | 'delay'
  | 'closeDelay'
  | 'closeParentOnEsc'
  | 'onOpenChange'
  // Context Menu opens from a pointer position rather than a registered trigger, so the
  // render-function form of `children` (which receives the active trigger's payload) is not applicable.
  | 'children'
> {
  /**
   * Event handler called when the menu is opened or closed.
   */
  onOpenChange?:
    ((open: boolean, eventDetails: ContextMenuRoot.ChangeEventDetails) => void) | undefined;
  /**
   * @ignore
   * @deprecated This prop has no effect on Context Menu.
   */
  closeParentOnEsc?: MenuRoot.Props['closeParentOnEsc'] | undefined;
  children?: Snippet | undefined;
}

export type ContextMenuRootActions = MenuRoot.Actions;

export type ContextMenuRootChangeEventReason = MenuRoot.ChangeEventReason;

export type ContextMenuRootChangeEventDetails =
  BaseUIChangeEventDetails<ContextMenuRoot.ChangeEventReason>;

export namespace ContextMenuRoot {
  export type State = ContextMenuRootState;
  export type Props = ContextMenuRootProps;
  export type Actions = ContextMenuRootActions;
  export type ChangeEventReason = ContextMenuRootChangeEventReason;
  export type ChangeEventDetails = ContextMenuRootChangeEventDetails;
}

export interface ContextMenuTriggerState {
  /**
   * Whether the context menu is currently open.
   */
  open: boolean;
}

export interface ContextMenuTriggerProps extends ElementProps<
  ContextMenuTriggerState,
  HTMLAttributes<HTMLDivElement>
> {}

export namespace ContextMenuTrigger {
  export type State = ContextMenuTriggerState;
  export type Props = ContextMenuTriggerProps;
}

export interface ContextMenuPositionerState extends MenuPositionerState {}

export interface ContextMenuPositionerProps
  extends
    Omit<
      MenuPositionerProps,
      | keyof ElementProps<ContextMenuPositionerState, HTMLAttributes<HTMLDivElement>>
      | 'anchor'
      | 'positionMethod'
      | 'side'
      | 'sideOffset'
      | 'align'
      | 'alignOffset'
      | 'arrowPadding'
    >,
    ElementProps<ContextMenuPositionerState, HTMLAttributes<HTMLDivElement>> {
  /**
   * An element to position the popup against.
   * By default, root context menus are positioned at the pointer, and submenus are positioned
   * against their trigger.
   */
  anchor?: MenuPositionerProps['anchor'] | undefined;
  /**
   * @ignore
   * @deprecated This prop has no effect on Context Menu.
   */
  positionMethod?: MenuPositionerProps['positionMethod'] | undefined;
  /**
   * Which side of the anchor element to align the popup against.
   * May automatically change to avoid collisions.
   *
   * Submenus default to `'inline-end'`.
   * @default 'bottom'
   */
  side?: MenuPositionerProps['side'] | undefined;
  /**
   * Distance between the anchor and the popup in pixels.
   * Also accepts a function that returns the distance to read the dimensions of the anchor
   * and positioner elements, along with its side and alignment.
   *
   * The function takes a `data` object parameter with the following properties:
   * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
   * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
   * - `data.side`: which side of the anchor element the positioner is aligned against.
   * - `data.align`: how the positioner is aligned relative to the specified side.
   *
   * Defaults to `-5` for root context menus when `side` is not specified and `align` is not
   * `'center'`. Otherwise, it defaults to `0`.
   *
   * @example
   * ```jsx
   * <ContextMenu.Positioner
   *   sideOffset={({ side, anchor }) => {
   *     return side === 'top' || side === 'bottom' ? anchor.height : anchor.width;
   *   }}
   * />
   * ```
   */
  sideOffset?: MenuPositionerProps['sideOffset'] | undefined;
  /**
   * How to align the popup relative to the specified side.
   * @default 'start'
   */
  align?: MenuPositionerProps['align'] | undefined;
  /**
   * Additional offset along the alignment axis in pixels.
   * Also accepts a function that returns the offset to read the dimensions of the anchor
   * and positioner elements, along with its side and alignment.
   *
   * The function takes a `data` object parameter with the following properties:
   * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
   * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
   * - `data.side`: which side of the anchor element the positioner is aligned against.
   * - `data.align`: how the positioner is aligned relative to the specified side.
   *
   * Defaults to `2` for root context menus when `side` is not specified and `align` is not
   * `'center'`. Otherwise, it defaults to `0`.
   *
   * @example
   * ```jsx
   * <ContextMenu.Positioner
   *   alignOffset={({ side, anchor }) => {
   *     return side === 'top' || side === 'bottom' ? anchor.width : anchor.height;
   *   }}
   * />
   * ```
   */
  alignOffset?: MenuPositionerProps['alignOffset'] | undefined;
  /**
   * Minimum distance to maintain between the arrow and the edges of the popup.
   *
   * Root context menus always use `0`. Submenus default to `5`.
   */
  arrowPadding?: MenuPositionerProps['arrowPadding'] | undefined;
}

export namespace ContextMenuPositioner {
  export type Props = ContextMenuPositionerProps;
  export type State = ContextMenuPositionerState;
}
