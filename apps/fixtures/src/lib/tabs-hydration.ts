import { hydrate, mount, unmount } from 'svelte';
import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import Fixture from './TabsBrowserFixture.svelte';
import { TabsReferenceFixture } from './tabs-reference.js';
export function hydrateTabs(framework: string, scenario: string) {
  const target = document.querySelector('#hydration-host')!;
  if (framework === 'react')
    hydrateRoot(target, createElement(TabsReferenceFixture, { scenario }));
  else hydrate(Fixture, { target, props: { scenario } });
}
export function mountTabs(target: HTMLElement, scenario: string) {
  const component = mount(Fixture, { target, props: { scenario } });
  return () => {
    void unmount(component);
  };
}
