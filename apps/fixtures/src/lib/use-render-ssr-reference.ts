import { createElement as h, useEffect, useState, useRef } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { useRender } from '@base-ui/react/use-render';
export function UseRenderSsrReference() {
  const [hydrated, setHydrated] = useState(false), [enabled, setEnabled] = useState(true), [active, setActive] = useState(true);
  const ref = useRef<Element>(null);
  useEffect(() => { setHydrated(true); }, []);
  const button = useRender({ defaultTagName: 'button', state: { active }, enabled, ref, props: { id: 'ssr-render', children: 'SSR children' } });
  const svg = useRender({ defaultTagName: 'svg', props: { id: 'ssr-svg', children: h('title', {}, 'SVG children') } });
  return h('main', { 'data-hydrated': hydrated, ref: (main: HTMLElement | null) => {
    if (main) Object.assign(main, { renderRefProbe: () => ref.current ? { tag: ref.current.tagName, id: ref.current.id, connected: ref.current.isConnected, same: ref.current === main.querySelector('#ssr-render') } : null });
  } }, h('button', { type: 'button', onClick: () => { setEnabled(false); setActive(false); } }, 'Remove'), button, svg);
}
export function hydrateUseRenderReference(node: HTMLElement) { const root = hydrateRoot(node, h(UseRenderSsrReference)); return () => root.unmount(); }
