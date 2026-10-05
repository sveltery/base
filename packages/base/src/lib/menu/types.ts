// Original Base UI 1.8.0 public Menu types, MIT: THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace -- Retain Original erased namespaces, empty State assignability and authored any radio values. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
import type { Side, Align, AnchorPositioningOptions } from '../internals/anchor-positioning/types.js';
import type { InteractionType } from '@sveltery/utils/useEnhancedClickHandler';
import type { MenuHandle } from './store/MenuHandle.svelte.js';
import type { MenuStore } from './store/MenuStore.svelte.js';
import type { MenuRootContext } from './root/MenuRootContext.js';
import type { MenubarContext } from '../menubar/MenubarContext.js';
import type { ContextMenuRootContext } from '../context-menu/root/ContextMenuRootContext.js';
import { REASONS } from '../internals/reasons.js';
export type ElementProps<State, Native = HTMLAttributes<HTMLElement>> = Omit<WithBaseUIEvent<Native>, 'class' | 'style' | 'children'> & BaseUIComponentProps<State> & { children?: Snippet | undefined; ref?: HTMLElement | null | undefined };
interface NativeButtonProps { nativeButton?: boolean | undefined }
type NonNativeButtonProps = NativeButtonProps;
type PayloadChildRenderFunction<Payload> = Snippet<[{ payload: Payload | undefined }]>;
// Public Original positioning props explicitly accept undefined with exact optional types.
type PublicAnchorPositioningOptions = { [Key in keyof AnchorPositioningOptions]: AnchorPositioningOptions[Key] | undefined };
type UseAnchorPositioningSharedParameters = Omit<PublicAnchorPositioningOptions, 'open' | 'mounted' | 'collisionAvoidance' | 'floatingRootContext' | 'externalTree' | 'nodeId'> & { collisionAvoidance?: AnchorPositioningOptions['collisionAvoidance'] | undefined };



export interface MenuArrowState {
  /**
   * Whether the menu is currently open.
   */
  open: boolean;
  /**
   * The side of the anchor the component is placed on.
   */
  side: Side;
  /**
   * The alignment of the component relative to the anchor.
   */
  align: Align;
  /**
   * Whether the arrow cannot be centered on the anchor.
   */
  uncentered: boolean;
}


export interface MenuArrowProps extends ElementProps<MenuArrowState, HTMLAttributes<HTMLDivElement>> {}


export namespace MenuArrow {
  export type State = MenuArrowState;
  export type Props = MenuArrowProps;
}


export interface MenuBackdropState {
  /**
   * Whether the menu is currently open.
   */
  open: boolean;
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
}


export interface MenuBackdropProps extends ElementProps<MenuBackdropState, HTMLAttributes<HTMLDivElement>> {}


export namespace MenuBackdrop {
  export type State = MenuBackdropState;
  export type Props = MenuBackdropProps;
}


export interface MenuCheckboxItemState {
  /**
   * Whether the checkbox item should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the checkbox item is currently highlighted.
   */
  highlighted: boolean;
  /**
   * Whether the checkbox item is currently ticked.
   */
  checked: boolean;
}


export interface MenuCheckboxItemProps
  extends NonNativeButtonProps, ElementProps<MenuCheckboxItemState, HTMLAttributes<HTMLDivElement>> {
  /**
   * Whether the checkbox item is currently ticked.
   *
   * To render an uncontrolled checkbox item, use the `defaultChecked` prop instead.
   */
  checked?: boolean | undefined;
  /**
   * Whether the checkbox item is initially ticked.
   *
   * To render a controlled checkbox item, use the `checked` prop instead.
   * @default false
   */
  defaultChecked?: boolean | undefined;
  /**
   * Event handler called when the checkbox item is ticked or unticked.
   */
  onCheckedChange?:
    ((checked: boolean, eventDetails: MenuCheckboxItem.ChangeEventDetails) => void) | undefined;
  /**
   * The click handler for the menu item.
   */
  onclick?: ElementProps<MenuCheckboxItemState, HTMLAttributes<HTMLDivElement>>['onclick'] | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Overrides the text label to use when the item is matched during keyboard text navigation.
   */
  label?: string | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Whether to close the menu when the item is clicked.
   * @default false
   */
  closeOnClick?: boolean | undefined;
}


export type MenuCheckboxItemChangeEventReason = MenuRoot.ChangeEventReason;

export type MenuCheckboxItemChangeEventDetails = MenuRoot.ChangeEventDetails;


