// Actual SSR/parser/hydration reference endpoint, no library framework dependency.
import { render } from 'svelte/server';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import Fixture from '../../lib/TabsBrowserFixture.svelte';
import { TabsReferenceFixture } from '../../lib/tabs-reference.js';
const styles =
  '.tabs-list{position:relative;display:flex;width:400px;padding:4px;border:2px solid transparent;gap:4px;overflow:auto}.tabs-list[data-orientation=vertical]{flex-direction:column;height:190px}.tabs-tab{display:block;box-sizing:border-box;width:100px;height:40px;padding:6px;border:0;background:#eee}.tabs-indicator{position:absolute;width:var(--active-tab-width);height:var(--active-tab-height);left:var(--active-tab-left);top:var(--active-tab-top);border:2px solid blue;pointer-events:none;box-sizing:border-box}';
export function GET({ url }: { url: URL }) {
  const framework = url.searchParams.get('framework') ?? 'svelte',
    scenario = url.searchParams.get('scenario') ?? 'selected-last-prehydrate';
  const body =
    framework === 'react'
      ? renderToString(createElement(TabsReferenceFixture, { scenario }))
      : render(Fixture, { props: { scenario } }).body;
  const loader =
    url.searchParams.get('hydrate') === 'true'
      ? `<script nonce="tabs-nonce" type="module">import { hydrateTabs } from '/src/lib/tabs-hydration.ts';hydrateTabs(${JSON.stringify(framework)},${JSON.stringify(scenario)});</script>`
      : '';
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><style>${styles}</style></head><body><div id="hydration-host"${url.searchParams.get('hidden') === 'true' ? ' style="display:none"' : ''}>${body}</div>${loader}</body></html>`,
    {
      headers: {
        'content-type': 'text/html',
        'content-security-policy':
          "default-src 'self'; script-src 'nonce-tabs-nonce' 'strict-dynamic'; style-src 'unsafe-inline'; connect-src 'self' ws:;",
      },
    },
  );
}
