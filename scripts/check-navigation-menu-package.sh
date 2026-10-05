#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
navigation_menu_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-navigation-menu-consumer.XXXXXX")"
trap 'rm -rf "$navigation_menu_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$navigation_menu_consumer" > /dev/null
node --input-type=module - "$navigation_menu_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find((name) => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$navigation_menu_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$navigation_menu_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$navigation_menu_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/base/THIRD_PARTY_NOTICES.md "$navigation_menu_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$navigation_menu_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  import { NavigationMenu as RootNamespace } from '@sveltery/base';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
  const stringValue = 'item-1';
  const nullableValue: string | null = 'item-1';
  const UnionRoot = NavigationMenu.Root<'a' | 'b'>;
  const NullableRoot = NavigationMenu.Root<string | null>;
  const stringHandler: NavigationMenu.Root.Props<string>['onValueChange'] = value => { const exact: Equal<typeof value, string | null> = true; void exact; };
  const numberHandler: NavigationMenu.Root.Props<number>['onValueChange'] = value => { const exact: Equal<typeof value, number | null> = true; void exact; };
  const unionHandler: NavigationMenu.Root.Props<'a' | 'b'>['onValueChange'] = value => { const exact: Equal<typeof value, 'a' | 'b' | null> = true; void exact; };
  const nullableHandler: NavigationMenu.Root.Props<string | null>['onValueChange'] = value => { const exact: Equal<typeof value, string | null> = true; void exact; };
  type IsAny<T> = 0 extends (1 & T) ? true : false;
  const defaultHandler: NavigationMenu.Root.Props['onValueChange'] = value => { const exact: IsAny<typeof value> = true; void exact; };
  const explicitHandler: NonNullable<NavigationMenu.Root.Props<'a'>['onValueChange']> = value => { const exact: Equal<typeof value, 'a' | null> = true; void exact; };
  const inferredDefault: NonNullable<NavigationMenu.Root.Props['onValueChange']> = value => { const exact: IsAny<typeof value> = true; void exact; };
  const alias: Equal<NavigationMenu.Root.Props<'a'>, RootNamespace.Root.Props<'a'>> = true;
  let actions: NavigationMenu.Root.Actions | null = $state(null);
  const rootState: NavigationMenu.Root.State = { open: false, nested: false };
  const selected: NavigationMenu.Root.Value<number> = 0;
  // @ts-expect-error The Original explicit generic excludes 'c'.
  const invalid: NavigationMenu.Root.Props<'a' | 'b'> = { value: 'c' };
  // @ts-expect-error The Source action surface contains only unmount.
  const invalidAction: keyof NavigationMenu.Root.Actions = 'open';
  const keep: NavigationMenu.Content.Props = { keepMounted: true };
  const item: NavigationMenu.Item.Props = { value: false };
  const linked: NavigationMenu.Link.Props = { href: '/products', active: true, closeOnClick: true };
  const snippet: Snippet<[HTMLAnchorAttributes, NavigationMenu.Link.State, Snippet | undefined]> | undefined = undefined;
  void [alias, rootState, selected, invalid, invalidAction, keep, item, linked, snippet];
</script>
<!-- Original Root.spec.tsx:10/17/25/32/39 actual component inference. -->
<NavigationMenu.Root value={stringValue} onValueChange={value => { const exact: Equal<typeof value, string | null> = true; void exact; }} />
<NavigationMenu.Root defaultValue={1} onValueChange={value => { const exact: Equal<typeof value, number | null> = true; void exact; }} />
<UnionRoot onValueChange={value => { const exact: Equal<typeof value, 'a' | 'b' | null> = true; void exact; }} />
<NullableRoot value={nullableValue} onValueChange={value => { const exact: Equal<typeof value, string | null> = true; void exact; }} />
<NavigationMenu.Root onValueChange={value => { const exact: IsAny<typeof value> = true; void exact; }} />
<NavigationMenu.Root value={stringValue} onValueChange={stringHandler} />
<NavigationMenu.Root defaultValue={1} onValueChange={numberHandler} />
<NavigationMenu.Root value={'a' as 'a' | 'b'} onValueChange={unionHandler} />
<NavigationMenu.Root value={nullableValue} onValueChange={nullableHandler} />
<NavigationMenu.Root onValueChange={defaultHandler} />
<NavigationMenu.Root onValueChange={explicitHandler} />
<NavigationMenu.Root onValueChange={inferredDefault} />
<NavigationMenu.Root bind:actions>
  <NavigationMenu.List><NavigationMenu.Item value={0}>
    <NavigationMenu.Trigger>Products <NavigationMenu.Icon /></NavigationMenu.Trigger>
    <NavigationMenu.Content keepMounted><NavigationMenu.Link {...linked}>
      {#snippet render(props, state, children)}
        {const hrefType: Equal<typeof props.href, HTMLAnchorAttributes['href']> = true}
        <a {...props} data-active={state.active} data-type={hrefType}>{@render children?.()}</a>
      {/snippet}
      Products
    </NavigationMenu.Link></NavigationMenu.Content>
  </NavigationMenu.Item></NavigationMenu.List>
  <NavigationMenu.Portal keepMounted><NavigationMenu.Backdrop /><NavigationMenu.Positioner>
    <NavigationMenu.Popup><NavigationMenu.Arrow /><NavigationMenu.Viewport /></NavigationMenu.Popup>
  </NavigationMenu.Positioner></NavigationMenu.Portal>
</NavigationMenu.Root>
SVELTE
cat > "$navigation_menu_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { NavigationMenu as Root } from '@sveltery/base';
import { NavigationMenu as Subpath } from '@sveltery/base/navigation-menu';
import Consumer from './Consumer.svelte';
const parts = ['Root', 'List', 'Item', 'Content', 'Trigger', 'Portal', 'Positioner', 'Viewport', 'Backdrop', 'Popup', 'Arrow', 'Link', 'Icon'];
assert.deepEqual(Object.keys(Subpath).sort(), parts.toSorted());
for (const part of parts) assert.equal(Root[part], Subpath[part]);
const html = render(Consumer).body;
assert.match(html, /<nav/);
assert.match(html, /<ul/);
assert.match(html, /<li/);
assert.match(html, /aria-expanded="false"/);
assert.match(html, /hidden/);
assert.match(html, /Products/);
assert.doesNotMatch(html, /data-base-ui-portal/);
JS
cat > "$navigation_menu_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$navigation_menu_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$navigation_menu_consumer" --tsconfig ./tsconfig.json
echo 'Isolated installed NavigationMenu public root/subpath, thirteen parts, SSR and strict types: PASS'
