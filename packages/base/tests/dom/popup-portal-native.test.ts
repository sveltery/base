// Native shared-host/context/ref witnesses, zero Original declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import Fixture from './PopupPortalBoundaryFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
function setup(props: ComponentProps<typeof Fixture> = {}) {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(Fixture, { target, props });
  mounted.push(app);
  flushSync();
  return app;
}
async function settle() {
  flushSync();
  await tick();
  await Promise.resolve();
  flushSync();
}
function destination() {
  const node = document.createElement('section');
  document.body.append(node);
  return node;
}
function host(root: ParentNode = document) {
  return root.querySelector<HTMLElement>('[data-testid="boundary-portal"]');
}

for (const lite of [false, true]) {
  it(`${lite ? 'Lite' : 'Full'} forwards native HTML/class/style and callback ref cleanup to the actual host`, async () => {
    const ref = vi.fn((node: HTMLElement | null) => (node ? () => {} : undefined));
    const cleanup = vi.fn();
    ref.mockImplementation((node) => (node ? cleanup : undefined));
    const app = setup({ lite, forwardedRef: ref });
    const node = host()!;
    expect(node.parentNode).toBe(document.body);
    expect(node.hasAttribute('data-base-ui-portal')).toBe(true);
    expect(node.className).toBe('portal native');
    expect(node.style.getPropertyValue('--host-color')).toBe('red');
    expect(ref).toHaveBeenCalledWith(node);
    expect(node.querySelector('[data-testid="portal-child"]')).not.toBeNull();
    mounted.splice(mounted.indexOf(app), 1);
    await unmount(app);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(node.isConnected).toBe(false);
  });

  it(`${lite ? 'Lite' : 'Full'} waits for explicit null, resolves null-current refs, and remounts on identity replacement`, async () => {
    const one = destination();
    const two = destination();
    const app = setup({ lite, container: null });
    expect(host()).toBeNull();
    app.setContainer({ current: null });
    await settle();
    const initial = host()!;
    expect(initial.parentNode).toBe(document.body);
    app.setContainer({ current: one });
    await settle();
    const moved = host(one)!;
    expect(moved).not.toBe(initial);
    expect(initial.isConnected).toBe(false);
    app.setContainer({ current: two });
    await settle();
    const replaced = host(two)!;
    expect(replaced).not.toBe(moved);
    expect(moved.isConnected).toBe(false);
    app.setContainer(undefined);
    await settle();
    const restored = host()!;
    expect(restored.parentNode).toBe(document.body);
    app.setContainer(null);
    await settle();
    expect(restored.isConnected).toBe(false);
    expect(host()).toBeNull();
  });

  it(`${lite ? 'Lite' : 'Full'} retains the Source container-identity dependency when only current mutates`, async () => {
    const one = destination();
    const two = destination();
    const ref = { current: one };
    const app = setup({ lite, container: ref });
    const initial = host(one)!;
    app.mutateContainerCurrent(two);
    await settle();
    expect(host(one)).toBe(initial);
    expect(host(two)).toBeNull();
    app.setContainer({ current: two });
    await settle();
    expect(host(two)).not.toBeNull();
    expect(initial.isConnected).toBe(false);
  });

  it(`${lite ? 'Lite' : 'Full'} mounts and releases content in a ShadowRoot`, async () => {
    const shadow = destination().attachShadow({ mode: 'open' });
    const app = setup({ lite, container: shadow });
    const node = host(shadow)!;
    expect(node.parentNode).toBe(shadow);
    expect(node.querySelector('[data-testid="portal-child"]')).not.toBeNull();
    mounted.splice(mounted.indexOf(app), 1);
    await unmount(app);
    expect(shadow.children.length).toBe(0);
  });

  it(`${lite ? 'Lite' : 'Full'} replaces the forwarded ref without remounting the host`, async () => {
    const first = { current: null as HTMLElement | null };
    const second = { current: null as HTMLElement | null };
    const app = setup({ lite, forwardedRef: first });
    const initial = host()!;
    expect(first.current).toBe(initial);
    app.setRef(second);
    await settle();
    expect(first.current).toBeNull();
    expect(second.current).toBe(initial);
    expect(host()).toBe(initial);
  });
}

