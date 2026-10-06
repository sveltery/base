// Native functional binding characterization; no business implementation copied.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Probe from './OTPBindingProbe.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
for (const bound of [false, true]) {
  for (const cancel of [false, true]) {
    it(`native ${bound ? 'functional binding' : 'value spread'} ${cancel ? 'canceled' : 'same first character'} input`, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const onChange = vi.fn();
      const component = mount(Probe, {
        target: host,
        props: { bound, cancel, onChange },
      });
      cleanups.push(() => unmount(component));
      flushSync();
      const input = host.querySelector('input')!;
      input.value = '123456';
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      flushSync();
      expect(onChange).toHaveBeenCalledExactlyOnceWith('123456');
      expect(component.value()).toBe(cancel ? '12' : '123456');
      expect(input.value).toBe(bound && !cancel ? '1' : '123456');
      await tick();
      expect(input.value).toBe(bound ? '1' : '123456');
    });
  }
}
