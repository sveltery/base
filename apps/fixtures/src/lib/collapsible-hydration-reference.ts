import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { CollapsibleSSRReference } from './collapsible-ssr-reference.js';
export function hydrateCollapsibleReference(node: HTMLElement, scenario: string) {
  const root = hydrateRoot(
    node,
    h(CollapsibleSSRReference, {
      scenario,
      onHydrated: () => {
        node.dataset.hydrated = 'true';
      },
    }),
    {
      onRecoverableError(error) {
        console.error(error);
      },
    },
  );
  return () => root.unmount();
}
