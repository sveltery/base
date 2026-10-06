// Supplemental context witnesses; zero upstream ordinary declaration credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/CSPFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup() {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  cleanups.push(() => unmount(component));
  flushSync();
  const output = (name: string) =>
    target.querySelector<HTMLOutputElement>(`[data-testid="${name}"]`)!;
  const click = (label: string) => {
    [...target.querySelectorAll('button')].find((node) => node.textContent === label)!.click();
    flushSync();
  };
  return { target, output, click };
}
it('default fallback differs from provider-owned omitted props and nested providers replace values', () => {
  const { target, output } = setup();
  expect(output('outside').textContent).toBe('undefined|false');
  expect(output('outer').textContent).toBe('outer-a|true');
  expect(output('inner-omitted').textContent).toBe('undefined|undefined');
  expect(output('inner-explicit').textContent).toBe('inner|false');
  expect(output('outer-sibling').textContent).toBe('outer-a|true');
  expect(output('after').textContent).toBe('undefined|false');
  expect([...target.querySelector('main')!.children].map((node) => node.tagName)).toEqual([
    'BUTTON',
    'BUTTON',
    'BUTTON',
    'OUTPUT',
    'OUTPUT',
    'OUTPUT',
    'OUTPUT',
    'OUTPUT',
    'OUTPUT',
  ]);
});
it('existing descendants read reactive false and explicit undefined without inheriting or defaulting', () => {
  const { output, click } = setup();
  const outer = output('outer');
  click('Update');
  expect(output('outer')).toBe(outer);
  expect(outer.textContent).toBe('outer-b|false');
  expect(output('outer-sibling').textContent).toBe('outer-b|false');
  expect(output('inner-omitted').textContent).toBe('undefined|undefined');
  click('Clear');
  expect(output('outer')).toBe(outer);
  expect(outer.textContent).toBe('undefined|undefined');
  expect(output('inner-explicit').textContent).toBe('inner|false');
  expect(output('outside').textContent).toBe('undefined|false');
});
it('provider teardown restores outside fallback and remount reads current props', () => {
  const { output, click } = setup();
  click('Toggle provider');
  expect(output('outer')).toBeNull();
  expect(output('unwrapped').textContent).toBe('undefined|false');
  click('Update');
  click('Toggle provider');
  expect(output('unwrapped')).toBeNull();
  expect(output('outer').textContent).toBe('outer-b|false');
  expect(output('after').textContent).toBe('undefined|false');
});
