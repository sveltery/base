import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/RegressionFixture.svelte';
// SSR runs without window/document/HTMLElement/ShadowRoot globals; portals render only after mount.
for (const scenario of ['shadow-entry', 'shadow-initial', 'shadow-keep', 'disabled', 'cancel', 'controlled']) it(`review regression fixture is SSR-safe (${scenario})`, () => {
  const { body } = render(Fixture, { props: { scenario } });
  expect(body).toContain('data-hydrated="false"');
  expect(body).not.toContain('role="dialog"');
  expect(body).not.toContain('data-base-ui-focus-guard');
});
