import type { ComponentProps, Snippet } from 'svelte';
import * as Dialog from '../src/lib/dialog/index.js';
import { createDialogHandle, DialogHandle } from '../src/lib/dialog/handle.svelte.js';
import type { RootProps, TriggerProps } from '../src/lib/dialog/types.js';
import Fixture from './DialogPayloadTypes.svelte';
import { expectType } from './expect-type.js';
const handle = createDialogHandle<number>();
const constructed = new DialogHandle<number>();
// @ts-expect-error The pinned Handle type requires its payload argument (construction still infers unknown).
const missingPayloadType: DialogHandle = constructed;
const root: RootProps<number> = { handle };
const trigger: TriggerProps<number> = { handle, payload: 42 };
const withoutPayload: ComponentProps<typeof Dialog.Trigger<number>> = { handle };
const direct: Snippet = null as unknown as Snippet;
const directRoot: ComponentProps<typeof Dialog.Root<number>> = { handle, children: direct };
// @ts-expect-error Pinned number handle rejects string payload.
const invalid: ComponentProps<typeof Dialog.Trigger<number>> = { handle, payload: 'invalid' };
// @ts-expect-error Imperative payload retains the generic handle contract.
handle.openWithPayload('invalid');
function equality(payload: Parameters<NonNullable<RootProps<number>['children']>>[0]['payload']) {
  expectType<number | undefined, typeof payload>(payload);
}
void [
  constructed,
  missingPayloadType,
  root,
  trigger,
  withoutPayload,
  directRoot,
  invalid,
  equality,
  Fixture,
];