export namespace MenuCheckboxItem {
  export type State = MenuCheckboxItemState;
  export type Props = MenuCheckboxItemProps;
  export type ChangeEventReason = MenuCheckboxItemChangeEventReason;
  export type ChangeEventDetails = MenuCheckboxItemChangeEventDetails;
}


export interface MenuCheckboxItemIndicatorProps extends ElementProps<MenuCheckboxItemIndicatorState, HTMLAttributes<HTMLSpanElement>> {
  /**
   * Whether to keep the HTML element in the DOM when the checkbox item is not checked.
   * @default false
   */
  keepMounted?: boolean | undefined;
}


export interface MenuCheckboxItemIndicatorState {
  /**
   * Whether the checkbox item is currently ticked.
   */
  checked: boolean;
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
}


export namespace MenuCheckboxItemIndicator {
  export type Props = MenuCheckboxItemIndicatorProps;
  export type State = MenuCheckboxItemIndicatorState;
}


export interface MenuGroupProps extends ElementProps<MenuGroupState, HTMLAttributes<HTMLDivElement>> {
  /**
   * The content of the component.
   */
  children?: Snippet | undefined;
}


export interface MenuGroupState {}


export namespace MenuGroup {
  export type Props = MenuGroupProps;
  export type State = MenuGroupState;
}


export interface MenuGroupLabelProps extends ElementProps<MenuGroupLabelState, HTMLAttributes<HTMLDivElement>> {}


export interface MenuGroupLabelState {}


export namespace MenuGroupLabel {
  export type Props = MenuGroupLabelProps;
  export type State = MenuGroupLabelState;
}


export interface MenuItemState {
  /**
   * Whether the item should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
}


export interface MenuItemProps
  extends NonNativeButtonProps, ElementProps<MenuItemState, HTMLAttributes<HTMLDivElement>> {
  /**
   * The click handler for the menu item.
   */
  onclick?: ElementProps<MenuItemState, HTMLAttributes<HTMLDivElement>>['onclick'] | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Overrides the text label to use when the item is matched during keyboard text navigation.
   */
  label?: string | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Whether to close the menu when the item is clicked.
   *
   * @default true
   */
  closeOnClick?: boolean | undefined;
}


export namespace MenuItem {
  export type State = MenuItemState;
  export type Props = MenuItemProps;
}


export interface MenuLinkItemState {
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
}


export interface MenuLinkItemProps extends ElementProps<MenuLinkItemState, HTMLAnchorAttributes> {
  /**
   * Overrides the text label to use when the item is matched during keyboard text navigation.
   */
  label?: string | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Whether to close the menu when the item is clicked.
   * @default false
   */
  closeOnClick?: boolean | undefined;
}


export namespace MenuLinkItem {
  export type State = MenuLinkItemState;
  export type Props = MenuLinkItemProps;
}


export interface MenuPopupProps extends ElementProps<MenuPopupState, HTMLAttributes<HTMLDivElement>> {
  children?: Snippet | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Determines the element to focus when the menu is closed.
   *
   * - `false`: Do not move focus.
   * - `true`: Move focus based on the default behavior (trigger or previously focused element).
   * - `RefObject`: Move focus to the ref element.
   * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
   *   Return an element to focus, `true` to use the default behavior, or `false`/`undefined` to do nothing.
   */
  finalFocus?:
    | boolean
    | { current: HTMLElement | null }
    | ((closeType: InteractionType) => boolean | HTMLElement | null | void)
    | undefined;
}


export interface MenuPopupState {
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
  /**
   * The side of the anchor the component is placed on.
   */
  side: Side;
  /**
   * The alignment of the component relative to the anchor.
   */
  align: Align;
  /**
   * Whether the menu is currently open.
   */
  open: boolean;
  /**
   * Whether the component is nested.
   */
  nested: boolean;
  /**
   * Whether transitions should be skipped.
   */
  instant: 'dismiss' | 'click' | 'group' | 'trigger-change' | undefined;
}


export namespace MenuPopup {
  export type Props = MenuPopupProps;
  export type State = MenuPopupState;
}


export interface MenuPortalState {}


export interface MenuPortalProps extends ElementProps<MenuPortalState, HTMLAttributes<HTMLDivElement>> {
  /**
   * Whether to keep the portal mounted in the DOM while the popup is hidden.
   * @default false
   */
  keepMounted?: boolean | undefined;
  /**
   * A parent element to render the portal element into.
   */
  container?:
    HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined;
}


export namespace MenuPortal {
  export type State = MenuPortalState;
  export type Props = MenuPortalProps;
}


