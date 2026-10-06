import { createViteServer } from 'vitest/node';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { flushSync, hydrate, tick, unmount } from 'svelte';
import Fixture from './PopupFamilyFixture.svelte';
// Native SSR/hydration lifecycle witnesses; no unchanged Original assertion credit.
const cleanup: (() => Promise<void>)[] = [];
let server: Awaited<ReturnType<typeof createViteServer>>;
let serverRender: typeof import('svelte/server').render;
let ServerFixture: typeof Fixture;
beforeAll(async () => {
  server = await createViteServer({
    configFile: false,
    plugins: [svelte()],
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
  });
  const fixtureModule = await server.ssrLoadModule('/tests/dom/PopupFamilyFixture.svelte');
  ServerFixture = fixtureModule.default;
  const renderModule = await server.ssrLoadModule('svelte/server');
  serverRender = renderModule.render;
});
afterAll(async () => {
  await server?.close();
});
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
for (const family of ['popover', 'preview-card', 'tooltip'] as const)
  for (const defaultOpen of [false, true])
    it(`${family} hydrates the server trigger host then owns its portal (${defaultOpen})`, async () => {
      const props = { family, defaultOpen, keepMounted: true };
      const markup = serverRender(ServerFixture, { props }).body;
      const target = document.createElement('main');
      target.innerHTML = markup;
      document.body.append(target);
      const opener = target.querySelector<HTMLElement>('#opener')!;
      expect(document.querySelector('[data-testid=popup]')).toBeNull();
      const warning = vi.spyOn(console, 'warn');
      const instance = hydrate(Fixture, { target, props });
      cleanup.push(() => unmount(instance));
      flushSync();
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 70));
      await tick();
      expect(target.querySelector('#opener')).toBe(opener);
      expect(document.querySelector('[data-testid=popup]')).not.toBeNull();
      expect(document.querySelector('[data-testid=positioner]')?.hasAttribute('hidden')).toBe(
        !defaultOpen,
      );
      expect(
        warning.mock.calls.filter((args) =>
          args.some((value) => String(value).includes('hydration')),
        ),
      ).toEqual([]);
      instance.command('open');
      flushSync();
      await new Promise((resolve) => setTimeout(resolve, 70));
      await tick();
      expect(document.getElementById('payload')?.textContent).toBe('Content 7');
      instance.command('close');
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 70));
      await tick();
      expect(document.querySelector('[data-testid=positioner]')?.hasAttribute('hidden')).toBe(true);
    });
