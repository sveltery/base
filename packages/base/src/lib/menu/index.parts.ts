// Original Menu public aliases and erased component namespaces (MIT).
/* eslint-disable @typescript-eslint/no-namespace -- Preserve Original component namespace types. */
import ArrowComponent from './Arrow.svelte';
import type { MenuArrowState, MenuArrowProps } from './types.js';
export const Arrow: typeof ArrowComponent = ArrowComponent;
export namespace Arrow {
  export type State = MenuArrowState;
  export type Props = MenuArrowProps;
}
import BackdropComponent from './Backdrop.svelte';
import type { MenuBackdropState, MenuBackdropProps } from './types.js';
export const Backdrop: typeof BackdropComponent = BackdropComponent;
export namespace Backdrop {
  export type State = MenuBackdropState;
  export type Props = MenuBackdropProps;
}
import CheckboxItemComponent from './CheckboxItem.svelte';
import type { MenuCheckboxItemState, MenuCheckboxItemProps, MenuCheckboxItemChangeEventReason, MenuCheckboxItemChangeEventDetails } from './types.js';
export const CheckboxItem: typeof CheckboxItemComponent = CheckboxItemComponent;
export namespace CheckboxItem {
  export type State = MenuCheckboxItemState;
  export type Props = MenuCheckboxItemProps;
  export type ChangeEventReason = MenuCheckboxItemChangeEventReason;
  export type ChangeEventDetails = MenuCheckboxItemChangeEventDetails;
}
import CheckboxItemIndicatorComponent from './CheckboxItemIndicator.svelte';
import type { MenuCheckboxItemIndicatorProps, MenuCheckboxItemIndicatorState } from './types.js';
export const CheckboxItemIndicator: typeof CheckboxItemIndicatorComponent = CheckboxItemIndicatorComponent;
export namespace CheckboxItemIndicator {
  export type Props = MenuCheckboxItemIndicatorProps;
  export type State = MenuCheckboxItemIndicatorState;
}
import GroupComponent from './Group.svelte';
import type { MenuGroupProps, MenuGroupState } from './types.js';
export const Group: typeof GroupComponent = GroupComponent;
export namespace Group {
  export type Props = MenuGroupProps;
  export type State = MenuGroupState;
}
import GroupLabelComponent from './GroupLabel.svelte';
import type { MenuGroupLabelProps, MenuGroupLabelState } from './types.js';
export const GroupLabel: typeof GroupLabelComponent = GroupLabelComponent;
export namespace GroupLabel {
  export type Props = MenuGroupLabelProps;
  export type State = MenuGroupLabelState;
}
import ItemComponent from './Item.svelte';
import type { MenuItemState, MenuItemProps } from './types.js';
export const Item: typeof ItemComponent = ItemComponent;
export namespace Item {
  export type State = MenuItemState;
  export type Props = MenuItemProps;
}
import LinkItemComponent from './LinkItem.svelte';
import type { MenuLinkItemState, MenuLinkItemProps } from './types.js';
export const LinkItem: typeof LinkItemComponent = LinkItemComponent;
export namespace LinkItem {
  export type State = MenuLinkItemState;
  export type Props = MenuLinkItemProps;
}
import PopupComponent from './Popup.svelte';
import type { MenuPopupProps, MenuPopupState } from './types.js';
export const Popup: typeof PopupComponent = PopupComponent;
export namespace Popup {
  export type Props = MenuPopupProps;
  export type State = MenuPopupState;
}
import PortalComponent from './Portal.svelte';
import type { MenuPortalState, MenuPortalProps } from './types.js';
export const Portal: typeof PortalComponent = PortalComponent;
export namespace Portal {
  export type State = MenuPortalState;
  export type Props = MenuPortalProps;
}
import PositionerComponent from './Positioner.svelte';
import type { MenuPositionerState, MenuPositionerProps } from './types.js';
export const Positioner: typeof PositionerComponent = PositionerComponent;
export namespace Positioner {
  export type State = MenuPositionerState;
  export type Props = MenuPositionerProps;
}
import RadioGroupComponent from './RadioGroup.svelte';
import type { MenuRadioGroupProps, MenuRadioGroupState, MenuRadioGroupChangeEventReason, MenuRadioGroupChangeEventDetails } from './types.js';
export const RadioGroup: typeof RadioGroupComponent = RadioGroupComponent;
export namespace RadioGroup {
  export type Props = MenuRadioGroupProps;
  export type State = MenuRadioGroupState;
  export type ChangeEventReason = MenuRadioGroupChangeEventReason;
  export type ChangeEventDetails = MenuRadioGroupChangeEventDetails;
}
import RadioItemComponent from './RadioItem.svelte';
import type { MenuRadioItemState, MenuRadioItemProps } from './types.js';
export const RadioItem: typeof RadioItemComponent = RadioItemComponent;
export namespace RadioItem {
  export type State = MenuRadioItemState;
  export type Props = MenuRadioItemProps;
}
import RadioItemIndicatorComponent from './RadioItemIndicator.svelte';
import type { MenuRadioItemIndicatorProps, MenuRadioItemIndicatorState } from './types.js';
export const RadioItemIndicator: typeof RadioItemIndicatorComponent = RadioItemIndicatorComponent;
export namespace RadioItemIndicator {
  export type Props = MenuRadioItemIndicatorProps;
  export type State = MenuRadioItemIndicatorState;
}
import RootComponent from './Root.svelte';
import type { MenuRootState, MenuRootProps, MenuRootActions, MenuRootChangeEventReason, MenuRootChangeEventDetails, MenuRootOrientation } from './types.js';
export const Root: typeof RootComponent = RootComponent;
export namespace Root {
  export type State = MenuRootState;
  export type Props<Payload = unknown> = MenuRootProps<Payload>;
  export type Actions = MenuRootActions;
  export type ChangeEventReason = MenuRootChangeEventReason;
  export type ChangeEventDetails = MenuRootChangeEventDetails;
  export type Orientation = MenuRootOrientation;
}
import SubmenuRootComponent from './SubmenuRoot.svelte';
import type { MenuSubmenuRootProps, MenuSubmenuRootState, MenuSubmenuRootChangeEventReason, MenuSubmenuRootChangeEventDetails } from './types.js';
export const SubmenuRoot: typeof SubmenuRootComponent = SubmenuRootComponent;
export namespace SubmenuRoot {
  export type Props = MenuSubmenuRootProps;
  export type State = MenuSubmenuRootState;
  export type ChangeEventReason = MenuSubmenuRootChangeEventReason;
  export type ChangeEventDetails = MenuSubmenuRootChangeEventDetails;
}
import SubmenuTriggerComponent from './SubmenuTrigger.svelte';
import type { MenuSubmenuTriggerProps, MenuSubmenuTriggerState } from './types.js';
export const SubmenuTrigger: typeof SubmenuTriggerComponent = SubmenuTriggerComponent;
export namespace SubmenuTrigger {
  export type Props = MenuSubmenuTriggerProps;
  export type State = MenuSubmenuTriggerState;
}
import TriggerComponent from './Trigger.svelte';
import type { MenuTriggerProps, MenuTriggerState } from './types.js';
export const Trigger: typeof TriggerComponent = TriggerComponent;
export namespace Trigger {
  export type Props<Payload = unknown> = MenuTriggerProps<Payload>;
  export type State = MenuTriggerState;
}
import ViewportComponent from './Viewport.svelte';
import type { MenuViewportProps, MenuViewportState } from './types.js';
export const Viewport: typeof ViewportComponent = ViewportComponent;
export namespace Viewport {
  export type Props = MenuViewportProps;
  export type State = MenuViewportState;
}
export { Separator } from '../separator/index.js';
export { MenuHandle as Handle, createMenuHandle as createHandle } from './store/MenuHandle.svelte.js';