export interface MenuPositionerState {
  /**
   * Whether the menu is currently open.
   */
  open: boolean;
  /**
   * The side of the anchor the component is placed on.
   */
  side: Side;
  /**
   * The alignment of the component relative to the anchor.
   */
  align: Align;
  /**
   * Whether the anchor element is hidden.
   */
  anchorHidden: boolean;
  /**
   * Whether the component is nested.
   */
  nested: boolean;
  /**
   * Whether CSS transitions should be disabled.
   */
  instant: string | undefined;
}


export interface MenuPositionerProps
  extends
    Omit<UseAnchorPositioningSharedParameters, 'side' | 'align'>,
    ElementProps<MenuPositionerState, HTMLAttributes<HTMLDivElement>> {
  /**
   * How to align the popup relative to the specified side.
   *
   * Submenus and menubars default to `'start'`.
   * @default 'center'
   */
  align?: UseAnchorPositioningSharedParameters['align'] | undefined;
  /**
   * Which side of the anchor element to align the popup against.
   * May automatically change to avoid collisions.
   *
   * Submenus and vertical menubars default to `'inline-end'`.
   * @default 'bottom'
   */
  side?: UseAnchorPositioningSharedParameters['side'] | undefined;
}


export namespace MenuPositioner {
  export type State = MenuPositionerState;
  export type Props = MenuPositionerProps;
}


export interface MenuRadioGroupProps extends ElementProps<MenuRadioGroupState, HTMLAttributes<HTMLDivElement>> {
  /**
   * The content of the component.
   */
  children?: Snippet | undefined;
  /**
   * The controlled value of the radio item that should be currently selected.
   *
   * To render an uncontrolled radio group, use the `defaultValue` prop instead.
   */
  value?: any;
  /**
   * The uncontrolled value of the radio item that should be initially selected.
   *
   * To render a controlled radio group, use the `value` prop instead.
   */
  defaultValue?: any;
  /**
   * Function called when the selected value changes.
   */
  onValueChange?:
    ((value: any, eventDetails: MenuRadioGroup.ChangeEventDetails) => void) | undefined;
  /**
   * Whether the component should ignore user interaction.
   *
   * @default false
   */
  disabled?: boolean | undefined;
}


export interface MenuRadioGroupState {
  /**
   * Whether the component is disabled.
   */
  disabled: boolean;
}


export type MenuRadioGroupChangeEventReason = MenuRoot.ChangeEventReason;

export type MenuRadioGroupChangeEventDetails = MenuRoot.ChangeEventDetails;


export namespace MenuRadioGroup {
  export type Props = MenuRadioGroupProps;
  export type State = MenuRadioGroupState;
  export type ChangeEventReason = MenuRadioGroupChangeEventReason;
  export type ChangeEventDetails = MenuRadioGroupChangeEventDetails;
}


export interface MenuRadioItemState {
  /**
   * Whether the radio item should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the radio item is currently highlighted.
   */
  highlighted: boolean;
  /**
   * Whether the radio item is currently selected.
   */
  checked: boolean;
}


export interface MenuRadioItemProps
  extends NonNativeButtonProps, ElementProps<MenuRadioItemState, HTMLAttributes<HTMLDivElement>> {
  /**
   * Value of the radio item.
   * This is the value that will be set in the MenuRadioGroup when the item is selected.
   */
  value: any;
  /**
   * The click handler for the menu item.
   */
  onclick?: ElementProps<MenuRadioItemState, HTMLAttributes<HTMLDivElement>>['onclick'] | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Overrides the text label to use when the item is matched during keyboard text navigation.
   */
  label?: string | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Whether to close the menu when the item is clicked.
   * @default false
   */
  closeOnClick?: boolean | undefined;
}


export namespace MenuRadioItem {
  export type State = MenuRadioItemState;
  export type Props = MenuRadioItemProps;
}


export interface MenuRadioItemIndicatorProps extends ElementProps<MenuRadioItemIndicatorState, HTMLAttributes<HTMLSpanElement>> {
  /**
   * Whether to keep the HTML element in the DOM when the radio item is inactive.
   * @default false
   */
  keepMounted?: boolean | undefined;
}


export interface MenuRadioItemIndicatorState {
  /**
   * Whether the radio item is currently selected.
   */
  checked: boolean;
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
}


export namespace MenuRadioItemIndicator {
  export type Props = MenuRadioItemIndicatorProps;
  export type State = MenuRadioItemIndicatorState;
}


export interface MenuRootState {}


