import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { AccordionSSRReference } from './accordion-ssr-reference.js';
export function hydrateAccordionReference(node: HTMLElement, scenario: string) {
  const root = hydrateRoot(
    node,
    h(AccordionSSRReference, {
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
