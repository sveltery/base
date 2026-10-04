// Authored actual Source/native boundary regression; zero Original declaration credit.
// Derived from the preserved Popup realm witness at 811bea9; Full/Menu scope only.
import { expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { getWindow } from '@floating-ui/utils/dom';
import Fixture from './MenuPortalRealmFixture.svelte';
import { mountMenuPortalRealmReference } from '../../../../apps/fixtures/src/lib/menu-portal-realm-reference.js';

for (const contextual of [false, true]) it(`actual Source/native ${contextual ? 'public contextual Menu' : 'Full'} portal supports an HTMLElement with null defaultView`, async () => {
  const foreignDocument = document.implementation.createHTMLDocument('portal host');
  const destination = foreignDocument.createElement('section');
  foreignDocument.body.append(destination);
  expect(foreignDocument.defaultView).toBeNull();
  expect(getWindow(destination)).toBe(window);
  const sourceHost = document.createElement('main'); document.body.append(sourceHost);
  let stop: (() => void) | undefined;
  let sourceError: unknown;
  try { stop = mountMenuPortalRealmReference(sourceHost, destination, contextual); }
  catch (error) { sourceError = error; }
  const sourceResult = { error: sourceError instanceof Error ? sourceError.message : sourceError ?? null,
    portal: !!destination.querySelector('[data-testid="realm-portal"]'),
    child: !!destination.querySelector('[data-testid="realm-child"]') };
  stop?.(); sourceHost.remove();

  const nativeHost = document.createElement('main'); document.body.append(nativeHost);
  let component: ReturnType<typeof mount> | undefined;
  let nativeError: unknown;
  try { component = mount(Fixture, { target: nativeHost, props: { container: destination, contextual } }); flushSync(); }
  catch (error) { nativeError = error; }
  const nativeResult = { error: nativeError instanceof Error ? nativeError.message : nativeError ?? null,
    portal: !!destination.querySelector('[data-testid="realm-portal"]'),
    child: !!destination.querySelector('[data-testid="realm-child"]') };
  if (component) await unmount(component);
  nativeHost.remove();
  console.info(JSON.stringify({ kind: contextual ? 'Menu' : 'Full', source: sourceResult, native: nativeResult }));
  expect(sourceResult).toEqual({ error: null, portal: true, child: true });
  expect(nativeResult).toEqual(sourceResult);
});
