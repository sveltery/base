import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ToastPortalFixture.svelte';
import BrowserFixture from '../../../../apps/fixtures/src/lib/ToastPortalFixture.svelte';
import type { ToastPortalProps } from '../../src/lib/toast/types.js';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup(
  initial?: ToastPortalProps['container'],
  custom = false,
  attached?: (node: HTMLElement) => (() => void) | void,
  initialRef: HTMLElement | null | undefined = null,
) {
  const host = document.createElement('main');
  document.body.append(host);
  const component = mount(Fixture, {
    target: host,
    props: { initial, custom, attached, initialRef },
  });
  cleanups.push(() => unmount(component));
  flushSync();
  return { host, component };
}
function portal() {
  return document.querySelector<HTMLElement>('[data-testid="portal"]')!;
}
it('explicit null waits; a null ref falls back to body without a Provider or Dialog Root', () => {
  const { component } = setup(null);
  expect(portal()).toBeNull();
  component.setContainer({ current: null });
  flushSync();
  expect(portal().parentNode).toBe(document.body);
});
it('target replacement remounts the node, updates props/children, and null removes it', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  document.body.append(first, second);
  const { component } = setup(first);
  const old = portal();
  expect(old.parentNode).toBe(first);
  component.setContainer({ current: first });
  flushSync();
  expect(portal()).toBe(old);
  component.setContainer(second);
  flushSync();
  expect(portal()).not.toBe(old);
  expect(old.isConnected).toBe(false);
  expect(portal().parentNode).toBe(second);
  component.setId('changed');
  component.setLabel('Updated');
  flushSync();
  expect(portal().id).toBe('changed');
  expect(portal().textContent).toBe('Updated');
  component.setContainer(null);
  flushSync();
  expect(portal()).toBeNull();
  expect(component.getRefs()[0]).toBeNull();
});
it('a same-object ref mutation does not move the node; a replacement ref resolves its target', () => {
  const destination = document.createElement('div');
  document.body.append(destination);
  const object = { current: null as HTMLElement | null };
  const { component } = setup(object);
  object.current = destination;
  component.setLabel('Updated');
  flushSync();
  expect(portal().parentNode).toBe(document.body);
  component.setContainer({ current: destination });
  flushSync();
  expect(portal().parentNode).toBe(destination);
});
it('keeps the whole replacement wrapper in its destination and composes actual refs/attachments', () => {
  const cleanup = vi.fn();
  const attachment = vi.fn(() => cleanup);
  const { host, component } = setup(undefined, true, attachment);
  const wrapper = document.querySelector('[data-testid="wrapper"]')!;
  expect(wrapper.parentNode).toBe(document.body);
  expect(host.querySelector('[data-testid="wrapper"]')).toBeNull();
  expect(portal().parentNode).toBe(wrapper);
  expect(component.getRefs()).toEqual([portal(), portal()]);
  expect(portal().textContent).toBe('Initial');
  expect(portal().className).toBe('portal-class');
  expect(portal().style.color).toBe('green');
  expect(attachment).toHaveBeenCalledWith(portal());
  component.remove();
  flushSync();
  expect(wrapper.isConnected).toBe(false);
  expect(component.getRefs()).toEqual([null, null]);
  expect(cleanup).toHaveBeenCalledTimes(1);
});
it('supports a ShadowRoot and cleans relocated content on root teardown', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const { component } = setup(shadow);
  const node = shadow.querySelector('[data-testid="portal"]')!;
  expect(node.textContent).toBe('Initial');
  await unmount(component);
  cleanups.pop();
  expect(shadow.querySelector('[data-testid="portal"]')).toBeNull();
});
it('treats a native container carrying a current property as a node, not a ref object', () => {
  const destination = Object.assign(document.createElement('div'), { current: null });
  document.body.append(destination);
  setup(destination);
  expect(portal().parentNode).toBe(destination);
});
it('uses a raw generated ID until explicit props override or remove it', () => {
  const { component } = setup();
  expect(portal().id).not.toBe('');
  expect(portal().id.startsWith('base-ui-')).toBe(false);
  component.setId('explicit');
  flushSync();
  expect(portal().id).toBe('explicit');
  component.setId(undefined);
  flushSync();
  expect(portal().hasAttribute('id')).toBe(false);
});
it('retains ref resolution when a parent derived container and native props rerender together', () => {
  const host = document.createElement('main');
  document.body.append(host);
  const component = mount(BrowserFixture, { target: host, props: { scenario: 'ref-null' } });
  cleanups.push(() => unmount(component));
  flushSync();
  const root = () => document.querySelector('[data-testid="root"]')!;
  expect(root().parentNode).toBe(document.body);
  [...host.querySelectorAll('button')]
    .find((node) => node.textContent === 'mutate same ref')!
    .click();
  flushSync();
  expect(root().parentNode).toBe(document.body);
  expect(root().getAttribute('data-mode')).toBe('mutated');
  [...host.querySelectorAll('button')].find((node) => node.textContent === 'resolve ref')!.click();
  flushSync();
  expect(root().parentNode).toBe(host.querySelector('#target-a'));
});

for (const initialRef of [undefined, null])
  for (const custom of [false, true]) {
    it(`initially ${initialRef} Portal binding publishes actual host for custom=${custom} and clears`, () => {
      const host = document.createElement('main');
      document.body.append(host);
      const component = mount(Fixture, { target: host, props: { initialRef, custom } });
      cleanups.push(() => unmount(component));
      flushSync();
      const node = portal();
      expect(component.getRefs()[0]).toBe(node);
      if (custom) expect(component.getRefs()[1]).toBe(node);
      component.remove();
      flushSync();
      expect(component.getRefs()).toEqual([null, null]);
      expect(node.isConnected).toBe(false);
    });
  }
it('a ref with an unrelated undefined ownerDocument resolves its current target', () => {
  const destination = document.createElement('section');
  document.body.append(destination);
  setup({ current: destination, ownerDocument: undefined } as ToastPortalProps['container']);
  expect(portal().parentNode).toBe(destination);
});
