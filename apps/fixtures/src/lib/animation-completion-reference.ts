// Execute the actual pinned helper; no replacement completion algorithm.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useOpenChangeComplete } from '../../node_modules/@base-ui/react/internals/useOpenChangeComplete.js';

export function mountAnimationCompletionReference(target: HTMLElement, finished: Promise<void>, batch: boolean, record: (channel: string) => void) {
  function Fixture() {
    const [enabled, setEnabled] = useState(true);
    const ref = useRef<HTMLDivElement | null>(null);
    useOpenChangeComplete({ open: false, ref, batch, onComplete() { record('owner'); setEnabled(false); } });
    useOpenChangeComplete({ enabled, open: false, ref, batch, onComplete() { record('dependent'); } });
    return h('div', { ref(node: HTMLDivElement | null) {
      ref.current = node;
      if (node) Object.defineProperty(node, 'getAnimations', { configurable: true, value: () => [{ playState: 'running', finished }] });
    } }, enabled ? 'enabled' : 'disabled');
  }
  const root = createRoot(target); root.render(h(Fixture));
  return () => root.unmount();
}
