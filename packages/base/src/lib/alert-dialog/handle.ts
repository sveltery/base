// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { DialogHandle } from '../dialog/store/DialogHandle.svelte.js';

/** Controls an AlertDialog Root and associates its detached triggers. */
export class AlertDialogHandle<Payload> extends DialogHandle<Payload> {
  // Source nominal brand has no runtime presence; the Dialog superclass owns all business behavior.
  declare private readonly __alertDialogBrand: never;
}

/** Creates a handle to connect an AlertDialog Root with detached triggers. */
export function createAlertDialogHandle<Payload>(): AlertDialogHandle<Payload> {
  return new AlertDialogHandle<Payload>();
}
