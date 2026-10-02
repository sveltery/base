// Actual Base UI npm 1.8.0 provider/context. Source pin 47b40521; MIT: parity/csp-provider/UPSTREAM_LICENSE.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CSPProvider } from '@base-ui/react/csp-provider';
import { useCSPContext } from '@base-ui/react/internals/csp-context';
function Probe({ name }: { name: string }) {
  const context = useCSPContext();
  return h('output', { 'data-testid': name, 'data-nonce': context.nonce ?? 'undefined', 'data-disable': String(context.disableStyleElements) }, `${context.nonce ?? 'undefined'}|${String(context.disableStyleElements)}`);
}
export function mountCSPReference(node: HTMLElement) {
  function Fixture() {
    const [nonce, setNonce] = useState<string | undefined>('outer-a');
    const [disabled, setDisabled] = useState<boolean | undefined>(true);
    const [shown, setShown] = useState(true);
    return h('main', { 'data-hydrated': true },
      h('button', { onClick: () => { setNonce('outer-b'); setDisabled(false); } }, 'Update'),
      h('button', { onClick: () => { setNonce(undefined); setDisabled(undefined); } }, 'Clear'),
      h('button', { onClick: () => setShown(value => !value) }, 'Toggle provider'),
      h(Probe, { name: 'outside' }),
      shown ? h(CSPProvider, { nonce, disableStyleElements: disabled }, h(Probe, { name: 'outer' }),
        h(CSPProvider, {}, h(Probe, { name: 'inner-omitted' })),
        h(CSPProvider, { nonce: 'inner', disableStyleElements: false }, h(Probe, { name: 'inner-explicit' })),
        h(Probe, { name: 'outer-sibling' })) : h(Probe, { name: 'unwrapped' }),
      h(Probe, { name: 'after' }));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
