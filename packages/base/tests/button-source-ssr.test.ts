import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/ButtonSourceFixture.svelte';
for (const scenario of ['composite-custom', 'composite-native', 'composite-link', 'nested-custom', 'nested-disabled', 'override-disabled', 'composite-submit', 'composite-reset']) it(`public Button source composition SSR has actual host/state without browser access (${scenario})`, () => {
  const { body } = render(Fixture, { props: { scenario } });
  expect(body).toContain('id="source-button"'); expect(body).toContain('data-hydrated="false"'); expect(body).toContain('source-class'); expect(body).not.toContain('data-consumer-attached');
  if (scenario === 'nested-disabled' || scenario === 'override-disabled') expect(body).toContain('aria-disabled="true"');
  if (scenario === 'composite-link') expect(body).toContain('href="#source-target"');
});
