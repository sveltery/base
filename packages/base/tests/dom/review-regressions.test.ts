import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/RegressionFixture.svelte';
import { mountRegressionReference } from '../../../../apps/fixtures/src/lib/regression-reference.js';
import { activeElement, tabbables } from '../../src/lib/overlay/focus.js';
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
  for (const scenario of ['cancel', 'controlled']) it(`${framework}: ${scenario} deferral does not survive a canceled close`, async () => {
    await setup(scenario, reference);
    (popup()!.querySelector('button') as HTMLElement).click(); await settle(); expect(popup()).not.toBeNull();
    (popup()!.querySelector('button') as HTMLElement).click(); await settle(); expect(popup()).toBeNull();
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
