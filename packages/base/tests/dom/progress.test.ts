// Supplementary DOM gates and direct callback assertion witnesses. MIT: parity/progress/UPSTREAM_LICENSE.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/ProgressFixture.svelte';
import { Progress } from '../../src/lib/progress/index.js';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function setup(scenario: string, ariaSpy = vi.fn(), valueSpy = vi.fn()) {
  const host = document.createElement('div'); document.body.append(host);
  const component = mount(Fixture, { target: host, props: { scenario, ariaSpy, valueSpy } });
  cleanups.push(() => unmount(component)); flushSync();
  return { component, host, ariaSpy, valueSpy, root: host.querySelector<HTMLElement>('#tested-progress')! };
}
it('Root:262 direct callback receives formatted and raw arguments for determinate/null', () => {
  const { component, ariaSpy, root, host } = setup('callback'); const expected = new Intl.NumberFormat(undefined, { style: 'percent' }).format(.3);
  expect(ariaSpy).toHaveBeenLastCalledWith(expected, 30); expect(root.getAttribute('aria-valuetext')).toBe(`${expected} uploaded`); expect(host.querySelector('[data-testid=value]')!.textContent).toBe(expected);
  component.update({ value: null }); flushSync(); expect(ariaSpy).toHaveBeenLastCalledWith('', null); expect(root.getAttribute('aria-valuetext')).toBe('Waiting to start'); expect(host.querySelector('[data-testid=value]')!.textContent).toBe('');
});
for (const [scenario, value, clamped] of [['formatted-over', 50, 40], ['formatted-under', 10, 20]] as const) it(`parameterized Root:180 callback raw ${value}`, () => {
  const { ariaSpy, root, host } = setup(scenario); const expected = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(clamped);
  expect(root.getAttribute('aria-valuenow')).toBe(String(clamped)); expect(host.querySelector('[data-testid=value]')!.textContent).toBe(expected); expect(ariaSpy).toHaveBeenLastCalledWith(expected, value); expect(root.getAttribute('aria-valuetext')).toBe(`${expected} (raw: ${value})`);
});
it('Value:48 direct child arguments are formatted and raw', () => {
  const { valueSpy } = setup('value-callback'); expect(valueSpy).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(30), 30);
});
for (const [scenario, raw] of [['value-null', null], ['value-nan', NaN]] as const) it(`parameterized Value:66 direct child indeterminate ${scenario}`, () => {
  const { valueSpy } = setup(scenario); expect(valueSpy).toHaveBeenLastCalledWith('indeterminate', raw);
});
it('Label:49 missing context throws the pinned descriptive error', () => {
  const target = document.createElement('div'); const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try { expect(() => mount(Progress.Label, { target })).toThrow('Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.'); } finally { error.mockRestore(); }
});
for (const [part, Component] of Object.entries({ Label: Progress.Label, Track: Progress.Track, Indicator: Progress.Indicator, Value: Progress.Value })) it(`supplement ${part} requires Progress context`, () => {
  const target = document.createElement('div'); expect(() => mount(Component, { target })).toThrow('ProgressRootContext is missing');
});
it('replacement refs follow actual hosts and clear on replacement/removal', () => {
  const { component, root, host } = setup('replacement'); const old = component.refs();
  expect(old.every(node => node?.tagName === 'SECTION')).toBe(true); expect(old[0]).toBe(root);
  expect(host.querySelector('[data-testid=value]')!.textContent).toBe(new Intl.NumberFormat(undefined, { style: 'percent' }).format(.4));
  expect(root.querySelector(':scope > span[role=presentation]')!.textContent).toBe('x');
  component.replaceHost(); flushSync(); const current = component.refs(); expect(current.every(node => node?.tagName === 'ARTICLE')).toBe(true); expect(old.every(node => !node?.isConnected)).toBe(true);
  component.remove(); flushSync(); expect(component.refs()).toEqual([null, null, null, null, null]);
});
it('labels register, change IDs and clean up without clearing a newer association', () => {
  const { component, root } = setup('labels'); expect(root.getAttribute('aria-labelledby')).toBe('label-a'); component.changeLabel('label-b'); flushSync(); expect(root.getAttribute('aria-labelledby')).toBe('label-b'); component.removeLabel(); flushSync(); expect(root.hasAttribute('aria-labelledby')).toBe(false);
});
it('format, locale and bounds resolve without a copied-state effect', () => {
  const { component, root, host } = setup('currency'); component.update({ min: 20, max: 40, value: 50, locale: 'de-DE', format: { style: 'currency', currency: 'EUR' } }); flushSync();
  const text = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(40);
  expect(root.getAttribute('aria-valuenow')).toBe('40'); expect(root.getAttribute('aria-valuetext')).toBe(text); expect(host.querySelector('[data-testid=value]')!.textContent).toBe(text); expect((host.querySelector('[data-testid=indicator]') as HTMLElement).style.width).toBe('100%');
});
it('nonfinite transitions retain raw callback values and empty ARIA formatter arguments', () => {
  const { component, ariaSpy, root, host } = setup('callback'); for (const value of [NaN, Infinity, -Infinity]) { component.update({ value }); flushSync(); expect(ariaSpy).toHaveBeenLastCalledWith('', value); expect(root.hasAttribute('data-indeterminate')).toBe(true); expect(root.hasAttribute('aria-valuenow')).toBe(false); expect(host.querySelector('[data-testid=value]')!.textContent).toBe(''); expect((host.querySelector('[data-testid=indicator]') as HTMLElement).style.cssText).toBe(''); }
});
