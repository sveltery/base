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
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: {
  '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1', '@base-ui/react': '1.8.0',
  react: '19.2.8', 'react-dom': '19.2.8', '@types/react': '19.2.18', '@types/react-dom': '19.2.4',
} }));
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
  import Wrapper from './Wrapper.svelte';
  type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
  const stringValue = 'item-1';
  const nullableValue: string | null = 'item-1';
  const UnionRoot = NavigationMenu.Root<'a' | 'b'>;
  const NullableRoot = NavigationMenu.Root<string | null>;
  const ARoot = NavigationMenu.Root<'a'>;
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
  // @ts-expect-error The actual public component's explicit generic also excludes 'c'.
  const invalidComponent: Parameters<typeof UnionRoot>[1] = { value: 'c' };
  // @ts-expect-error The Source action surface contains only unmount.
  const invalidAction: keyof NavigationMenu.Root.Actions = 'open';
  const keep: NavigationMenu.Content.Props = { keepMounted: true };
  const item: NavigationMenu.Item.Props = { value: false };
  const linked: NavigationMenu.Link.Props = { href: '/products', active: true, closeOnClick: true };
  const snippet: Snippet<[HTMLAnchorAttributes, NavigationMenu.Link.State, Snippet | undefined]> | undefined = undefined;
  void [alias, rootState, selected, invalid, invalidComponent, invalidAction, keep, item, linked, snippet];
</script>
<!-- Original Root.spec.tsx:10/17/25/32/39 actual component inference. -->
<NavigationMenu.Root value={stringValue} onValueChange={value => { const exact: Equal<typeof value, string | null> = true; void exact; }} />
<NavigationMenu.Root defaultValue={1} onValueChange={value => { const exact: Equal<typeof value, number | null> = true; void exact; }} />
<UnionRoot onValueChange={value => { const exact: Equal<typeof value, 'a' | 'b' | null> = true; void exact; }} />
<UnionRoot value="a" />
<NullableRoot value={nullableValue} onValueChange={value => { const exact: Equal<typeof value, string | null> = true; void exact; }} />
<NavigationMenu.Root onValueChange={value => { const exact: IsAny<typeof value> = true; void exact; }} />
<NavigationMenu.Root value={stringValue} onValueChange={stringHandler} />
<NavigationMenu.Root defaultValue={1} onValueChange={numberHandler} />
<NavigationMenu.Root value={'a' as 'a' | 'b'} onValueChange={unionHandler} />
<NavigationMenu.Root value={nullableValue} onValueChange={nullableHandler} />
<NavigationMenu.Root onValueChange={defaultHandler} />
<ARoot onValueChange={explicitHandler} />
<NavigationMenu.Root onValueChange={inferredDefault} />
<Wrapper value={1} />
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
cat > "$navigation_menu_consumer/Wrapper.svelte" <<'SVELTE'
<script lang="ts" generics="Value">
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  let props: NavigationMenu.Root.Props<Value> = $props();
</script>
<NavigationMenu.Root {...props} />
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
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"jsx":"react-jsx","lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts","*.tsx"]}
JSON
node --input-type=module - "$navigation_menu_consumer" "$sveltery_repo_root" <<'JS'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [destination, repo] = process.argv.slice(2);
const archive = join(repo, 'parity/navigation-menu/original-source.tar.gz');
const inventory = JSON.parse(readFileSync(join(repo, 'parity/navigation-menu/original-assertions.json')));
for (const [part, subpath] of [['Root', 'root'], ['Link', 'link']]) {
  const source = `packages/react/src/navigation-menu/${subpath}/NavigationMenu${part}.spec.tsx`;
  const body = execFileSync('tar', ['-xOf', archive, `./${source}`], { encoding: 'utf8' });
  assert.equal(createHash('sha256').update(body).digest('hex'), inventory.files.find(file => file.source === source).sha256);
  // Only the selected test-helper import is adapted; every Original assertion
  // and negative directive remains the immutable archived body.
  writeFileSync(join(destination, `Original${part}.tsx`), body.replace("from '#test-utils'", "from './OriginalTestUtils.js'"));
}
writeFileSync(join(destination, 'OriginalTestUtils.ts'), execFileSync('tar', ['-xOf', archive, './packages/utils/src/testUtils.ts']));
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$navigation_menu_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$navigation_menu_consumer" --tsconfig ./tsconfig.json
echo 'Isolated installed NavigationMenu public root/subpath, thirteen parts, SSR, actual Original and native strict types: PASS'
