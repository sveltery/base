// Paired native source-contract supplements, not unchanged upstream declarations. MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './RadioStandaloneFixture.svelte';
import { mountRadioReference } from '../../../../apps/fixtures/src/lib/radio-reference.js';

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});

for (const renderer of ['react', 'svelte']) {
  for (const value of ['', 'a']) {
    for (const action of ['visible', 'hidden']) {
      it(`${renderer} standalone ${JSON.stringify(value)} ${action} click preserves source checked and touched contracts`, async () => {
        const host = document.createElement('div');
        document.body.append(host);
        if (renderer === 'react') {
          cleanups.push(
            mountRadioReference(host, value === '' ? 'standalone-empty' : 'standalone-nonempty'),
          );
          await vi.waitFor(() => {
            expect(
              host.querySelector('main[data-hydrated="true"]')?.getAttribute('data-renderer'),
            ).toBe('19.2.8/19.2.8');
          });
        } else {
          const component = mount(Fixture, { target: host, props: { value } });
          cleanups.push(() => unmount(component));
          flushSync();
        }
        const field = host.querySelector<HTMLElement>('#standalone-field')!;
        const radio = host.querySelector<HTMLElement>('[data-testid="standalone-radio"]')!;
        const input = host.querySelector<HTMLInputElement>('#standalone-input')!;
        const selected = value === '';
        await vi.waitFor(() => expect(field.hasAttribute('data-filled')).toBe(selected));
        expect(input.checked).toBe(selected);
        expect(radio.getAttribute('aria-checked')).toBe(String(selected));
        expect(field.hasAttribute('data-touched')).toBe(false);
        const nativeEvents: string[] = [];
        input.addEventListener('input', () => nativeEvents.push('input'));
        input.addEventListener('change', () => nativeEvents.push('change'));

        if (action === 'visible') radio.click();
        else input.click();
        flushSync();
        await tick();
        await vi.waitFor(() => expect(field.hasAttribute('data-touched')).toBe(!selected));

        expect(radio.getAttribute('aria-checked')).toBe(String(selected));
        expect(field.hasAttribute('data-filled')).toBe(selected);
        // A rejected standalone nonempty activation keeps each renderer's native
        // checked behavior; no React restoration is introduced in Svelte.
        expect(input.checked).toBe(selected || renderer === 'svelte');
        // JSDOM emits both events for nonempty direct React activation; secured
        // Chromium and literal renderer witnesses are characterized separately.
        expect(nativeEvents).toEqual(selected ? [] : ['input', 'change']);
      });
    }
  }
}
