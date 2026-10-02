import { createElement as h, useEffect, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Meter } from '@base-ui/react/meter';
export function MeterSsrReference() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return h('main', { 'data-hydrated': hydrated }, h(Meter.Root, { value: 30, id: 'ssr-meter' }, h(Meter.Label, {}, 'SSR label'), h(Meter.Value, { id: 'ssr-value', ...{ 'data-testid': 'ssr-value' } }), h(Meter.Track, {}, h(Meter.Indicator))));
}
export function hydrateMeterReference(node: HTMLElement) { const root = hydrateRoot(node, h(MeterSsrReference)); return () => root.unmount(); }
