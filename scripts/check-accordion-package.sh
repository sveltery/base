#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
accordion_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-accordion-consumer.XXXXXX")"
trap 'rm -rf "$accordion_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$accordion_consumer" > /dev/null
mkdir -p "$accordion_consumer/node_modules/@sveltery/base"
tar -xzf "$accordion_consumer"/*.tgz --strip-components=1 -C "$accordion_consumer/node_modules/@sveltery/base"
test -f "$accordion_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$accordion_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  node --input-type=module - "$accordion_consumer" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const packed = JSON.parse(readFileSync(join(destination, 'node_modules/@sveltery/base/package.json'), 'utf8'));
assert.equal(packed.dependencies?.['esm-env'], '1.2.2');
assert.equal(packed.exports?.['./accordion']?.types, './dist/accordion/index.d.ts');
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
  rm -rf "$accordion_consumer/node_modules"
  pnpm --dir "$accordion_consumer" --ignore-workspace install --ignore-scripts > /dev/null
  pnpm --dir "$accordion_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
  cat > "$accordion_consumer/imports.js" <<'JS'
export { Accordion as First } from '@sveltery/base';
export { Accordion as Second, Root, Item, Header, Trigger, Panel } from '@sveltery/base/accordion';
JS
  cat > "$accordion_consumer/imports.d.ts" <<'TS'
export { Accordion as First,
  type AccordionRootProps, type AccordionItemProps, type AccordionHeaderProps, type AccordionTriggerProps, type AccordionPanelProps } from '@sveltery/base';
export { Accordion as Second, Root, Item, Header, Trigger, Panel } from '@sveltery/base/accordion';
TS
else
  ln -s "$sveltery_repo_root/packages/base/node_modules/svelte" "$accordion_consumer/node_modules/svelte"
  ln -s "$sveltery_repo_root/packages/base/node_modules/esm-env" "$accordion_consumer/node_modules/esm-env"
  cat > "$accordion_consumer/package.json" <<'JSON'
{"private":true,"type":"module"}
JSON
  cat > "$accordion_consumer/imports.js" <<'JS'
export { Accordion as First, Accordion as Second, Root, Item, Header, Trigger, Panel } from './node_modules/@sveltery/base/dist/accordion/index.js';
JS
  cat > "$accordion_consumer/imports.d.ts" <<'TS'
export { Accordion as First, Accordion as Second, Root, Item, Header, Trigger, Panel,
  type AccordionRootProps, type AccordionItemProps, type AccordionHeaderProps, type AccordionTriggerProps, type AccordionPanelProps } from './node_modules/@sveltery/base/dist/accordion/index.js';
TS
fi
cat > "$accordion_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type AccordionRootProps, type AccordionItemProps, type AccordionHeaderProps, type AccordionTriggerProps, type AccordionPanelProps } from './imports.js';
  const root: AccordionRootProps<string> = { defaultValue: ['first'], onValueChange: (_values, details) => details.cancel() };
  const item: AccordionItemProps = { value: 'first' };
  const header: AccordionHeaderProps = { class: 'heading' };
  const trigger: AccordionTriggerProps = { type: 'submit', form: 'external', name: 'accordion', value: 'sent' };
  const panel: AccordionPanelProps = { keepMounted: true };
</script>
<First.Root {...root}><First.Item {...item}><First.Header {...header}><First.Trigger {...trigger}>First</First.Trigger></First.Header><First.Panel {...panel}>Open content</First.Panel></First.Item></First.Root>
<Second.Root disabled hiddenUntilFound><Second.Item value="second"><Second.Header><Second.Trigger disabled={false}>Second</Second.Trigger></Second.Header><Second.Panel>Find content</Second.Panel></Second.Item></Second.Root>
SVELTE
cat > "$accordion_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second, Root, Item, Header, Trigger, Panel } from './imports.js';
assert.equal(First, Second);
for (const [part, member] of [[Root, 'Root'], [Item, 'Item'], [Header, 'Header'], [Trigger, 'Trigger'], [Panel, 'Panel']]) {
  assert.equal(part, First[member]);
}
const body = render(Consumer).body;
assert.equal((body.match(/<button/g) ?? []).length, 2);
assert.equal((body.match(/<h3/g) ?? []).length, 2);
assert.match(body, /type="submit"/); assert.match(body, /form="external"/); assert.match(body, /value="sent"/);
assert.match(body, /aria-expanded="true"/); assert.match(body, /aria-expanded="false"/); assert.match(body, /aria-disabled="true"/);
assert.match(body, /animation-name:none/); assert.match(body, /--accordion-panel-height:auto/); assert.match(body, /hidden=""/);
const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, 4); assert.equal(new Set(ids).size, 4); assert(ids.every(id => id.startsWith('base-ui-')));
assert(body.includes('Open content')); assert(body.includes('Find content'));
for (const label of body.matchAll(/ aria-labelledby="([^"]+)"/g)) assert(ids.includes(label[1]));
for (const control of body.matchAll(/ aria-controls="([^"]+)"/g)) assert(ids.includes(control[1]));
JS
if [[ "${1:-}" == '--public' ]]; then
  cat > "$accordion_consumer/PublicTypes.ts" <<'TS'
import type * as Root from '@sveltery/base';
import type * as Parts from '@sveltery/base/accordion';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function exact<T extends true>(_value?: T) {}
exact<Equal<Root.AccordionValue<string>, Parts.AccordionValue<string>>>();
exact<Equal<Root.AccordionRootProps<string>, Parts.AccordionRootProps<string>>>();
exact<Equal<Root.AccordionRootState<string>, Parts.AccordionRootState<string>>>();
exact<Equal<Root.AccordionItemProps, Parts.AccordionItemProps>>();
exact<Equal<Root.AccordionItemState, Parts.AccordionItemState>>();
exact<Equal<Root.AccordionHeaderProps, Parts.AccordionHeaderProps>>();
exact<Equal<Root.AccordionHeaderState, Parts.AccordionHeaderState>>();
exact<Equal<Root.AccordionTriggerProps, Parts.AccordionTriggerProps>>();
exact<Equal<Root.AccordionTriggerState, Parts.AccordionTriggerState>>();
exact<Equal<Root.AccordionPanelProps, Parts.AccordionPanelProps>>();
exact<Equal<Root.AccordionPanelState, Parts.AccordionPanelState>>();
exact<Equal<Root.AccordionRootChangeEventReason, Parts.AccordionRootChangeEventReason>>();
exact<Equal<Root.AccordionRootChangeEventDetails, Parts.AccordionRootChangeEventDetails>>();
exact<Equal<Root.AccordionItemChangeEventReason, Parts.AccordionItemChangeEventReason>>();
exact<Equal<Root.AccordionItemChangeEventDetails, Parts.AccordionItemChangeEventDetails>>();
export const typed: Root.AccordionRootProps<'a' | 'b'> = { value: ['a'], onValueChange: values => exact<Equal<typeof values, ('a' | 'b')[]>>() };
// @ts-expect-error Explicit generic values reject unrelated strings.
export const invalid: Parts.AccordionRootProps<'a' | 'b'> = { value: ['c'] };
TS
fi
cat > "$accordion_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$accordion_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$accordion_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Accordion public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball Accordion internal entry SSR and types: PASS (public entries await serialized integration)'
fi
