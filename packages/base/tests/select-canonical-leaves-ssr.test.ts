import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import ListboxSeparator from '../src/lib/utils/listbox-separator/ListboxSeparator.svelte';
import Fixture from './dom/SelectCanonicalLeavesFixture.svelte';

it('renders the internal default and explicit orientation without browser globals', () => {
  expect(typeof document).toBe('undefined');
  for (const orientation of [undefined, 'horizontal', 'vertical'] as const) {
    const { body } = render(ListboxSeparator, { props: { orientation } });
    expect(body).toContain('<div');
    expect(body).toContain('role="presentation"');
    expect(body).toContain(`data-orientation="${orientation ?? 'horizontal'}"`);
    expect(body).not.toContain('aria-orientation');
  }
});

it('SSR renders native Snippet/scalar labels and the replacement state/children', () => {
  const { body } = render(Fixture, { props: { custom: true } });
  expect(body).toContain('<section');
  expect(body).toContain('role="presentation"');
  expect(body).toContain('data-render-state="horizontal"');
  expect(body).toContain('Child');
  expect(body).toContain('<strong data-testid="snippet-label">Authored</strong>');
  expect(body).toMatch(/false.*0.*2/);
  expect(body).not.toContain('[object Object]');
});
