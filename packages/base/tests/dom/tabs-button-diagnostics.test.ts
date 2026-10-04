// Actual pinned Source/native selected button diagnostics; supplements, zero ordinary credit.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './TabsButtonDiagnostics.svelte';
const referenceRequire = createRequire(resolve('../../apps/fixtures/package.json'));
const { createElement: h, act } = referenceRequire('react');
const { createRoot } = referenceRequire('react-dom/client');
const { Tabs } = referenceRequire('@base-ui/react/tabs');
for (const native of [true, false]) {
  it(`actual Source/native Tabs button diagnostic explanation ${native}`, async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const messages: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => messages.push(args.join(' ')));
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    let component: ReturnType<typeof mount> | undefined;
    try {
      await act(async () => root.render(h(Tabs.Root, { defaultValue: 0 }, h(Tabs.List, {}, h(Tabs.Tab, { value: 0, nativeButton: native, render: h(native ? 'div' : 'button') }, 'Mismatch')))));
      const source = messages.find(message => message.includes('A component that acts as a button'));
      await act(async () => root.unmount()); messages.length = 0;
      component = mount(Fixture, { target: host, props: { native } }); flushSync(); await tick();
      const local = messages.find(message => message.includes('A component that acts as a button'));
      const explanation = native
        ? 'Rendering a non-<button> removes native button semantics, which can impact forms and accessibility.'
        : 'Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as `role` or `aria-disabled`).';
      expect(source).toContain(explanation);
      expect(local).toContain(explanation);
    } finally {
      if (component) await unmount(component);
      spy.mockRestore(); host.remove();
    }
  });
}
