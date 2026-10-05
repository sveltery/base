import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { NavigationMenuReference } from '../../lib/navigation-menu-reference.js';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'default';
  const reference = url.searchParams.has('reference');
  const direction = url.searchParams.get('direction') === 'rtl' ? 'rtl' as const : 'ltr' as const;
  const orientation = url.searchParams.get('orientation') === 'vertical' ? 'vertical' as const : 'horizontal' as const;
  return { scenario, reference, direction, orientation, html: reference ? renderToString(createElement(NavigationMenuReference, { scenario, direction, orientation })) : '' };
}
