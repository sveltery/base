// Source AlertDialog aliases and erased generic component contracts (MIT, Base UI 1.8.0).
import RootComponent from './Root.svelte';
import * as Dialog from '../dialog/index.parts.js';
import type { AlertDialogRootProps, AlertDialogRootState, AlertDialogRootActions, AlertDialogRootChangeEventReason, AlertDialogRootChangeEventDetails, AlertDialogTrigger, AlertDialogTriggerProps, AlertDialogTriggerState } from './types.js';

export const Root: typeof RootComponent = RootComponent;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Root {
  export type Props<Payload = unknown> = AlertDialogRootProps<Payload>;
  export type State = AlertDialogRootState;
  export type Actions = AlertDialogRootActions;
  export type ChangeEventReason = AlertDialogRootChangeEventReason;
  export type ChangeEventDetails = AlertDialogRootChangeEventDetails;
}
// The pinned Trigger is the actual Dialog Trigger; only its generic handle contract narrows.
export const Trigger = Dialog.Trigger as AlertDialogTrigger;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Trigger {
  export type Props<Payload = unknown> = AlertDialogTriggerProps<Payload>;
  export type State = AlertDialogTriggerState;
}
export const Backdrop: typeof Dialog.Backdrop = Dialog.Backdrop;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Backdrop { export type Props = Dialog.Backdrop.Props; export type State = Dialog.Backdrop.State }
export const Close: typeof Dialog.Close = Dialog.Close;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Close { export type Props = Dialog.Close.Props; export type State = Dialog.Close.State }
export const Description: typeof Dialog.Description = Dialog.Description;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Description { export type Props = Dialog.Description.Props; export type State = Dialog.Description.State }
export const Popup: typeof Dialog.Popup = Dialog.Popup;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Popup { export type Props = Dialog.Popup.Props; export type State = Dialog.Popup.State }
export const Portal: typeof Dialog.Portal = Dialog.Portal;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Portal { export type Props = Dialog.Portal.Props; export type State = Dialog.Portal.State }
export const Title: typeof Dialog.Title = Dialog.Title;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Title { export type Props = Dialog.Title.Props; export type State = Dialog.Title.State }
export const Viewport: typeof Dialog.Viewport = Dialog.Viewport;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve pinned erased component namespace types.
export namespace Viewport { export type Props = Dialog.Viewport.Props; export type State = Dialog.Viewport.State }
export { AlertDialogHandle as Handle, createAlertDialogHandle as createHandle } from './handle.js';
