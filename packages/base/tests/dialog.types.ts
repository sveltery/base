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
const nativeButton: Trigger = { name: 'intent', value: 'confirm', form: 'checkout', formaction: '/confirm', formmethod: 'post', formnovalidate: true,
  onclick(event) { const button: HTMLButtonElement = event.currentTarget; button.form?.requestSubmit(); event.preventBaseUIHandler(); },
  onpointerdown(event) { const pointer: PointerEvent = event; const button: HTMLButtonElement = event.currentTarget; event.preventBaseUIHandler(); void [pointer, button]; },
  onfocus(event) { const focus: FocusEvent = event; const button: HTMLButtonElement = event.currentTarget; event.preventBaseUIHandler(); void [focus, button]; },
  onwheel(event) { const wheel: WheelEvent = event; event.preventBaseUIHandler(); void wheel; },
  onpointerdowncapture(event) { event.preventBaseUIHandler(); const button: HTMLButtonElement = event.currentTarget; void button; },
};
const popupHandlers: Popup = { onpointerdown(event) { const element: HTMLElement = event.currentTarget; event.preventBaseUIHandler(); void element; }, onanimationend(event) { const animation: AnimationEvent = event; event.preventBaseUIHandler(); void animation; } };
// @ts-expect-error Native button type remains constrained.
const invalidButton: Trigger = { type: 'link' };
// @ts-expect-error Native pointer handlers must retain PointerEvent inference.
const invalidPointer: Trigger = { onpointerdown(event: KeyboardEvent) { void event; } };
const nativeStyle: Trigger = { style: { width: 20, opacity: 0.5 } };
function eventTypes(details: ChangeEventDetails) {
  if (details.reason === 'escape-key') { const event: KeyboardEvent = details.event; void event; }
  if (details.reason === 'outside-press') { const event: MouseEvent | PointerEvent | TouchEvent = details.event; void event; }
}
void [root, invalidRoot, invalidOpen, trigger, nativeButton, popupHandlers, invalidButton, invalidPointer, nativeStyle, eventTypes, apiEquality];
// ShadowRoot container/ref and disabled render replacement remain typed public APIs.
type Portal = ComponentProps<typeof Dialog.Portal>;
type Close = ComponentProps<typeof Dialog.Close>;
function shadowAPI(shadowRoot: ShadowRoot) {
  const direct: Portal = { container: shadowRoot };
  const ref: Portal = { container: { current: shadowRoot }, keepMounted: true };
  const waiting: Portal = { container: null };
  const close: Close = { nativeButton: false, disabled: true, onclick(event) { event.preventDefault(); event.preventBaseUIHandler(); } };
  // @ts-expect-error A Document cannot be used as a Portal target.
  const invalid: Portal = { container: shadowRoot.ownerDocument };
  void [direct, ref, waiting, close, invalid];
}
void shadowAPI;
