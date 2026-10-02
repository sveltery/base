#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
csp_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-csp-consumer.XXXXXX")"
trap 'rm -rf "$csp_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$csp_consumer" > /dev/null
node --input-type=module - "$csp_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$csp_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$csp_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$csp_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$csp_consumer/node_modules/@sveltery/base/LICENSE"
cat > "$csp_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { CSPProvider, type CSPProviderProps, type CSPProviderState } from '@sveltery/base';
  import { CSPProvider as Second, type CSPProviderProps as SecondProps, type CSPProviderState as SecondState } from '@sveltery/base/csp-provider';
  const first: CSPProviderProps = { nonce: 'root', disableStyleElements: true };
  const second: SecondProps = { nonce: undefined, disableStyleElements: undefined };
  const state: CSPProviderState = 1;
  const other: SecondState = {};
  const namespaceProps: CSPProvider.Props = { nonce: 'root' };
  const subpathNamespaceProps: Second.Props = { disableStyleElements: false };
  const namespaceStates: [CSPProvider.State, Second.State] = [1, {}];
  void [state, other, namespaceProps, subpathNamespaceProps, namespaceStates];
</script>
<main><CSPProvider {...first}><span>root child</span><Second {...second}><em>subpath child</em></Second></CSPProvider><Second /></main>
SVELTE
cat > "$csp_consumer/public-types.ts" <<'TS'
import type { ComponentProps, Snippet } from 'svelte';
import { CSPProvider, type CSPProviderProps, type CSPProviderState } from '@sveltery/base';
import { CSPProvider as Second, type CSPProviderProps as SecondProps, type CSPProviderState as SecondState } from '@sveltery/base/csp-provider';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const equality: Equal<[CSPProviderProps, CSPProviderState, ComponentProps<typeof CSPProvider>], [SecondProps, SecondState, ComponentProps<typeof Second>]> = true;
const snippet: Equal<CSPProviderProps['children'], Snippet | undefined> = true;
const namespaces: Equal<[CSPProvider.Props, CSPProvider.State, Second.Props, Second.State], [CSPProviderProps, CSPProviderState, SecondProps, SecondState]> = true;
// @ts-expect-error The type-only namespace does not add a component state prop.
const invalidStateProp: Second.Props = { state: {} };
// @ts-expect-error Nonces retain string type.
const invalidNonce: SecondProps = { nonce: 1 };
// @ts-expect-error No DOM host attributes exist.
const invalidHost: CSPProviderProps = { id: 'host' };
// @ts-expect-error ReactNode text is not a snippet.
const invalidChildren: CSPProviderProps = { children: 'text' };
void [namespaces, invalidStateProp, equality, snippet, invalidNonce, invalidHost, invalidChildren];
TS
cat > "$csp_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { CSPProvider } from '@sveltery/base';
import { CSPProvider as Second } from '@sveltery/base/csp-provider';
assert.equal(CSPProvider, Second);
assert.equal('Props' in CSPProvider, false);
assert.equal('State' in CSPProvider, false);
const body = render(Consumer).body.replace(/<!--[\s\S]*?-->/g, '');
assert.equal(body, '<main><span>root child</span><em>subpath child</em></main>');
assert.equal(render(Second).body.replace(/<!--[\s\S]*?-->/g, ''), '');
assert.match(readFileSync(new URL('./node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8'), /CSPProvider[\s\S]*47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/);
JS
cat > "$csp_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$csp_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$csp_consumer" --tsconfig ./tsconfig.json
echo 'Isolated tarball CSPProvider public root/subpath SSR, types and license: PASS'
