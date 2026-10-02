// Pinned assertion adapters and supplemental gates; MIT: parity/direction-provider/UPSTREAM_LICENSE.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/DirectionProviderFixture.svelte';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup(scenario: string) {
  const host = document.createElement('div'); document.body.append(host);
  const component = mount(Fixture, { target: host, props: { scenario } });
  cleanups.push(() => unmount(component)); flushSync();
  const text = (id = 'direction') => host.querySelector(`[data-testid="${id}"]`)?.textContent;
  return { component, host, text };
}

it('DirectionProvider:28 defaults useDirection to ltr outside a provider', () => {
  const { text } = setup('outside'); expect(text()).toContain('ltr');
});
it('DirectionProvider:34 provides the configured direction to descendants', () => {
  const { component, text, host } = setup('configured');
  const original = host.querySelector('[data-testid=direction]');
  expect(text()).toContain('rtl');
  component.update('ltr'); flushSync(); expect(text()).toContain('ltr');
  expect(host.querySelector('[data-testid=direction]')).toBe(original);
});
it('supplement omitted and cleared direction default to ltr', () => {
  const { component, text } = setup('default'); expect(text()).toBe('ltr');
  component.update('rtl'); flushSync(); expect(text()).toBe('rtl');
  component.update(undefined); flushSync(); expect(text()).toBe('ltr');
});
it('supplement nearest provider shadows outer direction and survives updates and remounts', () => {
  const { component, text } = setup('nested');
  expect([text('outer-before'), text('inner'), text('outer-after'), text('outside')]).toEqual(['rtl', 'ltr', 'rtl', 'ltr']);
  component.updateInner('rtl'); flushSync(); expect(text('inner')).toBe('rtl');
  component.update('ltr'); flushSync(); expect([text('outer-before'), text('inner'), text('outer-after')]).toEqual(['ltr', 'rtl', 'ltr']);
  component.updateInner(undefined); flushSync(); expect(text('inner')).toBe('ltr');
  component.toggleInner(); flushSync(); expect(text('inner')).toBeUndefined();
  component.update('rtl'); component.toggleInner(); flushSync();
  expect([text('outer-before'), text('inner'), text('outer-after'), text('outside')]).toEqual(['rtl', 'ltr', 'rtl', 'ltr']);
});
it('supplement provider introduces no DOM host or dir attribute', () => {
  const { host } = setup('configured');
  const providerHost = host.querySelector('[data-testid=provider-host]')!;
  expect([...providerHost.children].map(node => node.tagName)).toEqual(['SPAN']);
  expect(host.querySelector('[dir]')).toBeNull();
});