it('Full host custom render inherits the parent context while child content gets the new provider', async () => {
  const app = setup({ customHost: true, focus: true });
  const node = host()!;
  expect(node.tagName).toBe('SECTION');
  expect(node.id).toBe('custom-portal');
  expect(app.readContext('host')).toBeNull();
  const context = app.readContext('child')!;
  expect(context.portalNode).toBe(node);
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns')).toBe('custom-portal');
  app.setCustomId('replacement-id');
  await settle();
  expect(context.portalNode).toBe(node);
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns')).toBe('replacement-id');
});

it('Lite custom render and child content preserve inherited context without installing a provider', () => {
  const app = setup({ lite: true, customHost: true });
  expect(app.readContext('host')).toBeNull();
  expect(app.readContext('child')).toBeNull();
  expect(document.querySelector('[aria-owns]')).toBeNull();
  expect(document.querySelector('[data-type="outside"]')).toBeNull();
});

for (const lite of [false, true])
  it(`${lite ? 'Lite' : 'Full'} mounts child content into a replaced actual render host and releases the previous ref`, async () => {
    const ref = { current: null as HTMLElement | null };
    const app = setup({ lite, customHost: true, forwardedRef: ref });
    const previous = host()!;
    expect(previous.tagName).toBe('SECTION');
    app.setHostTag('article');
    await settle();
    const next = host()!;
    expect(next.tagName).toBe('ARTICLE');
    expect(next).not.toBe(previous);
    expect(previous.isConnected).toBe(false);
    expect(ref.current).toBe(next);
    expect(next.querySelector('[data-testid="portal-child"]')).not.toBeNull();
    expect(app.readContext('host')).toBeNull();
    if (!lite) expect(app.readContext('child')?.portalNode).toBe(next);
  });

it('Full removes aria-owns when the actual custom host ID is removed', async () => {
  setup({ customHost: true, focus: true });
  const node = host()!;
  expect(document.querySelector('[aria-owns]')?.getAttribute('aria-owns')).toBe('custom-portal');
  node.removeAttribute('id');
  await settle();
  expect(document.querySelector('[aria-owns]')).toBeNull();
  expect(node.isConnected).toBe(true);
});

it('whole Full unmount clears retained live context and ref before a fresh independent remount', async () => {
  const warning = vi.spyOn(console, 'warn');
  const ref = { current: null as HTMLElement | null };
  const first = setup({ customHost: true, forwardedRef: ref });
  const previous = host()!;
  const retainedContext = first.readContext('child')!;
  expect(retainedContext.portalNode).toBe(previous);
  mounted.splice(mounted.indexOf(first), 1);
  await unmount(first);
  expect(ref.current).toBeNull();
  expect(previous.isConnected).toBe(false);
  expect(retainedContext.portalNode).toBeNull();
  const second = setup({ customHost: true, forwardedRef: ref });
  const next = host()!;
  expect(next).not.toBe(previous);
  expect(ref.current).toBe(next);
  expect(second.readContext('child')).not.toBe(retainedContext);
  expect(second.readContext('child')?.portalNode).toBe(next);
  expect(retainedContext.portalNode).toBeNull();
  expect(warning).not.toHaveBeenCalled();
});

for (const outerLite of [false, true])
  for (const nested of ['full', 'lite'] as const) {
    it(`${outerLite ? 'Lite' : 'Full'} / ${nested} nesting uses the actual nearest Source portal provider`, () => {
      const root = destination();
      const app = setup({ lite: outerLite, nested, container: root });
      const outer = host(root)!;
      const inner = document.querySelector('[data-testid="nested-portal"]')!;
      expect(inner.parentNode).toBe(outerLite ? document.body : outer);
      const outerContext = app.readContext('child');
      const innerContext = app.readContext('nested-child');
      if (nested === 'full') {
        expect(innerContext?.portalNode).toBe(inner);
        expect(innerContext).not.toBe(outerContext);
      } else expect(innerContext).toBe(outerContext);
      if (outerLite) expect(outerContext).toBeNull();
      else expect(outerContext?.portalNode).toBe(outer);
    });
  }
