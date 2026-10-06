import ProviderComponent from './Provider.svelte';
import RootComponent from './Root.svelte';
import TriggerComponent from './Trigger.svelte';
import PortalComponent from './Portal.svelte';
import PositionerComponent from './Positioner.svelte';
import PopupComponent from './Popup.svelte';
import ArrowComponent from './Arrow.svelte';
import ViewportComponent from './Viewport.svelte';
import type {
  TooltipProviderProps,
  TooltipProviderState,
  TooltipRootProps,
  TooltipRootState,
  TooltipTriggerProps,
  TooltipTriggerState,
  TooltipPortalProps,
  TooltipPortalState,
  TooltipPositionerProps,
  TooltipPositionerState,
  TooltipPopupProps,
  TooltipPopupState,
  TooltipArrowProps,
  TooltipArrowState,
  TooltipViewportProps,
  TooltipViewportState,
  TooltipRootActions,
  TooltipRootChangeEventReason,
  TooltipRootChangeEventDetails,
} from './types.js';

export const Provider: typeof ProviderComponent = ProviderComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Provider {
  export type Props = TooltipProviderProps;
  export type State = TooltipProviderState;
}
export const Root: typeof RootComponent = RootComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Root {
  export type Props<Payload = unknown> = TooltipRootProps<Payload>;
  export type State = TooltipRootState;
  export type Actions = TooltipRootActions;
  export type ChangeEventReason = TooltipRootChangeEventReason;
  export type ChangeEventDetails = TooltipRootChangeEventDetails;
}
export const Trigger: typeof TriggerComponent = TriggerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Trigger {
  export type Props<Payload = unknown> = TooltipTriggerProps<Payload>;
  export type State = TooltipTriggerState;
}
export const Portal: typeof PortalComponent = PortalComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Portal {
  export type Props = TooltipPortalProps;
  export type State = TooltipPortalState;
}
export const Positioner: typeof PositionerComponent = PositionerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Positioner {
  export type Props = TooltipPositionerProps;
  export type State = TooltipPositionerState;
}
export const Popup: typeof PopupComponent = PopupComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Popup {
  export type Props = TooltipPopupProps;
  export type State = TooltipPopupState;
}
export const Arrow: typeof ArrowComponent = ArrowComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Arrow {
  export type Props = TooltipArrowProps;
  export type State = TooltipArrowState;
}
export const Viewport: typeof ViewportComponent = ViewportComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Viewport {
  export type Props = TooltipViewportProps;
  export type State = TooltipViewportState;
}
export { TooltipHandle as Handle, createTooltipHandle as createHandle } from './handle.svelte.js';
