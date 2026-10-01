import type { ComponentProps } from 'svelte';
import * as Dialog from '../src/lib/dialog/index.js';
import type { ChangeEventDetails, Actions, FocusTarget } from '../src/lib/dialog/types.js';
import { expectType } from './expect-type.js';
type Root = ComponentProps<typeof Dialog.Root>;
type Popup = ComponentProps<typeof Dialog.Popup>;
type Trigger = ComponentProps<typeof Dialog.Trigger>;
function apiEquality(root: Root, popup: Popup) {
  expectType<boolean | undefined, Root['open']>(root.open);
  expectType<Actions | null | undefined, Root['actions']>(root.actions);
  expectType<FocusTarget | undefined, Popup['initialFocus']>(popup.initialFocus);
}
const root: Root = { modal: 'trap-focus', onOpenChange(open, details) { const value: boolean = open; details.cancel(); details.preventUnmountOnClose(); void value; } };
// @ts-expect-error Unsupported modal string must be rejected.
const invalidRoot: Root = { modal: 'yes' };
// @ts-expect-error Controlled open is boolean.
const invalidOpen: Root = { open: 'true' };
const trigger: Trigger = { nativeButton: false, onclick(event) { event.preventBaseUIHandler(); event.preventDefault(); } };
function eventTypes(details: ChangeEventDetails) {
  if (details.reason === 'escape-key') { const event: KeyboardEvent = details.event; void event; }
  if (details.reason === 'outside-press') { const event: MouseEvent | PointerEvent | TouchEvent = details.event; void event; }
}
void [root, invalidRoot, invalidOpen, trigger, eventTypes, apiEquality];
