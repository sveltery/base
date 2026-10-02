import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { AccordionSSRReference } from '../../lib/accordion-ssr-reference.js';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'hydration', reference = url.searchParams.has('reference');
  return { scenario, reference, html: reference ? renderToString(h(AccordionSSRReference, { scenario })) : '' };
}
