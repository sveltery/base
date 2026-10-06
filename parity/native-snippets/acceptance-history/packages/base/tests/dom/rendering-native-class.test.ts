// Compare real native markup with the actual shared renderer, including reactive updates.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import Fixture from './NativeClassComparisonFixture.svelte';

const apps: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const app of apps.splice(0)) await unmount(app);
  document.body.replaceChildren();
});

it('matches native class attributes and host identity across scalar, array and object updates', () => {
  const inherited = Object.assign(Object.create({ inherited: true }), { own: true, hidden: false });
  const cases: ClassValue[] = [
    undefined, null, false, 0, '', true, NaN, 1n, 'plain', [], {},
    ['first', [false, 0, true, null, '', 'second'], inherited], inherited,
  ];
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(Fixture, { target }); apps.push(app); flushSync();
  const native = target.querySelector('[data-native]')!;
  const shared = target.querySelector('[data-shared]')!;
  for (const value of cases) {
    app.setValue(value); flushSync();
    expect(target.querySelector('[data-native]')).toBe(native);
    expect(target.querySelector('[data-shared]')).toBe(shared);
    expect(shared.getAttribute('class')).toBe(native.getAttribute('class'));
  }
});
