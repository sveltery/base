// Paired actual Source/native SSR library namespace and override equality. Supplements; zero ordinary credit.
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import Fixture from './ssr/TabsIds.svelte';
const referenceRequire = createRequire(new URL('../../../apps/fixtures/package.json', import.meta.url));
const { createElement: h } = referenceRequire('react');
const { renderToString } = referenceRequire('react-dom/server');
const { Tabs } = referenceRequire('@base-ui/react/tabs');
function ids(framework: string, tabId?: string) {
  const body = framework === 'react'
    ? renderToString(h(Tabs.Root, { defaultValue: 0 }, h(Tabs.List, {}, h(Tabs.Tab, { value: 0, id: tabId }, 'First'), h(Tabs.Tab, { value: 1 }, 'Second')), h(Tabs.Panel, { value: 0 }, 'First panel')))
    : render(Fixture, { props: { tabId }, idPrefix: 'tabs-native' }).body;
  return [...new JSDOM(body).window.document.querySelectorAll('[role=tab],[role=tabpanel]')].map(node => node.id);
}
for (const framework of ['react', 'svelte']) {
  it(`${framework} actual Tabs SSR preserves library namespace and unique framework suffixes`, () => {
    const generated = ids(framework);
    expect(generated).toHaveLength(3);
    expect(new Set(generated).size).toBe(3);
    for (const id of generated) expect(id.startsWith('base-ui-')).toBe(true);
    if (framework === 'svelte') {
      // The Source wrapper prefixes the actual native idPrefix/$props.id() bytes.
      for (const id of generated) expect(id).toMatch(/^base-ui-tabs-native-s\d+$/);
    }
  });
  for (const override of ['authored-tab', '']) {
    it(`${framework} actual Tabs SSR preserves explicit Tab id ${JSON.stringify(override)}`, () => {
      const generated = ids(framework, override);
      expect(generated[0]).toBe(override);
      expect(new Set(generated).size).toBe(3);
      for (const id of generated.slice(1)) expect(id.startsWith('base-ui-')).toBe(true);
    });
  }
}
