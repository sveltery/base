import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/ProgressFixture.svelte';
import { Progress } from '../src/lib/progress/index.js';
it('SSR omits the layout-registered label relationship and preserves hidden presentation x', () => {
  const { body } = render(Fixture, { props: { scenario: 'labels' } });
  expect(body).toContain('id="label-a"'); expect(body).not.toContain('aria-labelledby'); expect(body).toContain('role="presentation" style="clip-path:inset(50%)'); expect(body).toContain('>x</span>'); expect(body).toContain('aria-valuenow="40"');
});
for (const scenario of ['default', 'cycle', 'custom', 'over', 'under', 'equal', 'nan', 'infinity', 'negative', 'currency', 'locale', 'value-null', 'value-nan', 'replacement', 'replacement-callback']) it(`SSR Progress fixture ${scenario}`, () => {
  const { body } = render(Fixture, { props: { scenario } }); expect(body).toContain('data-hydrated="false"'); expect(body).toContain('id="tested-progress"'); expect(body).toContain('>x</span>');
  if (['cycle', 'nan', 'infinity', 'negative'].includes(scenario)) { expect(body).toContain('data-indeterminate'); expect(body).not.toContain('aria-valuenow='); }
  if (scenario === 'replacement') { expect(body).toContain('<section'); expect(body).toContain('40%'); }
  if (scenario.startsWith('value-')) expect(body).toContain('indeterminate|');
});
for (const Component of [Progress.Label, Progress.Track, Progress.Indicator, Progress.Value]) it('SSR missing Progress context rejects without browser globals', () => { expect(() => render(Component).body).toThrow('ProgressRootContext is missing'); });
