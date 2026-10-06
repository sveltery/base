import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ButtonSourceReference } from '../../lib/button-source-reference.js';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'composite-custom';
  const reference = url.searchParams.has('reference');
  return {
    scenario,
    reference,
    html: reference ? renderToString(createElement(ButtonSourceReference, { scenario })) : '',
  };
}
