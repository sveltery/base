import { renderToString } from 'react-dom/server';
import { hydrationTree } from '$lib/dialog-handle-hydration-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference');
  return { reference, html: reference ? renderToString(hydrationTree().children) : '' };
}
