import type { ComponentProps } from 'svelte';
import { AlertDialog } from '../src/lib/alert-dialog/index.js';
import { Dialog } from '../src/lib/dialog/index.js';
import type { AlertDialogRoot, AlertDialogTrigger, AlertDialogRootProps, AlertDialogTriggerProps } from '../src/lib/alert-dialog/types.js';
import { expectType } from './expect-type.js';
const handle = AlertDialog.createHandle<number>();
const dialogHandle = Dialog.createHandle<number>();
const goodRoot: AlertDialogRootProps<number> = { handle, open: undefined, actions: undefined };
const goodTrigger: AlertDialogTriggerProps<number> = { handle, payload: 42, ref: undefined };
const nativeTrigger: ComponentProps<typeof AlertDialog.Trigger<number>> = goodTrigger;
const namedRootNamespace: AlertDialogRoot.Props<number> = goodRoot;
const namedTriggerNamespace: AlertDialogTrigger.Props<number> = goodTrigger;
const namedRootState: AlertDialogRoot.State = { sourceAllowsAnEmptyInterface: true };
// @ts-expect-error Original invalid number payload is rejected.
const invalidPayload: ComponentProps<typeof AlertDialog.Trigger<number>> = { handle, payload: 'invalid' };
// @ts-expect-error Original ordinary Dialog handle cannot bind an AlertDialog Root.
const invalidRoot: ComponentProps<typeof AlertDialog.Root<number>> = { handle: dialogHandle };
// @ts-expect-error Original ordinary Dialog handle cannot bind an AlertDialog Trigger.
const invalidTrigger: ComponentProps<typeof AlertDialog.Trigger<number>> = { handle: dialogHandle };
// @ts-expect-error Source AlertDialog has no modal override.
const invalidModal: AlertDialogRootProps<number> = { modal: false };
// @ts-expect-error Source AlertDialog has no pointer-dismissal override.
const invalidDismissal: AlertDialogRootProps<number> = { disablePointerDismissal: false };
// @ts-expect-error Source class type needs its payload argument.
const invalidBareHandle: AlertDialog.Handle = handle;
const sourceSubclass: Dialog.Handle<number> = handle;
function equality(payload: Parameters<NonNullable<AlertDialogRootProps<number>['children']>>[0]['payload']) {
  expectType<number | undefined, typeof payload>(payload);
}
void [goodRoot, goodTrigger, nativeTrigger, namedRootNamespace, namedTriggerNamespace, namedRootState, invalidPayload, invalidRoot, invalidTrigger, invalidModal, invalidDismissal, invalidBareHandle, sourceSubclass, equality];
