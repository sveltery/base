import { renderToString } from 'react-dom/server';
import { alertHydrationTree } from '$lib/alert-dialog-hydration-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference');
  return { reference, html: reference ? renderToString(alertHydrationTree()) : '' };
}
