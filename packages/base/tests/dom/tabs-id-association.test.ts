// Paired actual Source/native ID supplements; actual pinned Source/native execution, zero ordinary credit.
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './TabsIdAssociationFixture.svelte';
import { resolve } from 'node:path';
const referenceRequire = createRequire(
  resolve(import.meta.dirname, '../../../../apps/fixtures/package.json'),
);
const { createElement: h, act } = referenceRequire('react');
const { createRoot } = referenceRequire('react-dom/client');
const { Tabs } = referenceRequire('@base-ui/react/tabs');
for (const framework of ['react', 'svelte']) {
  for (const panelMode of ['omitted', 'authored', 'undefined'] as const) {
    it(`${framework} generated association and reactive explicit Tab overrides; Panel ID=${panelMode}`, async () => {
      (
        globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
      ).IS_REACT_ACT_ENVIRONMENT = true;
      const host = document.createElement('div');
      document.body.append(host);
      const native =
        framework === 'svelte' ? mount(Fixture, { target: host, props: { panelMode } }) : undefined;
      const reference = framework === 'react' ? createRoot(host) : undefined;
      const original = (id: string | null | undefined) =>
        h(
          Tabs.Root,
          { defaultValue: 0 },
          h(Tabs.List, {}, h(Tabs.Tab, { value: 0, id }, 'First')),
          h(
            Tabs.Panel,
            {
              value: 0,
              ...(panelMode === 'omitted'
                ? {}
                : { id: panelMode === 'authored' ? 'authored-panel' : undefined }),
            },
            'Panel',
          ),
        );
      try {
        if (reference) await act(async () => reference.render(original(undefined)));
        else {
          flushSync();
          await tick();
        }
        const tab = () => host.querySelector<HTMLElement>('[role=tab]')!;
        const panel = () => host.querySelector<HTMLElement>('[role=tabpanel]')!;
        const generatedTabId = tab().id;
        const registeredPanelId = tab().getAttribute('aria-controls');
        expect(generatedTabId).toMatch(/^base-ui-/);
        expect(registeredPanelId).toMatch(/^base-ui-/);
        expect(registeredPanelId).not.toBe(generatedTabId);
        for (const next of ['authored-tab', '', null, undefined]) {
          if (reference) await act(async () => reference.render(original(next)));
          else {
            native!.setTabId(next);
            flushSync();
            await tick();
            flushSync();
          }
          expect(tab().id).toBe(next ?? generatedTabId);
          expect(panel().getAttribute('aria-labelledby')).toBe(next ?? generatedTabId);
          expect(tab().getAttribute('aria-controls')).toBe(registeredPanelId);
          if (panelMode !== 'omitted') {
            expect(panel().id).toBe(panelMode === 'authored' ? 'authored-panel' : '');
            expect(registeredPanelId).not.toBe(panel().id);
            expect(host.querySelector(`[id="${registeredPanelId}"]`)).toBe(null);
          } else expect(registeredPanelId).toBe(panel().id);
        }
      } finally {
        if (native) await unmount(native);
        if (reference) await act(async () => reference.unmount());
        host.remove();
      }
    });
  }
}
