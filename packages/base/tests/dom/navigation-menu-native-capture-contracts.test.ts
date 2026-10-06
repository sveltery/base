// Bare native Svelte context/capture witness; no Base runtime or upstream credit.
import { expect, it, vi } from 'vitest';
import { flushSync, hydrate, tick, unmount } from 'svelte';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import Bare from '../../../../apps/fixtures/src/lib/NativeNavigationMenuCaptureWitness.svelte';
it('bare SSR hydration preserves live logical context but capture follows relocated DOM ancestry', async () => {
  const fixture = pathToFileURL(
    resolve('../../apps/fixtures/src/lib/NativeNavigationMenuCaptureWitness.svelte'),
  ).href;
  const html = execFileSync(
    process.execPath,
    [
      '--import',
      resolve('../../scripts/svelte-ssr-loader.mjs'),
      '--input-type=module',
      '-e',
      `import { render } from 'svelte/server'; import Bare from ${JSON.stringify(fixture)}; process.stdout.write(render(Bare).body);`,
    ],
    { encoding: 'utf8' },
  );
  expect(html).toContain('data-hydrated="false"');
  expect(html).toContain('data-context="initial"');
  const target = document.createElement('section');
  target.innerHTML = html;
  document.body.append(target);
  const originalHost = target.querySelector<HTMLElement>('[data-testid="bare-capture-child-host"]');
  if (!originalHost) throw new Error('Actual bare SSR child host is missing');
  const warnings = vi.spyOn(console, 'warn');
  const errors = vi.spyOn(console, 'error');
  const app = hydrate(Bare, { target });
  const trace: {
    phase: string;
    context: string | null;
    inParent: boolean;
    inBody: boolean;
    events: (string | null)[];
  }[] = [];
  try {
    flushSync();
    await tick();
    expect(
      target.querySelector('[data-testid="bare-capture-witness"]')?.getAttribute('data-hydrated'),
    ).toBe('true');
    expect(document.querySelector('[data-testid="bare-capture-child-host"]')).toBe(originalHost);
    const record = (phase: string) => {
      trace.push({
        phase,
        context: originalHost.getAttribute('data-context'),
        inParent: originalHost.parentElement?.getAttribute('data-testid') === 'bare-capture-parent',
        inBody: originalHost.parentElement === document.body,
        events: [...target.querySelectorAll('[data-testid="bare-capture-events"] li')].map(
          (item) => item.textContent,
        ),
      });
    };
    const click = async (id: string) => {
      const button = document.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`);
      if (!button) throw new Error(`Actual bare ${id} control is missing`);
      button.click();
      flushSync();
      await tick();
    };
    await click('bare-capture-child');
    record('initial');
    expect(trace.at(-1)).toEqual({
      phase: 'initial',
      context: 'initial',
      inParent: true,
      inBody: false,
      events: ['capture:initial', 'child:initial'],
    });
    await click('bare-capture-move');
    expect(document.querySelector('[data-testid="bare-capture-child-host"]')).toBe(originalHost);
    await click('bare-capture-child');
    record('moved');
    expect(trace.at(-1)).toEqual({
      phase: 'moved',
      context: 'initial',
      inParent: false,
      inBody: true,
      events: ['capture:initial', 'child:initial', 'child:initial'],
    });
    await click('bare-capture-context');
    await click('bare-capture-child');
    record('live-context');
    expect(trace.at(-1)).toEqual({
      phase: 'live-context',
      context: 'updated',
      inParent: false,
      inBody: true,
      events: ['capture:initial', 'child:initial', 'child:initial', 'child:updated'],
    });
    console.info(`navigation-menu-native-bare-capture:${JSON.stringify(trace)}`);
    expect(warnings.mock.calls.filter((call) => /hydration/i.test(call.join(' ')))).toEqual([]);
    expect(errors.mock.calls.filter((call) => /hydration/i.test(call.join(' ')))).toEqual([]);
  } finally {
    await unmount(app);
    target.remove();
    expect(originalHost.isConnected).toBe(false);
    warnings.mockRestore();
    errors.mockRestore();
  }
});
