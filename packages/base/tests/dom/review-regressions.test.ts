import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/RegressionFixture.svelte';
import { mountRegressionReference } from '../../../../apps/fixtures/src/lib/regression-reference.js';
import { activeElement } from '@sveltery/utils/shadowDom';
import { tabbable as tabbables } from '../../src/lib/floating-ui/utils/tabbable.js';
import { DialogStore } from '../../src/lib/dialog/store/DialogStore.svelte.js';
import { createChangeEventDetails } from '../../src/lib/internals/createBaseUIEventDetails.js';
import type { ChangeEventDetails } from '../../src/lib/dialog/types.js';
// Actual component wiring supplements; native keyboard/default actions are checked in hosted Chromium.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 80));
  await tick();
}
async function setup(scenario: string, reference: boolean) {
  const target = document.createElement('section');
  document.body.append(target);
  if (reference) cleanup.push(mountRegressionReference(target, scenario));
  else {
    const component = mount(Fixture, { target, props: { scenario } });
    cleanup.push(() => unmount(component));
  }
  await settle();
  document.getElementById('regression-trigger')!.click();
  await settle();
}
function popup() {
  return document.querySelector('[role=dialog]');
}
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  document.body.replaceChildren();
});
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['cancel', 'controlled'])
    it(`${framework}: ${scenario} canceled deferral retains the original prevent-unmount side effect`, async () => {
      await setup(scenario, reference);
      (popup()!.querySelector('button') as HTMLElement).click();
      await settle();
      expect(popup()).not.toBeNull();
      (popup()!.querySelector('button') as HTMLElement).click();
      await settle();
      {
        // Both source and native port retain this immediate canceled callback side effect.
        expect(popup()!.hasAttribute('data-closed')).toBe(true);
        (
          document.querySelector('main') as HTMLElement & {
            regressionCommand(command: string): void;
          }
        ).regressionCommand('unmount');
        await settle();
      }
      expect(popup()).toBeNull();
      expect(document.querySelector('[data-testid=completed]')!.textContent).toBe('[true,false]');
    });
  it(`${framework}: disabled custom anchor click is default-prevented`, async () => {
    await setup('disabled', reference);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
    popup()!.querySelector('a')!.dispatchEvent(event);
    await settle();
    expect(event.defaultPrevented).toBe(true);
    expect(popup()).not.toBeNull();
  });
}
it('Svelte: nested shadow first control is discovered for initial focus', async () => {
  const prior = HTMLElement.prototype.getClientRects;
  HTMLElement.prototype.getClientRects = function () {
    return [{ width: 20, height: 20 }] as unknown as DOMRectList;
  };
  try {
    await setup('shadow-initial', false);
    const root = document.getElementById('portal-host')!.shadowRoot!;
    const dialog = root.querySelector<HTMLElement>('[role=dialog]')!;
    const first = root.querySelector('#content-host')!.shadowRoot!.getElementById('first');
    expect(tabbables(dialog).map((node) => node.id)).toEqual(['first', 'last']);
    expect(activeElement(document)).toBe(first);
  } finally {
    HTMLElement.prototype.getClientRects = prior;
  }
});
it('canceled deferral writes immediately and a retained details callback can still write the source store', () => {
  const trigger = document.createElement('button');
  trigger.id = 'owner';
  const store = new DialogStore<unknown>(
    { open: true, mounted: true, activeTriggerId: trigger.id, activeTriggerElement: trigger },
    'popup',
    false,
  );
  let retained: ChangeEventDetails | undefined;
  let cancel = true;
  const seen: string[] = [];
  store.context.onOpenChange = (_open, details) => {
    seen.push(`consumer:${store.select('open')}:${store.state.preventUnmountingOnClose}`);
    retained = details;
    if (cancel) {
      details.preventUnmountOnClose();
      details.cancel();
    }
  };
  store.context.onInternalOpenChange = () =>
    seen.push(`internal:${store.select('open')}:${store.state.preventUnmountingOnClose}`);
  const canceled = createChangeEventDetails('close-press');
  store.setOpen(false, canceled);
  expect(canceled.isCanceled).toBe(true);
  expect(store.select('open')).toBe(true);
  expect(store.state.preventUnmountingOnClose).toBe(true);
  expect(store.state.activeTriggerElement).toBe(trigger);
  expect(store.select('mounted')).toBe(true);
  cancel = false;
  store.setOpen(false, createChangeEventDetails('close-press'));
  expect(store.select('open')).toBe(false);
  expect(store.state.preventUnmountingOnClose).toBe(true);
  expect(seen).toEqual(['consumer:true:false', 'consumer:true:true', 'internal:true:true']);
  store.set('preventUnmountingOnClose', false);
  retained!.preventUnmountOnClose();
  expect(store.state.preventUnmountingOnClose).toBe(true);
});
it('accepted opening resets deferral while canceled or throwing callbacks preserve their immediate writes', () => {
  let mode: 'defer' | 'accept' | 'cancel' | 'throw' = 'defer';
  const store = new DialogStore<unknown>(undefined, 'popup', false);
  store.context.onOpenChange = (_open, details) => {
    if (mode !== 'accept') details.preventUnmountOnClose();
    if (mode === 'cancel') details.cancel();
    if (mode === 'throw') throw new Error('consumer failure');
  };
  store.setOpen(true, createChangeEventDetails('none'));
  expect(store.state.preventUnmountingOnClose).toBe(false);
  store.setOpen(false, createChangeEventDetails('none'));
  expect(store.state.preventUnmountingOnClose).toBe(true);
  mode = 'cancel';
  store.setOpen(false, createChangeEventDetails('none'));
  expect(store.state.preventUnmountingOnClose).toBe(true);
  mode = 'throw';
  expect(() => store.setOpen(false, createChangeEventDetails('none'))).toThrow('consumer failure');
  expect(store.state.preventUnmountingOnClose).toBe(true);
  mode = 'accept';
  store.setOpen(false, createChangeEventDetails('none'));
  expect(store.state.preventUnmountingOnClose).toBe(true);
  store.setOpen(true, createChangeEventDetails('none'));
  expect(store.state.preventUnmountingOnClose).toBe(false);
});
it('disabled custom Close preserves source keyboard defaults without synthesizing clicks', async () => {
  await setup('disabled', false);
  const anchor = popup()!.querySelector('a')!;
  let clicks = 0;
  anchor.addEventListener('click', () => {
    clicks++;
  });
  for (const key of [' ', 'Enter']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    anchor.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
    expect(event.defaultPrevented).toBe(false);
  }
  expect(clicks).toBe(0);
  expect(popup()).not.toBeNull();
});
it('composed discovery uses assigned slots once, prunes hidden/inert ancestors, and retains original cross-root radio grouping', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  host.innerHTML =
    '<button id="slotted" slot="action">Slot</button><button id="unassigned">Unassigned</button><input id="light-radio" type="radio" name="same" checked slot="action">';
  shadow.innerHTML =
    '<input id="shadow-radio" type="radio" name="same"><slot name="action"><button id="fallback">Fallback</button></slot><div id="nested"></div>';
  const nested = shadow.getElementById('nested')!;
  nested.attachShadow({ mode: 'open' }).innerHTML = '<button id="deep">Deep</button>';
  for (const element of [
    ...host.querySelectorAll('button,input'),
    ...shadow.querySelectorAll('button,input'),
    ...nested.shadowRoot!.querySelectorAll('button'),
  ])
    (element as HTMLElement).getClientRects = () =>
      [{ width: 20, height: 20 }] as unknown as DOMRectList;
  expect(tabbables(host).map((node) => node.id)).toEqual(['slotted', 'light-radio', 'deep']);
  expect(tabbables(shadow as unknown as Element).map((node) => node.id)).toEqual([
    'slotted',
    'light-radio',
    'deep',
  ]);
  nested.setAttribute('inert', '');
  expect(tabbables(host).map((node) => node.id)).toEqual(['slotted', 'light-radio']);
  host.hidden = true;
  expect(tabbables(host)).toEqual([]);
  host.hidden = false;
  host.setAttribute('inert', '');
  expect(tabbables(host)).toEqual([]);
});
