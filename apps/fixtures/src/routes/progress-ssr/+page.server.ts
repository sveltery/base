import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ProgressSsrReference } from '../../lib/progress-ssr-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference');
  return { reference, html: reference ? renderToString(createElement(ProgressSsrReference)) : '' };
}
