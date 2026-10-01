// Fixture topology derived from Base UI v1.8.0 DialogPopup.test.tsx:92,287,310,333.
// MIT attribution: parity/dialog/UPSTREAM_LICENSE.
import { createElement as h, useCallback, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';

export function mountInitialFocusReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const input2Ref = useRef<HTMLInputElement>(null);
    const [calls, setCalls] = useState(0);
    const getRef = useCallback(() => { setCalls(count => count + 1); return input2Ref.current; }, []);
    const initialFocus = scenario === 'ref' ? input2Ref : scenario === 'true' ? () => true : scenario === 'null' ? () => null : getRef;
    return h('main', { 'data-hydrated': 'true' },
      scenario === 'ref' ? h('input') : null,
      h(Dialog.Root, { modal: false },
        h(Dialog.Trigger, null, 'Open'),
        h(Dialog.Portal, null,
          h(Dialog.Popup, { 'data-testid': 'dialog', initialFocus },
            h('input', { 'data-testid': 'input-1' }),
            scenario === 'ref' || scenario === 'count' ? h('input', { 'data-testid': 'input-2', ref: input2Ref }) : null,
            scenario === 'ref' ? h('input', { 'data-testid': 'input-3' }) : null,
            scenario === 'ref' ? h('button', null, 'Close') : null,
            scenario === 'count' ? h(Dialog.Close, null, 'Close') : null))),
      scenario === 'ref' ? h('input') : null,
      h('output', { 'data-testid': 'focus-calls' }, calls));
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
