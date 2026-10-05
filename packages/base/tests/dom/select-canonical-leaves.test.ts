import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './SelectCanonicalLeavesFixture.svelte';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup(custom = false, attached?: (node: HTMLElement) => (() => void) | void) {
  const host = document.createElement('main');
  document.body.append(host);
  const component = mount(Fixture, { target: host, props: { custom, attached } });
  cleanups.push(() => unmount(component));
  flushSync();
  return { host, component };
}
function separator(host: HTMLElement) { return host.querySelector<HTMLElement>('[data-testid="listbox-separator"]')!; }

it('uses the internal presentation role and horizontal data state without inventing ARIA', () => {
  const { host, component } = setup();
  const node = separator(host);
  expect(node.tagName).toBe('DIV');
  expect(node.getAttribute('role')).toBe('presentation');
  expect(node.dataset.orientation).toBe('horizontal');
  expect(node.hasAttribute('aria-orientation')).toBe(false);
  expect(node.textContent).toBe('Child');
  expect(component.getRefs()[0]).toBe(node);
  component.setOrientation('vertical');
  flushSync();
  expect(separator(host)).toBe(node);
  expect(node.dataset.orientation).toBe('vertical');
  expect(node.className).toBe('separator vertical');
  expect(node.style.color).toBe('red');
  expect(node.hasAttribute('aria-orientation')).toBe(false);
});

it('preserves rightmost consumer element props independently of actual state', () => {
  const { host, component } = setup();
  component.setOverride(true);
  flushSync();
  const node = separator(host);
  expect(node.getAttribute('role')).toBe('separator');
  expect(node.getAttribute('aria-orientation')).toBe('vertical');
  expect(node.dataset.orientation).toBe('consumer');
  expect(node.className).toBe('separator');
  component.setOverride(false);
  flushSync();
  expect(node.getAttribute('role')).toBe('presentation');
  expect(node.hasAttribute('aria-orientation')).toBe(false);
});

it('publishes the replacement host and cleans up native attachments once per host lifetime', () => {
  const cleanup = vi.fn();
  const attached = vi.fn(() => cleanup);
  const { host, component } = setup(true, attached);
  const first = separator(host);
  expect(first.tagName).toBe('SECTION');
  expect(component.getRefs()).toEqual([first, first]);
  expect(first.className).toBe('replacement separator');
  component.setOrientation('vertical');
  flushSync();
  expect(separator(host)).toBe(first);
  expect(first.dataset.renderState).toBe('vertical');
  expect(attached).toHaveBeenCalledTimes(1);
  component.replaceHost();
  flushSync();
  const second = separator(host);
  expect(second.tagName).toBe('ARTICLE');
  expect(component.getRefs()).toEqual([second, second]);
  expect(first.isConnected).toBe(false);
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(attached).toHaveBeenCalledTimes(2);
  component.remove();
  flushSync();
  expect(component.getRefs()).toEqual([null, null]);
  expect(cleanup).toHaveBeenCalledTimes(2);
});

it('renders authored Snippet labels and scalar values with the literal Svelte defaults', () => {
  const { host } = setup();
  const resolved = host.querySelector('[data-testid="resolved-labels"]')!;
  const native = host.querySelector('[data-testid="native-labels"]')!;
  expect(resolved.textContent).toBe(native.textContent);
  expect(resolved.querySelector('strong')?.textContent).toBe('Authored');
  expect(resolved.textContent).toBe('Authored, false, 0, 2');
});
