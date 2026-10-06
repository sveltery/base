import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '../../../apps/fixtures/src/lib/InputFixture.svelte';
for (const scenario of [
  'default',
  'generated',
  'disabled',
  'controlled-reject',
  'controlled-default',
  'required',
])
  it(`Input SSR runs without browser globals (${scenario})`, () => {
    const { body } = render(Fixture, { props: { scenario } });
    expect(body).toContain('data-hydrated="false"');
    expect(body).toContain('<input');
    if (scenario === 'generated') {
      const ids = [...body.matchAll(/<input\b[^>]*\sid="([^"]+)"/g)].map((match) => match[1]);
      expect(ids).toHaveLength(3);
      expect(new Set(ids).size).toBe(3);
      for (const id of ids) expect(id).toMatch(/^base-ui-/);
    } else expect(body).toContain('id="tested-input"');
    if (scenario === 'disabled') expect(body).toContain('data-disabled=""');
    expect(body).not.toContain('data-invalid=');
  });
