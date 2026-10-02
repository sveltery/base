// Supplemental fixture reactivity regression; no upstream declaration credit.
import { expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ToastDeclarationFixture.svelte';
it('fixture description/action guards follow scenario changes for an existing toast', async () => {
  const target = document.createElement('main'); document.body.append(target);
  const app = mount(Fixture, { target });
  try {
    flushSync();
    const add = Array.from(target.querySelectorAll('button')).find(button => button.textContent === 'add');
    expect(add).toBeDefined(); add!.click(); flushSync();
    const part = (id: string) => target.querySelector(`[data-testid="${id}"]`);
    const parts = () => ['title', 'description', 'action', 'close'].map(id => target.querySelectorAll(`[data-testid="${id}"]`).length);
    const root = part('root');
    expect(root).not.toBeNull();
    expect(parts()).toEqual([1, 1, 1, 1]);
    expect(part('description')?.textContent).toBe('description');
    expect(part('action')?.textContent).toBe('action');
    for (const scenario of ['close', 'close-all']) {
      app.setScenario(scenario); flushSync();
      expect(parts()).toEqual([1, 0, 0, 0]);
      expect(part('root')).toBe(root);
      expect(root?.hasAttribute('aria-describedby')).toBe(false);
      app.setScenario('basic-parts'); flushSync();
      expect(parts()).toEqual([1, 1, 1, 1]);
      expect(part('root')).toBe(root);
      expect(root?.getAttribute('aria-describedby')).toBe(part('description')?.id);
    }
    app.setScenario('limit'); flushSync();
    expect(parts()).toEqual([0, 0, 0, 0]);
    expect(part('root')).toBeNull();
    expect(part('test')).toBe(root);
    expect(part('close-test')).not.toBeNull();
    app.setScenario('basic-parts'); flushSync();
    expect(parts()).toEqual([1, 1, 1, 1]);
    expect(part('root')).toBe(root);
  } finally {
    await unmount(app); target.remove();
  }
});
