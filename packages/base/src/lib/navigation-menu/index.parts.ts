// Original public NavigationMenu aliases and erased component namespaces (MIT).
/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-explicit-any -- Preserve Original public namespaces and generic default. */
import RootComponent from './Root.svelte';
import type {
  NavigationMenuRootState,
  NavigationMenuRootProps,
  NavigationMenuRootActions,
  NavigationMenuRootChangeEventReason,
  NavigationMenuRootChangeEventDetails,
} from './types.js';
export const Root: typeof RootComponent = RootComponent;
export namespace Root {
  export type State = NavigationMenuRootState;
  export type Props<Value = any> = NavigationMenuRootProps<Value>;
  export type Value<TValue = any> = TValue | null;
  export type Actions = NavigationMenuRootActions;
  export type ChangeEventReason = NavigationMenuRootChangeEventReason;
  export type ChangeEventDetails = NavigationMenuRootChangeEventDetails;
}
import ListComponent from './List.svelte';
import type { NavigationMenuListState, NavigationMenuListProps } from './types.js';
export const List: typeof ListComponent = ListComponent;
export namespace List {
  export type State = NavigationMenuListState;
  export type Props = NavigationMenuListProps;
}
import ItemComponent from './Item.svelte';
import type { NavigationMenuItemState, NavigationMenuItemProps } from './types.js';
export const Item: typeof ItemComponent = ItemComponent;
export namespace Item {
  export type State = NavigationMenuItemState;
  export type Props = NavigationMenuItemProps;
}
import ContentComponent from './Content.svelte';
import type { NavigationMenuContentState, NavigationMenuContentProps } from './types.js';
export const Content: typeof ContentComponent = ContentComponent;
export namespace Content {
  export type State = NavigationMenuContentState;
  export type Props = NavigationMenuContentProps;
}
import TriggerComponent from './Trigger.svelte';
import type { NavigationMenuTriggerState, NavigationMenuTriggerProps } from './types.js';
export const Trigger: typeof TriggerComponent = TriggerComponent;
export namespace Trigger {
  export type State = NavigationMenuTriggerState;
  export type Props = NavigationMenuTriggerProps;
}
import PortalComponent from './Portal.svelte';
import type { NavigationMenuPortalState, NavigationMenuPortalProps } from './types.js';
export const Portal: typeof PortalComponent = PortalComponent;
export namespace Portal {
  export type State = NavigationMenuPortalState;
  export type Props = NavigationMenuPortalProps;
}
import PositionerComponent from './Positioner.svelte';
import type { NavigationMenuPositionerState, NavigationMenuPositionerProps } from './types.js';
export const Positioner: typeof PositionerComponent = PositionerComponent;
export namespace Positioner {
  export type State = NavigationMenuPositionerState;
  export type Props = NavigationMenuPositionerProps;
}
import ViewportComponent from './Viewport.svelte';
import type { NavigationMenuViewportState, NavigationMenuViewportProps } from './types.js';
export const Viewport: typeof ViewportComponent = ViewportComponent;
export namespace Viewport {
  export type State = NavigationMenuViewportState;
  export type Props = NavigationMenuViewportProps;
}
import BackdropComponent from './Backdrop.svelte';
import type { NavigationMenuBackdropState, NavigationMenuBackdropProps } from './types.js';
export const Backdrop: typeof BackdropComponent = BackdropComponent;
export namespace Backdrop {
  export type State = NavigationMenuBackdropState;
  export type Props = NavigationMenuBackdropProps;
}
import PopupComponent from './Popup.svelte';
import type { NavigationMenuPopupState, NavigationMenuPopupProps } from './types.js';
export const Popup: typeof PopupComponent = PopupComponent;
export namespace Popup {
  export type State = NavigationMenuPopupState;
  export type Props = NavigationMenuPopupProps;
}
import ArrowComponent from './Arrow.svelte';
import type { NavigationMenuArrowState, NavigationMenuArrowProps } from './types.js';
export const Arrow: typeof ArrowComponent = ArrowComponent;
export namespace Arrow {
  export type State = NavigationMenuArrowState;
  export type Props = NavigationMenuArrowProps;
}
import LinkComponent from './Link.svelte';
import type { NavigationMenuLinkState, NavigationMenuLinkProps } from './types.js';
export const Link: typeof LinkComponent = LinkComponent;
export namespace Link {
  export type State = NavigationMenuLinkState;
  export type Props = NavigationMenuLinkProps;
}
import IconComponent from './Icon.svelte';
import type { NavigationMenuIconState, NavigationMenuIconProps } from './types.js';
export const Icon: typeof IconComponent = IconComponent;
export namespace Icon {
  export type State = NavigationMenuIconState;
  export type Props = NavigationMenuIconProps;
}
