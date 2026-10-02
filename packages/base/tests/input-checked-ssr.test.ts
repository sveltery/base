// Supplemental standalone checkable SSR; no ordinary pinned Input credit.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/InputCheckedFixture.svelte';
for (const [scenario, checked] of [['checkbox-reject-on', true], ['checkbox-reject-off', false], ['checkbox-default-reject-off', false], ['checkbox-default-off-reject-on', true], ['checkbox-uncontrolled-default-on', true], ['radio-reject-off', false]] as const) it(`checked SSR keeps source initial selection without browser globals (${scenario})`, () => {
  const { body } = render(Fixture, { props: { scenario } });
  const input = body.match(/<input\b[^>]*data-testid="input"[^>]*>/)?.[0];
  expect(input).toBeDefined(); expect(/\schecked(?:\s|>|=)/.test(input!)).toBe(checked);
  expect(body).toContain('data-hydrated="false"');
});
