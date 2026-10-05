import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { render } from 'svelte/server';
import Native from '../../../lib/NavigationMenuPartsSourceFixture.svelte';
import { NavigationMenuPartsOriginal } from '../../../lib/navigation-menu-parts-source-original.js';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'content-kept';
  const reference = url.searchParams.has('reference');
  const hydrate = url.searchParams.has('hydrate');
  const html = !hydrate ? '' : reference ? renderToString(createElement(NavigationMenuPartsOriginal, { scenario })) : render(Native, { props: { scenario } }).body;
  return { scenario, reference, hydrate, html: hydrate ? `<div data-testid="parts-hydration-host">${html}</div>` : html };
}
