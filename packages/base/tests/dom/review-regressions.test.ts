import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/RegressionFixture.svelte';
import { mountRegressionReference } from '../../../../apps/fixtures/src/lib/regression-reference.js';
import { activeElement, tabbables } from '../../src/lib/overlay/focus.js';
import { DialogController } from '../../src/lib/dialog/controller.svelte.js';
import type { ChangeEventDetails, RootProps } from '../../src/lib/dialog/types.js';
// Actual component wiring supplements; native keyboard/default actions are checked in hosted Chromium.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 80)); await tick(); }
async function setup(scenario: string, reference: boolean) {
  const target = document.createElement('section'); document.body.append(target);
  if (reference) cleanup.push(mountRegressionReference(target, scenario));
  else { const component = mount(Fixture, { target, props: { scenario } }); cleanup.push(() => unmount(component)); }
  await settle(); document.getElementById('regression-trigger')!.click(); await settle();
}
function popup() { return document.querySelector('[role=dialog]'); }
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); document.body.replaceChildren(); });
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  for (const scenario of ['cancel', 'controlled']) it(`${framework}: ${scenario} canceled deferral lifecycle (intentional upstream correction)`, async () => {
    await setup(scenario, reference);
    (popup()!.querySelector('button') as HTMLElement).click(); await settle(); expect(popup()).not.toBeNull();
    (popup()!.querySelector('button') as HTMLElement).click(); await settle();
    if (reference) {
      // Pinned React retains the canceled decision too; record that defect rather than claim parity.
      expect(popup()!.hasAttribute('data-closed')).toBe(true);
      (document.querySelector('main') as HTMLElement & { regressionCommand(command: string): void }).regressionCommand('unmount'); await settle();
    }
    expect(popup()).toBeNull();
    expect(document.querySelector('[data-testid=completed]')!.textContent).toBe('[true,false]');
  });
  it(`${framework}: disabled custom anchor click is default-prevented`, async () => {
    await setup('disabled', reference);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
    popup()!.querySelector('a')!.dispatchEvent(event); await settle();
    expect(event.defaultPrevented).toBe(true); expect(popup()).not.toBeNull();
  });
}
it('Svelte: nested shadow first control is discovered for initial focus', async () => {
  const prior = HTMLElement.prototype.getClientRects;
  HTMLElement.prototype.getClientRects = function () { return [{ width: 20, height: 20 }] as unknown as DOMRectList; };
  try {
    await setup('shadow-initial', false);
    const root = document.getElementById('portal-host')!.shadowRoot!;
    const dialog = root.querySelector<HTMLElement>('[role=dialog]')!;
    const first = root.querySelector('#content-host')!.shadowRoot!.getElementById('first');
    expect(tabbables(dialog).map(node => node.id)).toEqual(['first', 'last']);
    expect(activeElement(document)).toBe(first);
  } finally { HTMLElement.prototype.getClientRects = prior; }
});
it('close deferral commits only the accepted request and retains callback ordering', () => {
  const trigger = document.createElement('button'); trigger.id = 'owner';
  let retained: ChangeEventDetails | undefined;
  const seen: string[] = [];
  let cancel = true;
  const props: RootProps = { defaultOpen: true, defaultTriggerId: trigger.id,
    onOpenChange(open, details) {
      seen.push(`consumer:${controller.open}:${controller.deferred}`);
      retained = details;
      if (cancel) { details.preventUnmountOnClose(); details.cancel(); }
    },
    onInternalOpenChange() { seen.push(`internal:${controller.open}:${controller.deferred}`); },
  };
  const controller = new DialogController(() => props, 'popup'); controller.triggers.set(trigger.id, trigger);
  controller.presence = true;
  const canceled = controller.request(false, 'close-press');
  expect(canceled.isCanceled).toBe(true); expect(controller.open).toBe(true); expect(controller.deferred).toBe(false);
  expect(controller.trigger).toBe(trigger); expect(controller.presence).toBe(true);
  retained!.preventUnmountOnClose(); expect(controller.deferred).toBe(false);
  cancel = false; controller.request(false, 'close-press');
  expect(controller.deferred).toBe(false); expect(controller.open).toBe(false); expect(controller.retainedTrigger).toBe(trigger);
  expect(seen).toEqual(['consumer:true:false', 'consumer:true:false', 'internal:true:false']);
  retained!.preventUnmountOnClose(); expect(controller.deferred).toBe(false);
});
it('opening deferral is ignored; each accepted close chooses its own deferral; cancellation and exceptions preserve the prior decision', () => {
  let mode: 'defer' | 'accept' | 'cancel' | 'throw' = 'defer';
  const controller = new DialogController(() => ({ onOpenChange(_open, details) {
    if (mode !== 'accept') details.preventUnmountOnClose();
    if (mode === 'cancel') details.cancel();
    if (mode === 'throw') throw new Error('consumer failure');
  } }), 'popup');
  controller.request(true, 'none'); expect(controller.deferred).toBe(false);
  controller.request(false, 'none'); expect(controller.deferred).toBe(true);
  mode = 'cancel'; controller.request(false, 'none'); expect(controller.deferred).toBe(true);
  mode = 'throw'; expect(() => controller.request(false, 'none')).toThrow('consumer failure'); expect(controller.deferred).toBe(true);
  mode = 'accept'; controller.request(false, 'none'); expect(controller.deferred).toBe(false);
});
it('disabled custom Close suppresses Space scroll and Enter activation without synthesizing clicks', async () => {
  await setup('disabled', false);
  const anchor = popup()!.querySelector('a')!;
  let clicks = 0; anchor.addEventListener('click', () => { clicks++; });
  for (const key of [' ', 'Enter']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }); anchor.dispatchEvent(event);
    anchor.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
    expect(event.defaultPrevented).toBe(true);
  }
  expect(clicks).toBe(0); expect(popup()).not.toBeNull();
});
it('composed discovery uses assigned slots once, prunes hidden/inert ancestors, and separates radio tree roots', () => {
  const host = document.createElement('div'); document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  host.innerHTML = '<button id="slotted" slot="action">Slot</button><button id="unassigned">Unassigned</button><input id="light-radio" type="radio" name="same" checked slot="action">';
  shadow.innerHTML = '<input id="shadow-radio" type="radio" name="same"><slot name="action"><button id="fallback">Fallback</button></slot><div id="nested"></div>';
  const nested = shadow.getElementById('nested')!;
  nested.attachShadow({ mode: 'open' }).innerHTML = '<button id="deep">Deep</button>';
  for (const element of [...host.querySelectorAll('button,input'), ...shadow.querySelectorAll('button,input'), ...nested.shadowRoot!.querySelectorAll('button')]) (element as HTMLElement).getClientRects = () => [{ width: 20, height: 20 }] as unknown as DOMRectList;
  expect(tabbables(host).map(node => node.id)).toEqual(['shadow-radio', 'slotted', 'light-radio', 'deep']);
  expect(tabbables(shadow).map(node => node.id)).toEqual(['shadow-radio', 'slotted', 'light-radio', 'deep']);
  nested.setAttribute('inert', ''); expect(tabbables(host).map(node => node.id)).toEqual(['shadow-radio', 'slotted', 'light-radio']);
  host.hidden = true; expect(tabbables(host)).toEqual([]);
  host.hidden = false; host.setAttribute('inert', ''); expect(tabbables(host)).toEqual([]);
});
