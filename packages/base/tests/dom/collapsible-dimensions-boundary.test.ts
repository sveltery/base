// Source/bare-Svelte/candidate render-style diagnostic; zero ordinary credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { mountSourceRenderDimensionsBoundary } from '../../../../apps/fixtures/src/lib/CollapsibleSourceBoundaryReference.js';
import RenderDimensionsBoundary from './collapsible/RenderDimensionsBoundary.svelte';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanups.splice(0)) await dispose();
  document.body.replaceChildren();
});
it('diagnostic: opaque render consumers override the supplied height variable', async () => {
  const observations: Record<string, string> = {};
  for (const framework of ['Original', 'bare Svelte', 'Collapsible'] as const) {
    const target = document.createElement('section');
    document.body.append(target);
    if (framework === 'Original') cleanups.push(mountSourceRenderDimensionsBoundary(target));
    else {
      const component = mount(RenderDimensionsBoundary, {
        target,
        props: { bare: framework === 'bare Svelte' },
      });
      cleanups.push(() => unmount(component));
    }
    await tick();
    observations[framework] = (
      target.querySelector('[data-testid="dimension-boundary"]') as HTMLElement
    ).style.getPropertyValue('--collapsible-panel-height');
    await cleanups.pop()!();
    target.remove();
  }
  console.log(JSON.stringify({ scenario: 'render-dimension-override', observations }));
  // The native successor now retains opaque snippet style ownership.
  // The failed first-attachment observation remains archived; zero ordinary credit.
  expect(observations).toEqual({ Original: '73px', 'bare Svelte': '73px', Collapsible: '73px' });
});
