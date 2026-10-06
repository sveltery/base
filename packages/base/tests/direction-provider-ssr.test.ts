// Supplemental SSR gates; zero ordinary credit. MIT: parity/direction-provider/UPSTREAM_LICENSE.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/DirectionProviderFixture.svelte';
import { DirectionProvider } from '@sveltery/base/direction-provider';

it('SSR outside/default/configured providers require no browser globals', () => {
  for (const [scenario, direction] of [
    ['outside', 'ltr'],
    ['default', 'ltr'],
    ['configured', 'rtl'],
  ]) {
    const { body } = render(Fixture, { props: { scenario } });
    expect(body).toContain(`data-testid="direction">${direction}</span>`);
    expect(body).toContain('data-hydrated="false"');
    expect(body).not.toContain(' dir=');
  }
});
it('SSR nesting isolates context and separate requests retain their own direction', () => {
  const { body } = render(Fixture, { props: { scenario: 'nested' } });
  for (const [id, direction] of [
    ['outer-before', 'rtl'],
    ['inner', 'ltr'],
    ['outer-after', 'rtl'],
    ['outside', 'ltr'],
  ])
    expect(body).toContain(`data-testid="${id}">${direction}</span>`);
  expect(render(Fixture, { props: { scenario: 'outside' } }).body).toContain(
    'data-testid="direction">ltr</span>',
  );
  expect(render(Fixture, { props: { scenario: 'configured' } }).body).toContain(
    'data-testid="direction">rtl</span>',
  );
});
it('SSR an empty provider produces no element', () => {
  expect(render(DirectionProvider).body.replace(/<!--.*?-->/g, '')).toBe('');
});
