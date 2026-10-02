// Native Svelte ClassValue adaptation supplements, not upstream conformance declarations.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputConformanceFixture.svelte';
import { mountInputReference } from '../../../../apps/fixtures/src/lib/input-reference.js';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
for (const reference of [true, false]) for (const kind of ['object', 'array', 'object-callback', 'array-callback']) {
  it(`${reference ? 'React string comparator' : 'Svelte ClassValue'} replacement render ${kind}`, async () => {
    const target = document.createElement('section'); document.body.append(target); const scenario = `conformance-render-class-${kind}`;
    if (reference) { cleanups.push(mountInputReference(target, scenario)); await new Promise(resolve => setTimeout(resolve, 25)); }
    else { const component = mount(Fixture, { target, props: { scenario } }); cleanups.push(() => unmount(component)); await tick(); }
    const node = target.querySelector<HTMLElement>('[data-testid=test-component]')!;
    const initial = ['render-prop-classname', 'object-class', ...(kind.includes('array') ? ['nested-class'] : []), kind.includes('callback') ? 'enabled-class' : 'component-classname'];
    expect([...node.classList].sort()).toEqual(initial.sort()); expect(node.className).not.toContain('[object');
    if (kind.includes('callback')) {
      target.querySelector<HTMLButtonElement>('button')!.click(); if (reference) await new Promise(resolve => setTimeout(resolve, 25)); else await tick();
      expect(target.querySelector('[data-testid=test-component]')).toBe(node); expect(node.classList.contains('disabled-class')).toBe(true); expect(node.classList.contains('enabled-class')).toBe(false);
      expect(node.classList.contains('render-prop-classname')).toBe(true); expect(node.classList.contains('object-class')).toBe(true);
      if (kind.includes('array')) expect(node.classList.contains('nested-class')).toBe(true);
    }
  });
}
