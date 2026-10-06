// Direct callback witnesses and supplemental DOM gates. MIT: parity/meter/UPSTREAM_LICENSE.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/MeterFixture.svelte';
import Nested from './MeterNestedFixture.svelte';
import { Meter } from '../../src/lib/meter/index.js';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup(scenario: string, ariaSpy = vi.fn(), valueSpy = vi.fn()) {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Fixture, { target: host, props: { scenario, ariaSpy, valueSpy } });
  cleanups.push(() => unmount(component));
  flushSync();
  return {
    component,
    host,
    ariaSpy,
    valueSpy,
    root: host.querySelector<HTMLElement>('#tested-meter')!,
  };
}
const percent = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'percent' }).format(value);

it('Root:101 direct callback receives formatted and raw value while only replacing spoken text', () => {
  const { ariaSpy, root, host } = setup('callback');
  const formatted = percent(0.3);
  expect(ariaSpy).toHaveBeenCalledWith(formatted, 30);
  expect(root.getAttribute('aria-valuetext')).toBe(`30 of 100 (${formatted})`);
  expect(host.querySelector('[data-testid=value]')!.textContent).toBe(formatted);
});

it('Root:250 currency formatting clamps outputs and retains callback raw value', () => {
  const { ariaSpy, root, host } = setup('formatted-over');
  const expected = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
    100,
  );
  expect(host.querySelector('[data-testid=value]')!.textContent).toBe(expected);
  expect(root.getAttribute('aria-valuenow')).toBe('100');
  expect(ariaSpy).toHaveBeenLastCalledWith(expected, 150);
  expect(root.getAttribute('aria-valuetext')).toBe(`${expected} (raw: 150)`);
  expect((host.querySelector('[data-testid=indicator]') as HTMLElement).style.width).toBe('100%');
});

it('Value:47 direct child arguments are formatted and raw', () => {
  const { valueSpy } = setup('value-callback');
  expect(valueSpy.mock.lastCall?.[0]).toEqual(
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(30),
  );
  expect(valueSpy.mock.lastCall?.[1]).toEqual(30);
});

it('Value:65 direct child arguments refresh after a value change', () => {
  const { component, valueSpy } = setup('value-update');
  expect(valueSpy.mock.lastCall?.[0]).toEqual(percent(0.3));
  expect(valueSpy.mock.lastCall?.[1]).toEqual(30);
  component.update({ value: 60 });
  flushSync();
  expect(valueSpy.mock.lastCall?.[0]).toEqual(percent(0.6));
  expect(valueSpy.mock.lastCall?.[1]).toEqual(60);
});

it('Label:49 missing context throws the exact pinned descriptive error', () => {
  const target = document.createElement('div');
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect(() => mount(Meter.Label, { target })).toThrow(
      'Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.',
    );
  } finally {
    error.mockRestore();
  }
});

for (const [part, Component] of Object.entries({
  Label: Meter.Label,
  Indicator: Meter.Indicator,
  Value: Meter.Value,
}))
  it(`supplement ${part} requires Meter context`, () => {
    const target = document.createElement('div');
    expect(() => mount(Component, { target })).toThrow('MeterRootContext is missing');
  });

it('supplement Track remains context-free with native props and host teardown', async () => {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Meter.Track, {
    target,
    props: {
      id: 'standalone-track',
      role: 'group',
      class: ['consumer', { active: true }],
      'data-owner': 'native',
    },
  });
  flushSync();
  const track = target.querySelector('#standalone-track')!;
  expect(track.tagName).toBe('DIV');
  expect(track.getAttribute('role')).toBe('group');
  expect(track.className).toBe('consumer active');
  expect(track.getAttribute('data-owner')).toBe('native');
  await unmount(component);
  expect(track.isConnected).toBe(false);
});

it('labels register, change IDs and clean up', () => {
  const { component, root } = setup('labels');
  expect(root.getAttribute('aria-labelledby')).toBe('label-a');
  component.changeLabel('label-b');
  flushSync();
  expect(root.getAttribute('aria-labelledby')).toBe('label-b');
  component.removeLabel();
  flushSync();
  expect(root.hasAttribute('aria-labelledby')).toBe(false);
});

