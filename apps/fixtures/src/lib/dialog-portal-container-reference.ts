// Supplemental pinned React comparison: mui/base-ui v1.8.0 at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { createPortalContainer } from './dialog-portal-container.js';
export function mountPortalContainerReference(host: HTMLElement, scenario: string) {
  const { container, cleanup } = createPortalContainer(scenario);
  const root = createRoot(host);
  const props = { container, 'data-testid': 'container-portal' };
  root.render(
    h(
      'main',
      { 'data-hydrated': 'true' },
      h(
        Dialog.Root,
        { defaultOpen: true, modal: false },
        h(Dialog.Portal, props, h('span', null, 'Child')),
      ),
    ),
  );
  return () => {
    root.unmount();
    cleanup();
  };
}

export function mountMutablePortalContainerReference(host: HTMLElement) {
  let change: (
    container: HTMLElement | { current: HTMLElement | null } | null | undefined,
  ) => void = () => {};
  function Fixture() {
    const [container, setContainer] = useState<
      HTMLElement | { current: HTMLElement | null } | null | undefined
    >(null);
    change = setContainer;
    const props = { container, 'data-testid': 'container-portal' };
    return h(
      Dialog.Root,
      { defaultOpen: true, modal: false },
      h(Dialog.Portal, props, h('span', null, 'Child')),
    );
  }
  const root = createRoot(host);
  root.render(h(Fixture));
  return {
    setContainer: (container: HTMLElement | { current: HTMLElement | null } | null | undefined) =>
      change(container),
    stop: () => root.unmount(),
  };
}
