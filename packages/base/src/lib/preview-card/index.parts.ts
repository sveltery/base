import RootComponent from './Root.svelte';
import TriggerComponent from './Trigger.svelte';
import PortalComponent from './Portal.svelte';
import PositionerComponent from './Positioner.svelte';
import PopupComponent from './Popup.svelte';
import ArrowComponent from './Arrow.svelte';
import BackdropComponent from './Backdrop.svelte';
import ViewportComponent from './Viewport.svelte';
import type { PreviewCardRootProps, PreviewCardRootState, PreviewCardTriggerProps, PreviewCardTriggerState, PreviewCardPortalProps, PreviewCardPortalState, PreviewCardPositionerProps, PreviewCardPositionerState, PreviewCardPopupProps, PreviewCardPopupState, PreviewCardArrowProps, PreviewCardArrowState, PreviewCardBackdropProps, PreviewCardBackdropState, PreviewCardViewportProps, PreviewCardViewportState, PreviewCardRootActions, PreviewCardRootChangeEventReason, PreviewCardRootChangeEventDetails } from './types.js';

export const Root: typeof RootComponent = RootComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Root {
  export type Props<Payload = unknown> = PreviewCardRootProps<Payload>;
  export type State = PreviewCardRootState;
  export type Actions = PreviewCardRootActions;
  export type ChangeEventReason = PreviewCardRootChangeEventReason;
  export type ChangeEventDetails = PreviewCardRootChangeEventDetails;
}
export const Trigger: typeof TriggerComponent = TriggerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Trigger {
  export type Props<Payload = unknown> = PreviewCardTriggerProps<Payload>;
  export type State = PreviewCardTriggerState;
}
export const Portal: typeof PortalComponent = PortalComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Portal {
  export type Props = PreviewCardPortalProps;
  export type State = PreviewCardPortalState;
}
export const Positioner: typeof PositionerComponent = PositionerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Positioner {
  export type Props = PreviewCardPositionerProps;
  export type State = PreviewCardPositionerState;
}
export const Popup: typeof PopupComponent = PopupComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Popup {
  export type Props = PreviewCardPopupProps;
  export type State = PreviewCardPopupState;
}
export const Arrow: typeof ArrowComponent = ArrowComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Arrow {
  export type Props = PreviewCardArrowProps;
  export type State = PreviewCardArrowState;
}
export const Backdrop: typeof BackdropComponent = BackdropComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Backdrop {
  export type Props = PreviewCardBackdropProps;
  export type State = PreviewCardBackdropState;
}
export const Viewport: typeof ViewportComponent = ViewportComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Viewport {
  export type Props = PreviewCardViewportProps;
  export type State = PreviewCardViewportState;
}
export { PreviewCardHandle as Handle, createPreviewCardHandle as createHandle } from './handle.svelte.js';
