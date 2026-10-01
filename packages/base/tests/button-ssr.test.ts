import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/ButtonFixture.svelte';
for (const scenario of ['default', 'submit', 'reset', 'custom', 'native-disabled', 'custom-disabled', 'native-focusable']) it(`Button SSR is safe without browser globals (${scenario})`, () => {
  const { body } = render(Fixture, { props: { scenario } });
  expect(body).toContain('id="tested-button"'); expect(body).toContain('data-hydrated="false"');
  if (scenario === 'custom') { expect(body).toContain('<span'); expect(body).toContain('role="button"'); }
  if (scenario === 'native-disabled') expect(body).toMatch(/<button[^>]* disabled/);
  if (scenario.endsWith('focusable') || scenario === 'custom-disabled') expect(body).toContain('aria-disabled="true"');
});
