// Actual pinned Source/native JSDOM observations; no secured browser or ordinary-credit substitute. MIT.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/TabsBrowserFixture.svelte';
import { act, mountTabsReference } from '../../../../apps/fixtures/src/lib/tabs-reference.js';
const cleanups: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await act(cleanup);
  document.body.replaceChildren();
});
async function setup(framework: string, scenario = 'default') {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div'); document.body.append(host);
  if (framework === 'react') await act(() => { cleanups.push(mountTabsReference(host, scenario)); });
  else { const component = mount(Fixture, { target: host, props: { scenario } }); cleanups.push(() => unmount(component)); flushSync(); await tick(); }
  const tab = (index: number) => host.querySelector<HTMLElement>(`#tab-${index}`)!;
  const active = () => host.querySelector('[aria-selected=true]')?.getAttribute('data-testid') ?? null;
  const log = () => JSON.parse(host.querySelector('#calls')!.textContent!) as Array<{ value: unknown; reason: string; canceled: boolean }>;
  const click = async (selector: string) => { await act(() => { (host.querySelector(selector) as HTMLElement).click(); flushSync(); }); await tick(); };
  const focus = async (index: number) => { await act(() => { tab(index).focus(); flushSync(); }); await tick(); };
  const key = async (index: number, key: string) => { await act(async () => { tab(index).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); flushSync(); await tick(); }); };
  return { host, tab, active, log, click, focus, key };
}
for (const framework of ['react', 'svelte']) {
  for (const [scenario, selected, reasons] of [['default', 'tab-0', []], ['implicit', 'tab-0', ['initial']], ['implicit-disabled-first', 'tab-1', ['initial']], ['disabled-first', 'tab-0', []], ['all-disabled', null, ['initial']], ['missing', 'tab-0', ['missing']], ['controlled-missing', null, []], ['null', null, []]] as const) {
    it(`${framework} actual Source/native initial selection ${scenario}`, async () => {
      const fixture = await setup(framework, scenario); expect(fixture.active()).toBe(selected); expect(fixture.log().map(entry => entry.reason)).toEqual(reasons);
    });
  }
  it(`${framework} actual Source/native cancellation, association and panel presence`, async () => {
    const fixture = await setup(framework, 'cancel'); await fixture.click('#tab-1');
    expect(fixture.active()).toBe('tab-0'); expect(fixture.log()).toMatchObject([{ value: 1, canceled: true, reason: 'none' }]);
    const panel = fixture.host.querySelector('[role=tabpanel]')!;
    expect(panel.getAttribute('aria-labelledby')).toBe('tab-0'); expect(fixture.tab(0).getAttribute('aria-controls')).toBe(panel.id);
  });
  it(`${framework} actual Source/native noncancelable automatic initial and disabled fallback`, async () => {
    const fixture = await setup(framework, 'implicit-disabled-first-cancel'); expect(fixture.active()).toBe('tab-1');
    await fixture.click('#disable'); expect(fixture.active()).toBe('tab-0'); expect(fixture.log().map(entry => entry.reason)).toEqual(['initial', 'disabled']);
  });
  it(`${framework} actual Source/native keyboard focus, Home/End and disabled focusability`, async () => {
    const fixture = await setup(framework, 'disabled-middle'); await fixture.focus(0); await fixture.key(0, 'ArrowRight');
    expect(document.activeElement).toBe(fixture.tab(1)); expect(fixture.active()).toBe('tab-0');
    await fixture.key(1, 'End'); expect(document.activeElement).toBe(fixture.tab(2));
    await fixture.key(2, ' '); expect(fixture.active()).toBe('tab-2');
    await fixture.key(2, 'Home'); expect(document.activeElement).toBe(fixture.tab(0));
  });
  it(`${framework} actual Source/native focus activation and custom host replacement`, async () => {
    const fixture = await setup(framework, 'activate'); await fixture.focus(1); expect(fixture.active()).toBe('tab-1');
    await fixture.click('#swap'); expect(fixture.tab(1).tagName).toBe('DIV');
    await fixture.focus(2); expect(fixture.active()).toBe('tab-2');
  });
  it(`${framework} actual Source/native duplicate panel cleanup keeps newer ownership`, async () => {
    const fixture = await setup(framework, 'keep'); await fixture.click('#duplicate');
    const id = fixture.host.querySelector('[data-testid=duplicate-panel]')!.id;
    expect(fixture.tab(0).getAttribute('aria-controls')).toBe(id); await fixture.click('#drop-original');
    expect(fixture.tab(0).getAttribute('aria-controls')).toBe(id);
  });
  it(`${framework} actual Source/native selected removal and no-enabled fallback keep reasons`, async () => {
    const fixture = await setup(framework); await fixture.click('#tab-1'); await fixture.click('#disable');
    expect(fixture.active()).toBe('tab-0'); await fixture.click('#remove'); expect(fixture.active()).toBe('tab-2');
    await fixture.click('#clear'); expect(fixture.active()).toBe(null); expect(fixture.log().map(entry => entry.reason)).toEqual(['none', 'disabled', 'missing', 'missing']);
  });
}
