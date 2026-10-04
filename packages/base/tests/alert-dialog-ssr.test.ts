import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { AlertDialog } from '@sveltery/base';
import Fixture from '../../../apps/fixtures/src/lib/AlertDialogSsrFixture.svelte';
it('keeps repeated SSR request handles inert and emits stable generated detached trigger IDs', () => {
  const handle = AlertDialog.createHandle<number>();
  const html = [render(Fixture, { props: { handle } }).body, render(Fixture, { props: { handle } }).body];
  expect(html[0]).toBe(html[1]); expect(html[0]).toContain('aria-expanded="false"'); expect(html[0]).not.toContain('data-popup-open');
  expect(html[0]).toMatch(/id="base-ui-[^"]+"/); expect(handle.isOpen).toBe(false); expect(handle.store).toBe(handle.serverStore);
});
