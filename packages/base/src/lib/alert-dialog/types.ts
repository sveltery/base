// Public contracts from Base UI v1.8.0 (47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c), MIT.
import type { ComponentConstructorOptions, SvelteComponent } from 'svelte';
import type DialogTrigger from '../dialog/Trigger.svelte';
import type {
  DialogRootProps,
  DialogRootActions,
  DialogRootChangeEventReason,
  DialogRootChangeEventDetails,
  DialogTriggerProps,
  DialogTriggerState,
} from '../dialog/types.js';
import type { AlertDialogHandle } from './handle.js';

export interface AlertDialogRootProps<Payload = unknown> extends Omit<
  DialogRootProps<Payload>,
  'modal' | 'disablePointerDismissal' | 'onOpenChange' | 'actions' | 'handle'
> {
  onOpenChange?: ((open: boolean, details: AlertDialogRootChangeEventDetails) => void) | undefined;
  /** Native bind:actions replaces Source actionsRef. */
  actions?: AlertDialogRootActions | null | undefined;
  handle?: AlertDialogHandle<Payload> | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Preserve the actual pinned public empty state interface.
export interface AlertDialogRootState {}
export type AlertDialogRootActions = DialogRootActions;
export type AlertDialogRootChangeEventReason = DialogRootChangeEventReason;
export type AlertDialogRootChangeEventDetails = DialogRootChangeEventDetails;
export interface AlertDialogTriggerProps<Payload = unknown> extends Omit<
  DialogTriggerProps<Payload>,
  'handle'
> {
  handle?: AlertDialogHandle<Payload> | undefined;
}
export type AlertDialogTriggerState = DialogTriggerState;

/** The actual generic native Dialog Trigger with the narrower Source handle contract. */
export interface AlertDialogTrigger {
  new <Payload = unknown>(
    options: ComponentConstructorOptions<AlertDialogTriggerProps<Payload>>,
  ): SvelteComponent<
    AlertDialogTriggerProps<Payload>,
    InstanceType<typeof DialogTrigger<Payload>>['$$events_def'],
    InstanceType<typeof DialogTrigger<Payload>>['$$slot_def']
  > & { $$bindings?: typeof DialogTrigger.z_$$bindings };
  <Payload = unknown>(
    internals: Parameters<typeof DialogTrigger<Payload>>[0],
    props: AlertDialogTriggerProps<Payload>,
  ): ReturnType<typeof DialogTrigger<Payload>>;
  z_$$bindings?: typeof DialogTrigger.z_$$bindings;
}
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve the pinned exported erased interface namespace.
export namespace AlertDialogTrigger {
  export type Props<Payload = unknown> = AlertDialogTriggerProps<Payload>;
  export type State = AlertDialogTriggerState;
}

// Source's export type * includes the merged named Root namespace as well as its Props aliases.
export type { Root as AlertDialogRoot } from './index.parts.js';

export type {
  DialogBackdropProps as AlertDialogBackdropProps,
  DialogBackdropState as AlertDialogBackdropState,
  DialogCloseProps as AlertDialogCloseProps,
  DialogCloseState as AlertDialogCloseState,
  DialogDescriptionProps as AlertDialogDescriptionProps,
  DialogDescriptionState as AlertDialogDescriptionState,
  DialogPopupProps as AlertDialogPopupProps,
  DialogPopupState as AlertDialogPopupState,
  DialogPortalProps as AlertDialogPortalProps,
  DialogPortalState as AlertDialogPortalState,
  DialogTitleProps as AlertDialogTitleProps,
  DialogTitleState as AlertDialogTitleState,
  DialogViewportProps as AlertDialogViewportProps,
  DialogViewportState as AlertDialogViewportState,
} from '../dialog/types.js';
