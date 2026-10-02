// Supplemental SSR gates. Meter assertion provenance: parity/meter/UPSTREAM_LICENSE.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/MeterFixture.svelte';
import { Meter } from '../src/lib/meter/index.js';

it('SSR omits the layout-registered label relationship and preserves hidden presentation x', () => {
  const { body } = render(Fixture, { props: { scenario: 'labels' } });
  expect(body).toContain('id="label-a"');
  expect(body).not.toContain('aria-labelledby');
  expect(body).toContain('role="presentation" style="clip-path:inset(50%)');
  expect(body).toContain('>x</span>');
  expect(body).toContain('role="meter"');
});

for (const scenario of ['default', 'update', 'custom', 'over', 'under', 'equal', 'nan', 'infinity', 'negative', 'currency', 'locale', 'value-callback', 'replacement', 'replacement-callback']) it(`SSR Meter fixture ${scenario}`, () => {
  const { body } = render(Fixture, { props: { scenario } });
  expect(body).toContain('data-hydrated="false"');
  expect(body).toContain('id="tested-meter"');
  expect(body).toContain('>x</span>');
  expect(body).toContain('aria-valuenow=');
  expect(body).not.toContain('data-indeterminate');
  if (scenario === 'nan') { expect(body).toContain('aria-valuenow="0"'); expect(body).toContain('width:0%'); }
  if (scenario === 'replacement') expect(body).toContain('<section');
});

for (const Component of [Meter.Label, Meter.Indicator, Meter.Value]) it('SSR missing Meter context rejects without browser globals', () => {
  expect(() => render(Component).body).toThrow('Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.');
});

it('SSR Meter.Track is a context-free div as in the exact pin', () => {
  const { body } = render(Meter.Track, { props: { id: 'standalone-track', 'data-owner': 'consumer' } });
  expect(body).toContain('<div');
  expect(body).toContain('id="standalone-track"');
  expect(body).toContain('data-owner="consumer"');
});
