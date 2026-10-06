import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { render } from 'svelte/server';
import AvatarSsr from '../../lib/avatar-ssr.svelte';
import { AvatarSsrReference } from '../../lib/avatar-ssr-reference.js';
export function load({ url }: { url: URL }) {
  const reference = url.searchParams.has('reference'),
    keepMounted = url.searchParams.has('keep');
  return {
    reference,
    keepMounted,
    html: reference
      ? renderToString(createElement(AvatarSsrReference, { keepMounted }))
      : render(AvatarSsr, { props: { keepMounted } }).body,
  };
}