it('replacement refs follow actual hosts and clear on replacement/removal', () => {
  const { component, root, host } = setup('replacement');
  const old = component.refs();
  expect(old.every((node) => node?.tagName === 'SECTION')).toBe(true);
  expect(old[0]).toBe(root);
  for (const node of old) {
    expect(node?.getAttribute('data-render-frozen')).toBe('true');
    expect(node?.getAttribute('data-render-identity')).toBe('1');
  }
  expect(root.className).toContain('root-state-0-frozen-true');
  expect(root.style.opacity).toBe('0.5');
  expect(host.querySelector('[data-testid=value]')!.textContent).toBe(percent(0.4));
  expect(root.querySelector(':scope > span[role=presentation]')!.textContent).toBe('x');
  component.replaceHost();
  flushSync();
  expect(component.refs().every((node) => node?.tagName === 'ARTICLE')).toBe(true);
  expect(old.every((node) => !node?.isConnected)).toBe(true);
  component.remove();
  flushSync();
  expect(component.refs()).toEqual([null, null, null, null, null]);
});

it('format, locale and bounds refresh the same clamped value and percentage', () => {
  const { component, root, host } = setup('currency');
  component.update({
    min: 20,
    max: 40,
    value: 50,
    locale: 'de-DE',
    format: { style: 'currency', currency: 'EUR' },
  });
  flushSync();
  const text = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(40);
  expect(root.getAttribute('aria-valuemin')).toBe('20');
  expect(root.getAttribute('aria-valuemax')).toBe('40');
  expect(root.getAttribute('aria-valuenow')).toBe('40');
  expect(root.getAttribute('aria-valuetext')).toBe(text);
  expect(host.querySelector('[data-testid=value]')!.textContent).toBe(text);
  expect((host.querySelector('[data-testid=indicator]') as HTMLElement).style.width).toBe('100%');
});

it('nonfinite transitions retain raw callback arguments and pinned clamped outputs', () => {
  const { component, ariaSpy, valueSpy, root, host } = setup('replacement-callback');
  for (const [value, clamped, percentage] of [
    [NaN, 20, 0],
    [Infinity, 40, 100],
    [-Infinity, 20, 0],
    [30, 30, 50],
  ] as const) {
    component.update({ min: 20, max: 40, value });
    flushSync();
    const formatted = percent(percentage / 100);
    expect(valueSpy).toHaveBeenLastCalledWith(formatted, value);
    expect(root.getAttribute('aria-valuenow')).toBe(String(clamped));
    expect((host.querySelector('[data-testid=indicator]') as HTMLElement).style.width).toBe(
      `${percentage}%`,
    );
    expect(root.hasAttribute('data-indeterminate')).toBe(false);
  }
  // Root callback witness uses its own fixture mode so Value keeps default text.
  const callback = setup('callback', ariaSpy);
  for (const [value, clamped, percentage] of [
    [NaN, 20, 0],
    [Infinity, 40, 100],
    [-Infinity, 20, 0],
    [30, 30, 50],
  ] as const) {
    callback.component.update({ min: 20, max: 40, value });
    flushSync();
    const formatted = percent(percentage / 100);
    expect(ariaSpy).toHaveBeenLastCalledWith(formatted, value);
    expect(callback.root.getAttribute('aria-valuenow')).toBe(String(clamped));
    expect(callback.host.querySelector('[data-testid=value]')!.textContent).toBe(formatted);
  }
});

it('older label cleanup preserves the later association and nested Root owns its state', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Nested, { target: host });
  cleanups.push(() => unmount(component));
  flushSync();
  const outer = host.querySelector('#outer')!,
    inner = host.querySelector('#inner')!;
  expect(outer.getAttribute('aria-labelledby')).toBe('second');
  expect(inner.getAttribute('aria-labelledby')).toBe('inner-label');
  component.removeFirst();
  flushSync();
  expect(outer.getAttribute('aria-labelledby')).toBe('second');
  component.change();
  flushSync();
  expect(outer.getAttribute('aria-valuenow')).toBe('0');
  expect(inner.getAttribute('aria-valuenow')).toBe('100');
  expect(host.querySelector('#outer-value')!.textContent).toBe(percent(0));
  expect(host.querySelector('#inner-value')!.textContent).toBe(percent(1));
  component.generatedLabel();
  flushSync();
  const generated = host.querySelector('[data-testid=second-label]')!.id;
  expect(generated.startsWith('base-ui-')).toBe(true);
  expect(outer.getAttribute('aria-labelledby')).toBe(generated);
});
