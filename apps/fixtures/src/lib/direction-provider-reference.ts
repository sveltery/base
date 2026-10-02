// Immutable Base UI 1.8.0 reference; MIT: parity/direction-provider/UPSTREAM_LICENSE.
import { createElement as h, useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { DirectionProvider, useDirection, type TextDirection } from '@base-ui/react/direction-provider';
export { flushSync as flushDirectionReference } from 'react-dom';

function DirectionProbe({ id = 'direction', beforeRead }: { id?: string; beforeRead?: () => void }) {
  const direction = useDirection();
  const [observed, setObserved] = useState('');
  return [h('span', { 'data-testid': id, key: 'direction' }, direction), beforeRead ? h('button', { key: 'read', onClick: () => {
    const before = direction; beforeRead(); setObserved(`${before}|${direction}`);
  } }, 'Read across owner write') : null, beforeRead ? h('output', { 'data-testid': 'read-observation', key: 'observation' }, observed) : null];
}

export function DirectionProviderReference({ scenario = 'configured' }: { scenario?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [direction, setDirection] = useState<TextDirection | undefined>(scenario === 'default' ? undefined : 'rtl');
  const [innerDirection, setInnerDirection] = useState<TextDirection | undefined>();
  const [shown, setShown] = useState(true);
  useEffect(() => { setHydrated(true); }, []);
  const probes = scenario === 'outside' ? h(DirectionProbe) : scenario === 'nested'
    ? [h(DirectionProvider, { direction, key: 'provider' }, h(DirectionProbe, { id: 'outer-before' }),
      shown ? h(DirectionProvider, { direction: innerDirection }, h(DirectionProbe, { id: 'inner' })) : null,
      h(DirectionProbe, { id: 'outer-after' })), h(DirectionProbe, { id: 'outside', key: 'outside' })]
    : h(DirectionProvider, { direction }, h(DirectionProbe, { beforeRead: scenario === 'timing' ? () => setDirection('ltr') : undefined }));
  return h('main', { 'data-hydrated': hydrated },
    h('button', { onClick: () => setDirection('ltr') }, 'Set LTR'),
    h('button', { onClick: () => setDirection('rtl') }, 'Set RTL'),
    h('button', { onClick: () => setDirection(undefined) }, 'Clear direction'),
    h('button', { onClick: () => setInnerDirection('rtl') }, 'Set inner RTL'),
    h('button', { onClick: () => setInnerDirection('ltr') }, 'Set inner LTR'),
    h('button', { onClick: () => setInnerDirection(undefined) }, 'Clear inner direction'),
    h('button', { onClick: () => setShown(previous => !previous) }, 'Toggle inner'),
    h('section', { 'data-testid': 'provider-host' }, probes));
}

export function mountDirectionProviderReference(node: HTMLElement, scenario: string) {
  const root = createRoot(node); root.render(h(DirectionProviderReference, { scenario }));
  return () => root.unmount();
}
export function hydrateDirectionProviderReference(node: HTMLElement, scenario: string) {
  const root = hydrateRoot(node, h(DirectionProviderReference, { scenario }));
  return () => root.unmount();
}
