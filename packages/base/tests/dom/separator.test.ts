import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './SeparatorFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function setup(custom = false, attached?: (node: HTMLElement) => (() => void) | void) {
  const host = document.createElement('main'); document.body.append(host);
  const component = mount(Fixture, { target: host, props: { custom, attached } });
  cleanups.push(() => unmount(component)); flushSync(); return { host, component };
}
function separator() { return document.querySelector<HTMLElement>('[data-testid="separator"]')!; }
it('defaults to a native div with explicit horizontal role/ARIA/state and children', () => {
  const { component } = setup(); const node = separator();
  expect(node.tagName).toBe('DIV'); expect(node.getAttribute('role')).toBe('separator');
  expect(node.getAttribute('aria-orientation')).toBe('horizontal'); expect(node.dataset.orientation).toBe('horizontal');
  expect(node.textContent).toBe('Child'); expect(component.getRefs()[0]).toBe(node);
});
it('reactively resolves orientation, class/style functions and state data on the same host', () => {
  const { component } = setup(); const node = separator(); component.setOrientation('vertical'); flushSync();
  expect(separator()).toBe(node); expect(node.getAttribute('aria-orientation')).toBe('vertical');
  expect(node.dataset.orientation).toBe('vertical'); expect(node.className).toBe('separator-vertical'); expect(node.style.color).toBe('red');
});
it('consumer native role/ARIA/data props override defaults independently of orientation state', () => {
  const { component } = setup(); component.setOverride(true); flushSync(); const node = separator();
  expect(node.getAttribute('role')).toBe('presentation'); expect(node.getAttribute('aria-orientation')).toBe('vertical');
  expect(node.dataset.orientation).toBe('consumer'); expect(node.className).toBe('separator-horizontal');
  component.setOverride(false); flushSync(); expect(node.getAttribute('role')).toBe('separator'); expect(node.dataset.orientation).toBe('horizontal');
});
it('replacement snippets receive reactive state/children and publish the actual host to both refs', () => {
  const { component } = setup(true); const node = separator(); expect(node.tagName).toBe('SECTION');
  expect(component.getRefs()).toEqual([node, node]); expect(node.textContent).toBe('Child');
  expect(node.className).toBe('replacement separator-horizontal'); component.setOrientation('vertical'); flushSync();
  expect(node.dataset.renderState).toBe('vertical'); expect(node.dataset.orientation).toBe('vertical');
});
it('attachment cleanup belongs to the actual replacement host and runs once on replacement/removal', () => {
  const cleanup = vi.fn(); const attachment = vi.fn(() => cleanup); const { component } = setup(true, attachment);
  const old = separator(); expect(attachment).toHaveBeenCalledWith(old); component.replaceHost(); flushSync();
  const node = separator(); expect(node.tagName).toBe('ARTICLE'); expect(old.isConnected).toBe(false);
  expect(component.getRefs()).toEqual([node, node]); expect(cleanup).toHaveBeenCalledTimes(1); expect(attachment).toHaveBeenCalledTimes(2);
  component.remove(); flushSync(); expect(component.getRefs()).toEqual([null, null]); expect(cleanup).toHaveBeenCalledTimes(2);
});
