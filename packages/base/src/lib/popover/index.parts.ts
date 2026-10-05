import RootComponent from './Root.svelte';
import TriggerComponent from './Trigger.svelte';
import PortalComponent from './Portal.svelte';
import PositionerComponent from './Positioner.svelte';
import PopupComponent from './Popup.svelte';
import ArrowComponent from './Arrow.svelte';
import BackdropComponent from './Backdrop.svelte';
import TitleComponent from './Title.svelte';
import DescriptionComponent from './Description.svelte';
import CloseComponent from './Close.svelte';
import ViewportComponent from './Viewport.svelte';
import type { PopoverRootProps, PopoverRootState, PopoverTriggerProps, PopoverTriggerState, PopoverPortalProps, PopoverPortalState, PopoverPositionerProps, PopoverPositionerState, PopoverPopupProps, PopoverPopupState, PopoverArrowProps, PopoverArrowState, PopoverBackdropProps, PopoverBackdropState, PopoverTitleProps, PopoverTitleState, PopoverDescriptionProps, PopoverDescriptionState, PopoverCloseProps, PopoverCloseState, PopoverViewportProps, PopoverViewportState, PopoverRootActions, PopoverRootChangeEventReason, PopoverRootChangeEventDetails } from './types.js';

export const Root: typeof RootComponent = RootComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Root {
  export type Props<Payload = unknown> = PopoverRootProps<Payload>;
  export type State = PopoverRootState;
  export type Actions = PopoverRootActions;
  export type ChangeEventReason = PopoverRootChangeEventReason;
  export type ChangeEventDetails = PopoverRootChangeEventDetails;
}
export const Trigger: typeof TriggerComponent = TriggerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Trigger {
  export type Props<Payload = unknown> = PopoverTriggerProps<Payload>;
  export type State = PopoverTriggerState;
}
export const Portal: typeof PortalComponent = PortalComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Portal {
  export type Props = PopoverPortalProps;
  export type State = PopoverPortalState;
}
export const Positioner: typeof PositionerComponent = PositionerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Positioner {
  export type Props = PopoverPositionerProps;
  export type State = PopoverPositionerState;
}
export const Popup: typeof PopupComponent = PopupComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Popup {
  export type Props = PopoverPopupProps;
  export type State = PopoverPopupState;
}
export const Arrow: typeof ArrowComponent = ArrowComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Arrow {
  export type Props = PopoverArrowProps;
  export type State = PopoverArrowState;
}
export const Backdrop: typeof BackdropComponent = BackdropComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Backdrop {
  export type Props = PopoverBackdropProps;
  export type State = PopoverBackdropState;
}
export const Title: typeof TitleComponent = TitleComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Title {
  export type Props = PopoverTitleProps;
  export type State = PopoverTitleState;
}
export const Description: typeof DescriptionComponent = DescriptionComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Description {
  export type Props = PopoverDescriptionProps;
  export type State = PopoverDescriptionState;
}
export const Close: typeof CloseComponent = CloseComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Close {
  export type Props = PopoverCloseProps;
  export type State = PopoverCloseState;
}
export const Viewport: typeof ViewportComponent = ViewportComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Viewport {
  export type Props = PopoverViewportProps;
  export type State = PopoverViewportState;
}
export { PopoverHandle as Handle, createPopoverHandle as createHandle } from './handle.svelte.js';
