// Exact Base UI v1.8.0 SSR/hydration fixture. MIT: parity/collapsible/UPSTREAM_LICENSE.
import { createElement as h, Fragment, useEffect } from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { collapsibleCss } from './collapsible-config.js';
export function CollapsibleSSRReference({ scenario, onHydrated }: { scenario: string; onHydrated?: () => void }) {
  const panelProps = { 'data-testid': 'panel', className: 'keys',
    style: scenario === 'keys-inline' ? { animationDuration: '100ms', animationName: 'panel-down', animationTimingFunction: 'linear' } : undefined,
  };
  useEffect(() => { onHydrated?.(); }, [onHydrated]);
  return h(Fragment, null, h('style', null, collapsibleCss),
    h(Collapsible.Root, { defaultOpen: true },
      h(Collapsible.Trigger, { id: 'tested-trigger' }, 'Trigger'),
      h(Collapsible.Panel, panelProps, 'This is panel content')));
}
