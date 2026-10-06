import { afterEach, expect, test, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import DemoLifetime from './DemoLifetime.svelte';
const owners: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const owner of owners.splice(0)) await unmount(owner);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});
test('closing Demo measures the captured trigger when its owner unmounts in the same click', async () => {
  const target = document.createElement('div');
  document.body.append(target);
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  const measurement = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: -10,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: -10,
    toJSON: () => ({}),
  });
  owners.push(mount(DemoLifetime, { target }));
  await tick();
  const trigger = target.querySelector<HTMLButtonElement>('.DemoCollapseButton')!;
  expect(trigger.textContent).toContain('Show code');
  expect(target.querySelector('.DemoSourceBrowser')?.textContent).toBe('line\n'.repeat(10));
  trigger.click();
  await tick();
  expect(trigger.textContent).toContain('Hide code');
  measurement.mockClear();
  const visual = trigger.querySelector('.DemoCollapseButtonVisual');
  trigger.click();
  await tick();
  await Promise.resolve();
  expect(target.querySelector('.DemoRoot')).toBeNull();
  expect(measurement.mock.contexts.filter((host) => host === visual)).toHaveLength(2);
});
