import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Separator from '../src/lib/separator/Separator.svelte';
import Fixture from '../../../apps/fixtures/src/lib/SeparatorFixture.svelte';
for (const orientation of [undefined, 'horizontal', 'vertical'] as const) it(`Separator SSR preserves explicit orientation (${orientation}) without browser globals`, () => {
  const { body } = render(Separator, { props: { orientation } });
  expect(body).toContain('<div'); expect(body).toContain('role="separator"');
  expect(body).toContain(`aria-orientation="${orientation ?? 'horizontal'}"`); expect(body).toContain(`data-orientation="${orientation ?? 'horizontal'}"`);
});
for (const scenario of ['default', 'reactive', 'lifecycle', 'override', 'render-override', 'render-function', 'render-class-resolved', 'class-value']) it(`Separator fixture SSR (${scenario})`, () => {
  const { body } = render(Fixture, { props: { scenario } }); expect(body).toContain('data-hydrated="false"'); expect(body).toContain('id="tested-separator"');
  if (scenario === 'lifecycle') expect(body).toContain('<section');
  if (scenario.includes('override')) { expect(body).toContain('role="presentation"'); expect(body).toContain('aria-orientation="vertical"'); }
});