export interface MenuRootProps<Payload = unknown> {
  /**
   * Whether the menu is initially open.
   *
   * To render a controlled menu, use the `open` prop instead.
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Whether to loop keyboard focus back to the first item
   * when the end of the list is reached while using the arrow keys.
   * @default true
   */
  loopFocus?: boolean | undefined;
  /**
   * Whether moving the pointer over items should highlight them.
   * Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state.
   * @default true
   */
  highlightItemOnHover?: boolean | undefined;
  /**
   * Determines if the menu enters a modal state when open.
   * - `true`: user interaction is limited to the menu: document page scroll is locked and pointer interactions on outside elements are disabled.
   * - `false`: user interaction with the rest of the document is allowed.
   *
   * On touch devices, a `true` modal blocks outside taps but leaves the page scrollable unless the popup spans nearly the full viewport width, matching native iOS behavior.
   *
   * Nested menus ignore this prop, and menus opened by hover are never modal.
   * @default true
   */
  modal?: boolean | undefined;
  /**
   * Event handler called when the menu is opened or closed.
   */
  onOpenChange?: ((open: boolean, eventDetails: MenuRoot.ChangeEventDetails) => void) | undefined;
  /**
   * Event handler called after any animations complete when the menu is opened or closed.
   */
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  /**
   * Whether the menu is currently open.
   */
  open?: boolean | undefined;
  /**
   * The visual orientation of the menu.
   * Controls whether roving focus uses up/down or left/right arrow keys.
   * @default 'vertical'
   */
  orientation?: MenuRoot.Orientation | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * When in a submenu, determines whether pressing the Escape key
   * closes the entire menu, or only the current child menu.
   * @default false
   */
  closeParentOnEsc?: boolean | undefined;
  /**
   * A ref to imperative actions.
   * - `unmount`: Manually unmounts the menu.
   *   Call this after any externally controlled closing animation finishes.
   * - `close`: When specified, the menu can be closed imperatively.
   */
  actions?: MenuRoot.Actions | null | undefined;
  /**
   * ID of the trigger that the menu is associated with.
   * This is useful in conjunction with the `open` prop to create a controlled menu.
   * There's no need to specify this prop when the menu is uncontrolled (that is, when the `open` prop is not set).
   */
  triggerId?: string | null | undefined;
  /**
   * ID of the trigger that the menu is associated with.
   * This is useful in conjunction with the `defaultOpen` prop to create an initially open menu.
   */
  defaultTriggerId?: string | null | undefined;
  /**
   * A handle to associate the menu with a trigger.
   * If specified, allows external triggers to control the menu's open state.
   */
  handle?: MenuHandle<Payload> | undefined;
  /**
   * The content of the menu.
   * This can be a regular React node or a render function that receives the `payload` of the active trigger.
   */
  children?: PayloadChildRenderFunction<Payload> | undefined;
}


export interface MenuRootActions {
  unmount: () => void;
  close: () => void;
}


export type MenuRootChangeEventReason =
  | typeof REASONS.triggerHover
  | typeof REASONS.triggerFocus
  | typeof REASONS.triggerPress
  | typeof REASONS.outsidePress
  | typeof REASONS.focusOut
  | typeof REASONS.listNavigation
  | typeof REASONS.escapeKey
  | typeof REASONS.itemPress
  | typeof REASONS.closePress
  | typeof REASONS.siblingOpen
  | typeof REASONS.cancelOpen
  | typeof REASONS.imperativeAction
  | typeof REASONS.none;


export type MenuRootChangeEventDetails = BaseUIChangeEventDetails<MenuRoot.ChangeEventReason> & {
  preventUnmountOnClose(): void;
};


export type MenuRootOrientation = 'horizontal' | 'vertical';


export type MenuParent =
  | {
      type: 'menu';
      store: MenuStore<unknown>;
    }
  | {
      type: 'menubar';
      context: MenubarContext;
    }
  | {
      type: 'context-menu';
      context: ContextMenuRootContext;
    }
  | {
      type: 'nested-context-menu';
      context: ContextMenuRootContext;
      menuContext: MenuRootContext;
    }
  | {
      type: undefined;
    };


export namespace MenuRoot {
  export type State = MenuRootState;
  export type Props<Payload = unknown> = MenuRootProps<Payload>;
  export type Actions = MenuRootActions;
  export type ChangeEventReason = MenuRootChangeEventReason;
  export type ChangeEventDetails = MenuRootChangeEventDetails;
  export type Orientation = MenuRootOrientation;
}


