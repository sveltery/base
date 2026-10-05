// Authored business regressions; no unchanged Original assertion credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ToastLabelOverlapFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
function setup(props: { sameId?: boolean; customRender?: boolean } = {}) {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target, props });
  mounted.push(component);
  flushSync();
  const root = target.querySelector<HTMLElement>('[data-testid="label-root"]')!;
  return { component, root, target };
}
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
});

for (const [part, attribute] of [
  ['title', 'aria-labelledby'],
  ['description', 'aria-describedby'],
] as const) {
  it(`${part}: removing the older same-ID label clears ARIA while the newer label remains`, () => {
    const { component, root, target } = setup();
    expect(root.getAttribute(attribute)).toBe(`shared-${part}`);
    component.setLabels({ newer: true });
    flushSync();
    expect(root.getAttribute(attribute)).toBe(`shared-${part}`);
    component.setLabels({ old: false });
    flushSync();
    expect(target.querySelector(`[data-testid="old-${part}"]`)).toBeNull();
    expect(target.querySelector(`[data-testid="new-${part}"]`)?.textContent).toBe('New label');
    expect(root.hasAttribute(attribute)).toBe(false);
    component.setLabels({ newContent: 'Changed visible text' });
    flushSync();
    expect(root.hasAttribute(attribute)).toBe(false);
    component.setLabels({ newContent: '' });
    flushSync();
    expect(target.querySelector(`[data-testid="new-${part}"]`)).toBeNull();
    component.setLabels({ newContent: 0 });
    flushSync();
    expect(target.querySelector(`[data-testid="new-${part}"]`)?.textContent).toBe('0');
    expect(root.getAttribute(attribute)).toBe(`shared-${part}`);
  });

  it(`${part}: distinct IDs protect a newer label and removal never restores an older registration`, () => {
    const { component, root } = setup({ sameId: false });
    component.setLabels({ newer: true });
    flushSync();
    expect(root.getAttribute(attribute)).toBe(`new-${part}`);
    component.setLabels({ old: false });
    flushSync();
    expect(root.getAttribute(attribute)).toBe(`new-${part}`);
    component.setLabels({ old: true });
    flushSync();
    expect(root.getAttribute(attribute)).toBe(`old-${part}`);
    component.setLabels({ old: false });
    flushSync();
    expect(root.hasAttribute(attribute)).toBe(false);
  });

  it(`${part}: registration follows an actual custom host appearing and disappearing`, () => {
    const { component, root, target } = setup({ customRender: true });
    expect(target.querySelector(`[data-testid="old-${part}"]`)).not.toBeNull();
    expect(root.getAttribute(attribute)).toBe(`shared-${part}`);
    component.setLabels({ rendered: false });
    flushSync();
    expect(target.querySelector(`[data-testid="old-${part}"]`)).toBeNull();
    expect(root.hasAttribute(attribute)).toBe(false);
    component.setLabels({ rendered: true });
    flushSync();
    expect(root.getAttribute(attribute)).toBe(`shared-${part}`);
    component.setLabels({ oldContent: false });
    flushSync();
    expect(target.querySelector(`[data-testid="old-${part}"]`)).toBeNull();
    expect(root.hasAttribute(attribute)).toBe(false);
    component.setLabels({ oldContent: null });
    flushSync();
    expect(target.querySelector(`[data-testid="old-${part}"]`)?.textContent).toBe(
      `Fallback ${part}`,
    );
    expect(root.getAttribute(attribute)).toBe(`shared-${part}`);
  });
}
