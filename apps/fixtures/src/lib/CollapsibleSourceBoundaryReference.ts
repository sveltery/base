// Source boundary witness against installed pinned Base UI1.8.0, MIT.
// No upstream declaration credit; pin47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Collapsible } from '@base-ui/react/collapsible';
export function mountSourceBoundary(target: HTMLElement, scenario: string) {
  const events: boolean[] = [], callbackOwners: string[] = [];
  function Fixture() {
    const [ownerOpen, setOwnerOpen] = useState<boolean | undefined>(scenario === 'controlled-consumer' ? false : undefined);
    const [switched, setSwitched] = useState(false);
    function oldChanged(next: boolean) { callbackOwners.push('old'); events.push(next); }
    function newChanged(next: boolean) { callbackOwners.push('new'); events.push(next); }
    return h(Collapsible.Root, { open: ownerOpen, onOpenChange: switched ? newChanged : oldChanged },
      h(Collapsible.Trigger, { id: 'tested-trigger', onClick() {
        if (scenario === 'controlled-consumer') setOwnerOpen(true);
        if (scenario === 'callback-snapshot') setSwitched(true);
      } }, 'Source control'));
  }
  const root = createRoot(target);
  flushSync(() => root.render(h(Fixture)));
  return { snapshot: () => ({ events, callbackOwners }), dispose: () => flushSync(() => root.unmount()) };
}

export function mountSourceRenderDimensionsBoundary(target: HTMLElement) {
  const root = createRoot(target);
  flushSync(() => root.render(h(Collapsible.Root, null,
    h(Collapsible.Panel, { keepMounted: true, render(props) {
      return h('div', { ...props, 'data-testid': 'dimension-boundary', style: { ...props.style, '--collapsible-panel-height': '73px' } });
    } }, 'Source content'))));
  return () => flushSync(() => root.unmount());
}
