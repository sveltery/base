#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
tabs_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-tabs-consumer.XXXXXX")"
trap 'rm -rf "$tabs_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$tabs_consumer" > /dev/null
node --input-type=module - "$tabs_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$tabs_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$tabs_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$tabs_consumer/node_modules/@sveltery/base/LICENSE"
cat > "$tabs_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Tabs, TabsTab, TabsPanel, CSPProvider } from '@sveltery/base';
  import { Tabs as Parts } from '@sveltery/base/tabs';
  import type { HTMLAttributes } from 'svelte/elements';
  let tab = $state<HTMLElement | null>();
  let list = $state<HTMLElement | null>();
  let panel = $state<HTMLElement | null>();
</script>
<CSPProvider nonce={'safe"nonce'}>
  <Tabs.Root defaultValue="first" orientation={undefined} onValueChange={(value, details) => { const native: Event = details.event; details.cancel(); void [value, native, details.activationDirection]; }}>
    <Tabs.List bind:ref={list} activateOnFocus={undefined} loopFocus={undefined} class={(state) => state.orientation} style={() => undefined}>
      <TabsTab value="first" bind:ref={tab} nativeButton={undefined} disabled={undefined} onclick={(event) => { const native: MouseEvent = event; event.preventBaseUIHandler(); void native; }}>
        {#snippet render(props, state, children)}<button {...props as HTMLAttributes<HTMLButtonElement>} data-active={state.active}>{@render children?.()}</button>{/snippet}
        First
      </TabsTab>
      <Parts.Tab value="second" class={['second', { conditional: true }]} style="color:red">Second</Parts.Tab>
      <Parts.Indicator renderBeforeHydration />
    </Tabs.List>
    <TabsPanel value="first" bind:ref={panel}>First content</TabsPanel>
    <Parts.Panel value="second" keepMounted>Retained content</Parts.Panel>
  </Tabs.Root>
</CSPProvider>
<Parts.Root defaultValue={null}><Parts.List><Parts.Tab value={{ identity: true }}>Object</Parts.Tab><Tabs.Indicator /></Parts.List><Tabs.Panel value={null}>Null content</Tabs.Panel></Parts.Root>
SVELTE
node --input-type=module - "$tabs_consumer" <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const original = readFileSync('packages/base/tests/tabs.types.ts', 'utf8');
writeFileSync(join(directory, 'PublicTypes.ts'), original.replaceAll("'../src/lib/tabs/index.js'", "'@sveltery/base/tabs'") + `
import type * as Package from '@sveltery/base';
import { Tabs } from '@sveltery/base/tabs';
const rootNamed: Package.TabsRootProps = root;
const rootAlias: Tabs.Root.Props = root;
const indicatorAlias: Tabs.Indicator.State = { orientation: 'horizontal', tabActivationDirection: 'none', activeTabPosition: null, activeTabSize: null };
const fromComponent: ComponentProps<typeof Tabs.Root> = root;
// @ts-expect-error Source boolean flag cannot be null.
const invalidFlag: ComponentProps<typeof TabsTab> = { value: 0, disabled: null };
// @ts-expect-error Native ref binding receives an element, not a string.
const invalidRef: ComponentProps<typeof TabsPanel> = { value: 0, ref: 'wrong' };
// @ts-expect-error Source indicator geometry is nullable, not omitted.
const invalidState: Package.TabsIndicatorState = { orientation: 'horizontal', tabActivationDirection: 'none' };
void [rootNamed, rootAlias, indicatorAlias, fromComponent, invalidFlag, invalidRef, invalidState];
`);
JS
cat > "$tabs_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { Tabs, TabsRoot, TabsList, TabsTab, TabsPanel, TabsIndicator } from '@sveltery/base';
import * as Parts from '@sveltery/base/tabs';
import Consumer from './Consumer.svelte';
assert.deepEqual(Object.keys(Tabs).sort(), ['Indicator', 'List', 'Panel', 'Root', 'Tab']);
for (const [name, Component] of Object.entries({ Root: TabsRoot, List: TabsList, Tab: TabsTab, Panel: TabsPanel, Indicator: TabsIndicator })) {
  assert.equal(Tabs[name], Component);
  assert.equal(Parts[`Tabs${name}`], Component);
  assert.equal(Parts.Tabs[name], Component);
}
const body = render(Consumer).body;
const markup = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
assert.equal((markup.match(/role="tablist"/g) ?? []).length, 2);
assert.equal((markup.match(/role="tab"/g) ?? []).length, 3);
assert.equal((markup.match(/role="tabpanel"/g) ?? []).length, 3);
assert.match(body, /aria-selected="true"/);
assert.match(body, /Retained content/);
assert.match(body, / inert/);
assert.match(body, /nonce="safe&quot;nonce"/);
assert.match(body, /class="second conditional"/);
assert.match(body, /style="color:red"/);
const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length);
assert(readFileSync(new URL('./node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8').includes('Tabs Root/List/Tab/Panel/Indicator'));
console.log('Isolated public Tabs root/subpath/all Source aliases, namespace declarations, native ref/class/style/render, SSR, MIT: PASS');
JS
cat > "$tabs_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$tabs_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$tabs_consumer" --tsconfig ./tsconfig.json
