// Actual immutable Base UI1.8.0 ordinary render-host swap; authored supplement, no assertion credit.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Menu } from '@base-ui/react/menu';

export function mountMenuTriggerHostOverlapReference(target: HTMLElement) {
  const root = createRoot(target);
  const handle = Menu.createHandle();
  let host: HTMLElement | null = null;
  let previousHost: HTMLElement | null = null;
  let swapped = false;
  let shown = true;
  const setHost = (node: HTMLElement | null) => {
    host = node;
  };
  const e = React.createElement;
  const render = () =>
    flushSync(() =>
      root.render(
        e(
          Menu.Root,
          { handle },
          shown
            ? e(Menu.Trigger, {
                id: 'host-overlap-trigger',
                nativeButton: false,
                ref: setHost,
                render: swapped
                  ? e('a', { href: '#host-overlap', 'data-host': 'after' }, 'Open')
                  : e('button', { type: 'button', 'data-host': 'before' }, 'Open'),
              })
            : null,
        ),
      ),
    );
  render();
  // Inspection of the actual pinned private Store; no alternate registration algorithm.
  const map = (
    handle as unknown as {
      store: { context: { triggerElements: { getById(id: string): Element | undefined } } };
    }
  ).store.context.triggerElements;
  return {
    swapHost() {
      previousHost = host;
      swapped = true;
      render();
    },
    removeTrigger() {
      shown = false;
      render();
    },
    boundHost: () => host,
    triggerMap: () => map,
    snapshot() {
      const registered = map.getById('host-overlap-trigger');
      return {
        boundHost: host?.dataset.host ?? null,
        registeredHost: (registered as HTMLElement | undefined)?.dataset.host ?? null,
        oldOutroEnded: true,
        beforeConnected: previousHost?.isConnected ?? false,
        currentConnected: host?.isConnected ?? false,
      };
    },
    stop() {
      flushSync(() => root.unmount());
    },
  };
}
