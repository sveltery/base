// Supplemental fidelity regressions against Base UI v1.8.0; no declaration credit.
import { expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './DialogPortalContainerFixture.svelte';
import { mountMutablePortalContainerReference } from '../../../../apps/fixtures/src/lib/dialog-portal-container-reference.js';
for (const scenario of [
  'undefined',
  'null',
  'null-ref',
  'element',
  'element-current',
  'ref-owner-document',
  'shadow',
  'iframe',
] as const) {
  it(`Dialog.Portal resolves ${scenario} without confusing native nodes and ref objects`, async () => {
    const target = document.createElement('main');
    const destination = document.createElement('section');
    document.body.append(target, destination);
    const shadow = destination.attachShadow({ mode: 'open' });
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const foreign = iframe.contentDocument!.createElement('section');
    iframe.contentDocument!.body.append(foreign);
    if (scenario === 'element-current') Object.assign(destination, { current: null });
    const container =
      scenario === 'undefined'
        ? undefined
        : scenario === 'null'
          ? null
          : scenario === 'null-ref'
            ? { current: null }
            : scenario === 'ref-owner-document'
              ? { current: destination, ownerDocument: undefined }
              : scenario === 'shadow'
                ? shadow
                : scenario === 'iframe'
                  ? foreign
                  : destination;
    const app = mount(Fixture, { target, props: { container } });
    flushSync();
    const expected =
      scenario === 'null'
        ? null
        : scenario === 'shadow'
          ? shadow
          : scenario === 'iframe'
            ? foreign
            : scenario === 'undefined' || scenario === 'null-ref'
              ? document.body
              : destination;
    const node =
      document.querySelector('[data-testid="container-portal"]') ??
      shadow.querySelector('[data-testid="container-portal"]') ??
      foreign.querySelector('[data-testid="container-portal"]');
    expect(node?.parentNode ?? null).toBe(expected);
    await unmount(app);
    expect(node?.isConnected ?? false).toBe(false);
    target.remove();
    destination.remove();
    iframe.remove();
  });
}

it('a nested empty ref uses the inherited Portal node', async () => {
  const target = document.createElement('main');
  const destination = document.createElement('section');
  document.body.append(target, destination);
  const app = mount(Fixture, {
    target,
    props: { container: { current: null }, nested: true, outerContainer: destination },
  });
  flushSync();
  const outer = destination.querySelector('[data-testid="outer-portal"]');
  const inner = destination.querySelector('[data-testid="container-portal"]');
  expect(outer?.parentNode).toBe(destination);
  expect(inner?.parentNode).toBe(outer);
  await unmount(app);
  expect(destination.children.length).toBe(0);
  target.remove();
  destination.remove();
});
for (const reference of [true, false])
  it(`${reference ? 'React reference' : 'Svelte'}: container identity changes remount the host and explicit null pauses rendering`, async () => {
    const target = document.createElement('main');
    const destination = document.createElement('section');
    document.body.append(target, destination);
    const app = reference
      ? mountMutablePortalContainerReference(target)
      : mount(Fixture, { target, props: { container: null } });
    async function settle() {
      flushSync();
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    await settle();
    expect(document.querySelector('[data-testid="container-portal"]')).toBeNull();
    app.setContainer({ current: null });
    await settle();
    const node = document.querySelector('[data-testid="container-portal"]');
    expect(node?.parentNode).toBe(document.body);
    app.setContainer(destination);
    await settle();
    const moved = destination.querySelector('[data-testid="container-portal"]');
    expect(moved).not.toBeNull();
    expect(moved).not.toBe(node);
    expect(node?.isConnected).toBe(false);
    app.setContainer(undefined);
    await settle();
    const restored = document.querySelector('[data-testid="container-portal"]');
    expect(restored?.parentNode).toBe(document.body);
    expect(restored).not.toBe(moved);
    expect(moved?.isConnected).toBe(false);
    app.setContainer(null);
    await settle();
    expect(restored?.isConnected).toBe(false);
    if ('stop' in app) app.stop();
    else await unmount(app);
    target.remove();
    destination.remove();
  });
