import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { createDialogHandle } from '../src/lib/dialog/handle.svelte.js';
import Fixture from '../../../apps/fixtures/src/lib/DialogHandleSsrFixture.svelte';
// SSR supplements precede actual browser hydration; no browser declaration credit from rendering alone.
it('server rendering never attaches a default-open Root to its shared handle', () => {
  const handle = createDialogHandle();
  for (let request = 0; request < 2; request++) {
    const { body } = render(Fixture, { props: { handle } });
    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('data-popup-open');
    expect(handle.isOpen).toBe(false);
    expect(handle.store).toBe(handle.serverStore);
  }
});
