// React renderToString assertion fixture at the immutable Base UI 1.8.0 pin.
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Collapsible } from '@base-ui/react/collapsible';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'keys-initial';
  const reference = url.searchParams.has('reference');
  return { scenario, reference, html: reference ? renderToString(h(Collapsible.Root, { defaultOpen: true }, h(Collapsible.Trigger, { id: 'tested-trigger' }, 'Trigger'), h(Collapsible.Panel, { ...{ 'data-testid': 'panel' }, className: 'keys', style: scenario === 'keys-inline' ? { animationDuration: '100ms', animationName: 'panel-down', animationTimingFunction: 'linear' } : undefined }, 'This is panel content'))) : '' };
}
