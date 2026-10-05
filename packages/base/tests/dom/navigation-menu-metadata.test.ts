// Native framework replacements for Original RootContext10/18; unchanged credit0.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './NavigationMenuMetadataFixture.svelte';
let instance: ReturnType<typeof mount> | undefined;
afterEach(async () => { if (instance) await unmount(instance); instance = undefined; document.body.replaceChildren(); vi.unstubAllEnvs(); });
for (const [line, environment] of [[10, 'development'], [18, 'production']] as const) it(`RootContext:${line} native ${environment} context retains Symbol metadata`, async () => {
  vi.stubEnv('NODE_ENV', environment);
  const observed: Array<{ keyType: string; description: string | undefined; displayName: unknown }> = [];
  const target = document.createElement('section'); document.body.append(target);
  instance = mount(Fixture, { target, props: { observe: metadata => { observed.push(metadata); } } }); await tick();
  expect(observed).toEqual([{ keyType: 'symbol', description: 'NavigationMenuRootContext', displayName: undefined }]);
});
