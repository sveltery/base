import { createElement as h, useEffect, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Progress } from '@base-ui/react/progress';
export function ProgressSsrReference() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return h('main', { 'data-hydrated': hydrated }, h(Progress.Root, { value: 30, id: 'ssr-progress' }, h(Progress.Label, {}, 'SSR label'), h(Progress.Value, { id: 'ssr-value', ...{ 'data-testid': 'ssr-value' } }), h(Progress.Track, {}, h(Progress.Indicator))));
}
export function hydrateProgressReference(node: HTMLElement) { const root = hydrateRoot(node, h(ProgressSsrReference)); return () => root.unmount(); }
