// Separate helper DOM companions. Source bodies/guards: parity/input/conformance.json, MIT.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputConformanceFixture.svelte';
import { mountInputReference } from '../../../../apps/fixtures/src/lib/input-reference.js';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
for (const reference of [true, false]) for (const scenario of ['props-default', 'props-function', 'props-element', 'props-style', 'props-style-function', 'props-style-element', 'ref', 'render-function', 'render-element', 'render-empty-element', 'render-ref', 'render-merge-ref', 'render-class', 'render-class-resolved', 'class']) {
  it(`${reference ? 'React' : 'Svelte'} helper DOM companion ${scenario}`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    if (reference) { cleanups.push(mountInputReference(target, `conformance-${scenario}`)); await new Promise(resolve => setTimeout(resolve, 25)); }
    else { const component = mount(Fixture, { target, props: { scenario: `conformance-${scenario}` } }); cleanups.push(() => unmount(component)); await tick(); }
    if (['props-default', 'props-function', 'props-element'].includes(scenario)) {
      const root = target.querySelector(`[data-testid=${scenario === 'props-default' ? 'root' : 'custom-root'}]`)!;
      expect(root.getAttribute('lang')).toBe('fr'); expect(root.getAttribute('data-foobar')).toBe('source-value');
    } else if (scenario.includes('style')) {
      const root = target.querySelector('[data-testid=custom-root]')!; expect(root.hasAttribute('style')).toBe(true); expect(root.getAttribute('style')).toContain('color: green');
    } else if (scenario === 'ref') {
      expect(JSON.parse(target.querySelector('[data-testid=refs]')!.textContent!).instanceofInput).toBe(true);
    } else if (scenario.includes('class')) {
      const root = target.querySelector(scenario === 'class' ? '.test-class' : '[data-testid=test-component]'); expect(root).not.toBeNull();
      if (scenario !== 'class') { expect(root!.classList.contains(scenario.endsWith('resolved') ? 'conditional-component-classname' : 'component-classname')).toBe(true); expect(root!.classList.contains('render-prop-classname')).toBe(true); }
    } else {
      expect(target.querySelector('[data-testid=base-ui-wrapper]')).not.toBeNull();
      if (scenario !== 'render-empty-element') { const root = target.querySelector('[data-testid=wrapped]'); expect(root).not.toBeNull(); expect(root!.getAttribute('data-test-value')).toBe('source-value'); }
      if (scenario === 'render-ref' || scenario === 'render-merge-ref') {
        const refs = JSON.parse(target.querySelector('[data-testid=refs]')!.textContent!); expect(refs.tag).toBe('DIV'); expect(refs.testid).toBe('wrapped');
        if (scenario === 'render-merge-ref') { expect(refs.present).toBe(true); expect(refs.renderPresent).toBe(true); expect(refs.renderTag).toBe('DIV'); expect(refs.renderTestid).toBe('wrapped'); }
      }
    }
  });
}
