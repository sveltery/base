// Execute the actual pinned helper; no replacement completion algorithm.
import { createElement as h, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useOpenChangeComplete } from '../../node_modules/@base-ui/react/internals/useOpenChangeComplete.js';
export { flushSync as flushAnimationCompletionReference } from 'react-dom';

export function mountAnimationCompletionReference(
  target: HTMLElement,
  finished: Promise<void>,
  batch: boolean,
  record: (channel: string) => void,
) {
  function Fixture() {
    const [enabled, setEnabled] = useState(true);
    const ref = useRef<HTMLDivElement | null>(null);
    useOpenChangeComplete({
      open: false,
      ref,
      batch,
      onComplete() {
        record('owner');
        setEnabled(false);
      },
    });
    useOpenChangeComplete({
      enabled,
      open: false,
      ref,
      batch,
      onComplete() {
        record('dependent');
      },
    });
    return h(
      'div',
      {
        ref(node: HTMLDivElement | null) {
          ref.current = node;
          if (node)
            Object.defineProperty(node, 'getAnimations', {
              configurable: true,
              value: () => [{ playState: 'running', finished }],
            });
        },
      },
      enabled ? 'enabled' : 'disabled',
    );
  }
  const root = createRoot(target);
  root.render(h(Fixture));
  return () => root.unmount();
}

export function mountDynamicAnimationCompletionReference(
  target: HTMLElement,
  finished: Promise<void>,
  initialBatch: boolean,
  record: (channel: string) => void,
  queried: () => void,
) {
  let change!: (value: boolean) => void;
  function Fixture() {
    const [batch, setBatch] = useState(initialBatch);
    change = setBatch;
    const [enabled, setEnabled] = useState(true);
    const ref = useRef<HTMLDivElement | null>(null);
    useOpenChangeComplete({
      open: false,
      ref,
      batch,
      onComplete() {
        record('owner');
        setEnabled(false);
      },
    });
    useOpenChangeComplete({
      enabled,
      open: false,
      ref,
      batch,
      onComplete() {
        record('dependent');
      },
    });
    return h(
      'section',
      null,
      h('div', {
        ref(node: HTMLDivElement | null) {
          ref.current = node;
          if (node)
            Object.defineProperty(node, 'getAnimations', {
              configurable: true,
              value: () => {
                queried();
                return [{ playState: 'running', finished }];
              },
            });
        },
      }),
      h('output', { 'data-status': '' }, enabled ? 'enabled' : 'disabled'),
      h('output', { 'data-batch': '' }, String(batch)),
    );
  }
  const root = createRoot(target);
  root.render(h(Fixture));
  return {
    setBatch(value: boolean) {
      change(value);
    },
    stop() {
      root.unmount();
    },
  };
}
