// Native class/lazy-reader witnesses; zero unchanged Original assertion credit.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { flushSync, hydrate, mount, tick, unmount } from 'svelte';
import Fixture from './NativePreviousValueFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
});
function setup(initial: number) {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target, props: { initial } });
  mounted.push(component);
  flushSync();
  return { component, target };
}

it('retains Object.is NaN and signed-zero boundaries on the actual PreviousValue owner', () => {
  const { component } = setup(NaN);
  expect(component.snapshot().previous).toBeNull();
  component.setValue(NaN);
  expect(component.snapshot().previous).toBeNull();
  component.setValue(0);
  expect(Number.isNaN(component.snapshot().previous)).toBe(true);
  component.setValue(-0);
  expect(Object.is(component.snapshot().previous, 0)).toBe(true);
  component.setValue(-0);
  expect(Object.is(component.snapshot().previous, 0)).toBe(true);
  component.setValue(1);
  expect(Object.is(component.snapshot().previous, -0)).toBe(true);
});

it('observes the native final value when changes precede the next read', async () => {
  const { component, target } = setup(0);
  component.setValue(1);
  component.setValue(2);
  await tick();
  expect(target.querySelector('[data-current]')?.textContent).toBe('2');
  expect(target.querySelector('[data-previous]')?.textContent).toBe('0');
  component.setValue(3);
  await tick();
  expect(target.querySelector('[data-previous]')?.textContent).toBe('2');
});

it('retains repeated same-turn business reads while native effects track the actual input', async () => {
  const { component, target } = setup(0);
  expect(component.snapshot().observed).toEqual([null]);
  component.setValue(1);
  expect(component.snapshot().previous).toBe(0);
  expect(component.snapshot().previous).toBe(0);
  component.setValue(2);
  expect(component.snapshot().previous).toBe(1);
  await tick();
  expect(target.querySelector('[data-previous]')?.textContent).toBe('1');
  expect(component.snapshot().observed).toEqual([null, 1]);
  component.setValue(2);
  await tick();
  expect(component.snapshot().observed).toEqual([null, 1, 1]);
});

it('hydrates the original host and gives the native owner its initial previous-value state', async () => {
  const source = `import { createRequire } from 'node:module'; import Fixture from './packages/base/tests/dom/NativePreviousValueFixture.svelte'; const require = createRequire(new URL('./packages/base/package.json', import.meta.url)); process.stdout.write(require('svelte/server').render(Fixture, { props: { initial: 4 } }).body);`;
  const markup = execFileSync(
    process.execPath,
    ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', source],
    { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' },
  );
  const target = document.createElement('div');
  target.innerHTML = markup;
  document.body.append(target);
  const host = target.querySelector('[data-previous]');
  const component = hydrate(Fixture, { target, props: { initial: 4 } });
  mounted.push(component);
  flushSync();
  expect(target.querySelector('[data-previous]')).toBe(host);
  expect(component.snapshot().previous).toBeNull();
  component.setValue(5);
  await tick();
  expect(target.querySelector('[data-previous]')).toBe(host);
  expect(host?.textContent).toBe('4');
});
