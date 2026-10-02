import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { DirectionProviderReference } from '../../lib/direction-provider-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference');
  const scenario = url.searchParams.get('case') ?? 'nested';
  return { reference, scenario, html: reference ? renderToString(createElement(DirectionProviderReference, { scenario })) : '' };
}
