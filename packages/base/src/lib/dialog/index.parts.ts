import RootComponent from './Root.svelte';
import TriggerComponent from './Trigger.svelte';
import PortalComponent from './Portal.svelte';
import PopupComponent from './Popup.svelte';
import ViewportComponent from './Viewport.svelte';
import BackdropComponent from './Backdrop.svelte';
import TitleComponent from './Title.svelte';
import DescriptionComponent from './Description.svelte';
import CloseComponent from './Close.svelte';
import type { DialogRootProps, DialogRootState, DialogRootActions, DialogRootChangeEventReason, DialogRootChangeEventDetails, DialogTriggerProps, DialogTriggerState, DialogPortalProps, DialogPortalState, DialogPopupProps, DialogPopupState, DialogViewportProps, DialogViewportState, DialogBackdropProps, DialogBackdropState, DialogTitleProps, DialogTitleState, DialogDescriptionProps, DialogDescriptionState, DialogCloseProps, DialogCloseState } from './types.js';

export const Root: typeof RootComponent = RootComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Root {
  export type Props<Payload = unknown> = DialogRootProps<Payload>;
  export type State = DialogRootState;
  export type Actions = DialogRootActions;
  export type ChangeEventReason = DialogRootChangeEventReason;
  export type ChangeEventDetails = DialogRootChangeEventDetails;
}
export const Trigger: typeof TriggerComponent = TriggerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Trigger {
  export type Props<Payload = unknown> = DialogTriggerProps<Payload>;
  export type State = DialogTriggerState;
}
export const Portal: typeof PortalComponent = PortalComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Portal {
  export type Props = DialogPortalProps;
  export type State = DialogPortalState;
}
export const Popup: typeof PopupComponent = PopupComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Popup {
  export type Props = DialogPopupProps;
  export type State = DialogPopupState;
}
export const Viewport: typeof ViewportComponent = ViewportComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Viewport {
  export type Props = DialogViewportProps;
  export type State = DialogViewportState;
}
export const Backdrop: typeof BackdropComponent = BackdropComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Backdrop {
  export type Props = DialogBackdropProps;
  export type State = DialogBackdropState;
}
export const Title: typeof TitleComponent = TitleComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Title {
  export type Props = DialogTitleProps;
  export type State = DialogTitleState;
}
export const Description: typeof DescriptionComponent = DescriptionComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Description {
  export type Props = DialogDescriptionProps;
  export type State = DialogDescriptionState;
}
export const Close: typeof CloseComponent = CloseComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Close {
  export type Props = DialogCloseProps;
  export type State = DialogCloseState;
}
export { DialogHandle as Handle, createDialogHandle as createHandle } from './handle.svelte.js';
