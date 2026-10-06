// React renderToString assertion fixture at the immutable Base UI 1.8.0 pin.
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { CollapsibleSSRReference } from '../../lib/collapsible-ssr-reference.js';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'keys-initial';
  const reference = url.searchParams.has('reference');
  return {
    scenario,
    reference,
    html: reference ? renderToString(h(CollapsibleSSRReference, { scenario })) : '',
  };
}