export interface MenuSubmenuRootProps extends Omit<
  MenuRoot.Props,
  | 'modal'
  | 'openOnHover'
  | 'onOpenChange'
  | 'handle'
  | 'triggerId'
  | 'defaultTriggerId'
  | 'children'
> {
  /**
   * Event handler called when the menu is opened or closed.
   */
  onOpenChange?:
    ((open: boolean, eventDetails: MenuSubmenuRoot.ChangeEventDetails) => void) | undefined;
  /**
   * When in a submenu, determines whether pressing the Escape key
   * closes the entire menu, or only the current child menu.
   * @default false
   */
  closeParentOnEsc?: boolean | undefined;
  /**
   * The content of the submenu.
   */
  children?: Snippet | undefined;
}


export interface MenuSubmenuRootState {}


export type MenuSubmenuRootChangeEventReason = MenuRoot.ChangeEventReason;

export type MenuSubmenuRootChangeEventDetails = MenuRoot.ChangeEventDetails;


export namespace MenuSubmenuRoot {
  export type Props = MenuSubmenuRootProps;
  export type State = MenuSubmenuRootState;
  export type ChangeEventReason = MenuSubmenuRootChangeEventReason;
  export type ChangeEventDetails = MenuSubmenuRootChangeEventDetails;
}


export interface MenuSubmenuTriggerState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
  /**
   * Whether the menu is currently open.
   */
  open: boolean;
}


export interface MenuSubmenuTriggerProps
  extends NonNativeButtonProps, ElementProps<MenuSubmenuTriggerState, HTMLAttributes<HTMLDivElement>> {
  onclick?: ElementProps<MenuSubmenuTriggerState, HTMLAttributes<HTMLDivElement>>['onclick'] | undefined;
  /**
   * Overrides the text label to use when the item is matched during keyboard text navigation.
   */
  label?: string | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * How long to wait before the menu may be opened on hover. Specified in milliseconds.
   *
   * Requires the `openOnHover` prop.
   * @default 100
   */
  delay?: number | undefined;
  /**
   * How long to wait before closing the menu that was opened on hover.
   * Specified in milliseconds.
   *
   * Requires the `openOnHover` prop.
   * @default 0
   */
  closeDelay?: number | undefined;
  /**
   * Whether the menu should also open when the trigger is hovered.
   * @default true
   */
  openOnHover?: boolean | undefined;
}


export namespace MenuSubmenuTrigger {
  export type Props = MenuSubmenuTriggerProps;
  export type State = MenuSubmenuTriggerState;
}


export interface MenuTriggerProps<Payload = unknown>
  extends NativeButtonProps, ElementProps<MenuTriggerState, HTMLButtonAttributes> {
  children?: Snippet | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * A handle to associate the trigger with a menu.
   */
  handle?: MenuHandle<Payload> | undefined;
  /**
   * A payload to pass to the menu when it is opened.
   */
  payload?: Payload | undefined;
  /**
   * How long to wait before the menu may be opened on hover. Specified in milliseconds.
   *
   * Requires the `openOnHover` prop.
   * @default 100
   */
  delay?: number | undefined;
  /**
   * How long to wait before closing the menu that was opened on hover.
   * Specified in milliseconds.
   *
   * Requires the `openOnHover` prop.
   * @default 0
   */
  closeDelay?: number | undefined;
  /**
   * Whether the menu should also open when the trigger is hovered.
   */
  openOnHover?: boolean | undefined;
}


export interface MenuTriggerState {
  /**
   * Whether the menu is currently open and was opened by this trigger.
   */
  open: boolean;
  /**
   * Whether the trigger is disabled.
   */
  disabled: boolean;
}


export namespace MenuTrigger {
  export type Props<Payload = unknown> = MenuTriggerProps<Payload>;
  export type State = MenuTriggerState;
}


export interface MenuViewportState {
  /**
   * The activation direction of the transitioned content.
   */
  activationDirection: string | undefined;
  /**
   * Whether the viewport is currently transitioning between contents.
   */
  transitioning: boolean;
  /**
   * Present if animations should be instant.
   */
  instant: 'dismiss' | 'click' | 'group' | 'trigger-change' | undefined;
}


export interface MenuViewportProps extends ElementProps<MenuViewportState, HTMLAttributes<HTMLDivElement>> {
  /**
   * The content to render inside the transition container.
   */
  children?: Snippet | undefined;
}


export namespace MenuViewport {
  export type Props = MenuViewportProps;
  export type State = MenuViewportState;
}
