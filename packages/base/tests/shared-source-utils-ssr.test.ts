import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './dom/SharedSourceUtilsFixture.svelte';

it('retains native setup callback availability without client effects or timers during SSR', () => {
  const events: string[] = [];
  const result = render(Fixture, { props: { initialDefault: 'seed', events } });
  expect(result.body).toContain('seed');
  expect(events).toEqual(['parent-setup:old', 'child-setup:old']);
});
