// Original ContextMenu public reuse aliases and erased namespaces (MIT).
/* eslint-disable @typescript-eslint/no-namespace -- Preserve Original component namespace types. */
import RootComponent from './Root.svelte';
import type { ContextMenuRootState, ContextMenuRootProps, ContextMenuRootActions, ContextMenuRootChangeEventReason, ContextMenuRootChangeEventDetails } from './types.js';
export const Root: typeof RootComponent = RootComponent;
export namespace Root {
  export type State = ContextMenuRootState;
  export type Props = ContextMenuRootProps;
  export type Actions = ContextMenuRootActions;
  export type ChangeEventReason = ContextMenuRootChangeEventReason;
  export type ChangeEventDetails = ContextMenuRootChangeEventDetails;
}
import TriggerComponent from './Trigger.svelte';
import type { ContextMenuTriggerState, ContextMenuTriggerProps } from './types.js';
export const Trigger: typeof TriggerComponent = TriggerComponent;
export namespace Trigger {
  export type State = ContextMenuTriggerState;
  export type Props = ContextMenuTriggerProps;
}
import PositionerComponent from '../menu/Positioner.svelte';
import type { ContextMenuPositionerProps, ContextMenuPositionerState } from './types.js';
export const Positioner: typeof PositionerComponent = PositionerComponent;
export namespace Positioner {
  export type Props = ContextMenuPositionerProps;
  export type State = ContextMenuPositionerState;
}
export { Backdrop, Portal, Popup, Arrow, Group, GroupLabel, Item, CheckboxItem, CheckboxItemIndicator, LinkItem, RadioGroup, RadioItem, RadioItemIndicator, SubmenuRoot, SubmenuTrigger, Separator } from '../menu/index.parts.js';
