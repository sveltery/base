// Supplemental fidelity regressions against Base UI v1.8.0; no declaration credit.
import { expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './DialogPortalContainerFixture.svelte';
for (const scenario of ['undefined', 'null', 'null-ref', 'element', 'element-current', 'ref-owner-document', 'shadow', 'iframe'] as const) {
  it(`Dialog.Portal resolves ${scenario} without confusing native nodes and ref objects`, async () => {
    const target = document.createElement('main'); const destination = document.createElement('section'); document.body.append(target, destination);
    const shadow = destination.attachShadow({mode: 'open'});
    const iframe = document.createElement('iframe'); document.body.append(iframe);
    const foreign = iframe.contentDocument!.createElement('section'); iframe.contentDocument!.body.append(foreign);
    if (scenario === 'element-current') Object.assign(destination, {current: null});
    const container = scenario === 'undefined' ? undefined : scenario === 'null' ? null : scenario === 'null-ref' ? {current: null} : scenario === 'ref-owner-document' ? {current: destination, ownerDocument: undefined} : scenario === 'shadow' ? shadow : scenario === 'iframe' ? foreign : destination;
    const app = mount(Fixture, {target, props: {container}}); flushSync();
    const expected = scenario === 'null' ? null : scenario === 'shadow' ? shadow : scenario === 'iframe' ? foreign : scenario === 'undefined' || scenario === 'null-ref' ? document.body : destination;
    const node = document.querySelector('[data-testid="container-portal"]') ?? shadow.querySelector('[data-testid="container-portal"]') ?? foreign.querySelector('[data-testid="container-portal"]');
    expect(node?.parentNode ?? null).toBe(expected);
    await unmount(app); expect(node?.isConnected ?? false).toBe(false); target.remove(); destination.remove(); iframe.remove();
  });
}

it('a nested empty ref uses the inherited Portal node', async () => {
  const target = document.createElement('main'); const destination = document.createElement('section'); document.body.append(target, destination);
  const app = mount(Fixture, {target, props: {container: {current: null}, nested: true, outerContainer: destination}}); flushSync();
  const outer = destination.querySelector('[data-testid="outer-portal"]'); const inner = destination.querySelector('[data-testid="container-portal"]');
  expect(outer?.parentNode).toBe(destination); expect(inner?.parentNode).toBe(outer);
  await unmount(app); expect(destination.children.length).toBe(0); target.remove(); destination.remove();
});
it('changing explicit null to an empty ref restores fallback and can retarget the same node', async () => {
  const target = document.createElement('main'); const destination = document.createElement('section'); document.body.append(target, destination);
  const app = mount(Fixture, {target, props: {container: null}}); flushSync();
  expect(document.querySelector('[data-testid="container-portal"]')).toBeNull();
  app.setContainer({current: null}); flushSync();
  const node = document.querySelector('[data-testid="container-portal"]'); expect(node?.parentNode).toBe(document.body);
  app.setContainer(destination); flushSync(); expect(node?.parentNode).toBe(destination);
  app.setContainer(undefined); flushSync(); expect(node?.parentNode).toBe(document.body);
  app.setContainer(null); flushSync(); expect(node?.isConnected).toBe(false);
  await unmount(app); target.remove(); destination.remove();
});
