import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { UseRenderSsrReference } from '../../lib/use-render-ssr-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference');
  return { reference, html: reference ? renderToString(createElement(UseRenderSsrReference)) : '' };
}
