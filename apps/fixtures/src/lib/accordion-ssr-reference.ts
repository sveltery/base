// Immutable Base UI 1.8.0 SSR fixture. MIT: parity/accordion/UPSTREAM_LICENSE.
import { createElement as h, Fragment, useEffect } from 'react';
import { Accordion } from '@base-ui/react/accordion';
import { accordionCss } from './accordion-config.js';
export function AccordionSSRReference({ scenario, onHydrated }: { scenario: string; onHydrated?: () => void }) {
  useEffect(() => { onHydrated?.(); }, [onHydrated]);
  return h(Fragment, null, h('style', null, accordionCss), h(Accordion.Root, { defaultValue: [0] },
    h(Accordion.Item, { value: 0 }, h(Accordion.Header, null, h(Accordion.Trigger, { ...{ 'data-testid': 'trigger-1' }, id: undefined }, 'Trigger 1')),
      h(Accordion.Panel, { ...{ 'data-testid': 'panel-1' }, style: scenario === 'ssr-inline' ? { animationDuration: '100ms', animationName: 'accordion-down', animationTimingFunction: 'linear' } : undefined }, 'Panel contents 1'))));
}
