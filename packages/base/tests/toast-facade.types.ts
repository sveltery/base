import type { Snippet } from 'svelte';
import { createToastManager } from '../src/lib/toast/index';
import type { ToastManagerFacade, ToastObject } from '../src/lib/toast/index';
import { createToastFacade } from '../src/lib/toast/facade';
import { ToastStore } from '../src/lib/toast/store';
import { expectType } from './expect-type';

type Payload = { count: number };
const store = new ToastStore();
const facade = createToastFacade<Payload>(store);
expectType<ToastManagerFacade<Payload>, typeof facade>(facade);
expectType<ToastObject<Payload>[], typeof facade.toasts>(facade.toasts);
facade.update('a', previous => {
  expectType<Payload | undefined, typeof previous.data>(previous.data);
  return { data: { count: 1 } };
});
const manager = createToastManager<Payload>();
manager.add({ title: 0, description: false, actionProps: {
  children: 'Act',
  onclick(event) { event.preventBaseUIHandler(); },
} });
function acceptsSnippet(content: Snippet) { manager.add({ title: content }); }
void acceptsSnippet;
// @ts-expect-error -- Public add cannot register internal measurement.
manager.add({ height: 10 });
// @ts-expect-error -- Public update cannot change lifecycle state.
manager.update('a', { transitionStatus: 'ending' });
// @ts-expect-error -- Arbitrary React-style content objects are not Svelte content.
manager.add({ title: {} });
// @ts-expect-error -- Anchored Positioner has no implemented public contract in this slice.
manager.add({ positionerProps: { anchor: null } });
// @ts-expect-error -- Context facade must preserve the complete data value.
facade.update('a', { data: {} });
