import RootComponent from './Root.svelte';
import TriggerComponent from './Trigger.svelte';
import PortalComponent from './Portal.svelte';
import PopupComponent from './Popup.svelte';
import BackdropComponent from './Backdrop.svelte';
import TitleComponent from './Title.svelte';
import DescriptionComponent from './Description.svelte';
import CloseComponent from './Close.svelte';
import type { DialogRootProps, DialogRootState, DialogRootActions, DialogRootChangeEventReason, DialogRootChangeEventDetails, DialogTriggerProps, DialogTriggerState, DialogPortalProps, DialogPortalState, DialogPopupProps, DialogPopupState, DialogBackdropProps, DialogBackdropState, DialogTitleProps, DialogTitleState, DialogDescriptionProps, DialogDescriptionState, DialogCloseProps, DialogCloseState } from './types.js';

export const Root = RootComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Root {
  export type Props<Payload = unknown> = DialogRootProps<Payload>;
  export type State = DialogRootState;
  export type Actions = DialogRootActions;
  export type ChangeEventReason = DialogRootChangeEventReason;
  export type ChangeEventDetails = DialogRootChangeEventDetails;
}
export const Trigger = TriggerComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Trigger {
  export type Props<Payload = unknown> = DialogTriggerProps<Payload>;
  export type State = DialogTriggerState;
}
export const Portal = PortalComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Portal {
  export type Props = DialogPortalProps;
  export type State = DialogPortalState;
}
export const Popup = PopupComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Popup {
  export type Props = DialogPopupProps;
  export type State = DialogPopupState;
}
export const Backdrop = BackdropComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Backdrop {
  export type Props = DialogBackdropProps;
  export type State = DialogBackdropState;
}
export const Title = TitleComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Title {
  export type Props = DialogTitleProps;
  export type State = DialogTitleState;
}
export const Description = DescriptionComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Description {
  export type Props = DialogDescriptionProps;
  export type State = DialogDescriptionState;
}
export const Close = CloseComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Close {
  export type Props = DialogCloseProps;
  export type State = DialogCloseState;
}
export { DialogHandle as Handle, createDialogHandle as createHandle } from './handle.svelte.js';
