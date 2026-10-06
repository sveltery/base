// Actual Base UI 1.8.0 Input at the immutable behavior pin. MIT: parity/input/UPSTREAM_LICENSE.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Input } from '@base-ui/react/input';
import type { TimingDecision, TimingRecorder } from './types.js';
export function mountTimingReference(
  target: HTMLElement,
  decision: TimingDecision,
  record: TimingRecorder,
  preventBase = false,
) {
  function Fixture() {
    const [owner, setOwner] = useState('owner');
    return h(
      'main',
      null,
      h(
        'form',
        { 'data-testid': 'timing-form' },
        h(Input, {
          name: 'field',
          value: owner,
          ...{ 'data-testid': 'timing-input' },
          onChange(event) {
            if (preventBase) {
              record('consumer:prevent-base');
              event.preventBaseUIHandler();
            }
          },
          onValueChange(next) {
            record('callback:before-owner', next);
            if (decision === 'accept') setOwner(next);
            else if (decision === 'rewrite') setOwner(next.toUpperCase());
            record('callback:after-owner', next);
          },
        }),
      ),
      h('output', { 'data-testid': 'timing-owner' }, owner),
    );
  }
  const root = createRoot(target);
  flushSync(() => root.render(h(Fixture)));
  return () => root.unmount();
}
