import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MeterSsrReference } from '../../lib/meter-ssr-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference');
  return { reference, html: reference ? renderToString(createElement(MeterSsrReference)) : '' };
}
