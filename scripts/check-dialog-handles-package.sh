#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
dialog_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-dialog-consumer.XXXXXX")"
trap 'rm -rf "$dialog_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$dialog_consumer" > /dev/null
node --input-type=module - "$dialog_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$dialog_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$dialog_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$dialog_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/base/THIRD_PARTY_NOTICES.md "$dialog_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$dialog_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Dialog as First } from '@sveltery/base';
  import * as Second from '@sveltery/base/dialog';
  let { handle = First.createHandle<number>() }: { handle?: Second.Handle<number> } = $props();
  function expectType<_Expected, _Actual extends _Expected>(_value: _Actual) {}
  const constructed = new Second.Handle<number>();
  void constructed;
</script>
<First.Root><span id="plain">Plain children</span></First.Root>
<Second.Root {handle} defaultOpen defaultTriggerId="detached">
  {#snippet children({ payload })}
    <span id="payload">{payload ?? 'No payload'}</span>
    <Second.Portal><Second.Popup>Dialog</Second.Popup></Second.Portal>
    {let checked = expectType<number | undefined, typeof payload>(payload)}
    {checked ?? ''}
  {/snippet}
</Second.Root>
<First.Trigger {handle} id="detached" payload={7}>Detached</First.Trigger>
SVELTE
cat > "$dialog_consumer/types.ts" <<'TS'
import { Dialog as First } from '@sveltery/base';
import * as Second from '@sveltery/base/dialog';
import type { ComponentProps, Snippet } from 'svelte';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const factory: First.Handle<number> = Second.createHandle<number>();
const constructed: Second.Handle<number> = new First.Handle<number>();
// @ts-expect-error The pinned Handle type requires its payload type argument.
const missingPayloadType: First.Handle = constructed;
const rootPayload: Equal<Parameters<NonNullable<ComponentProps<typeof First.Root<number>>['children']>>[0], { payload: number | undefined }> = true;
const triggerPayload: Equal<ComponentProps<typeof Second.Trigger<number>>['payload'], number | undefined> = true;
declare const plain: Snippet;
const plainRoot: ComponentProps<typeof Second.Root<number>> = { children: plain };
const strongTrigger: ComponentProps<typeof First.Trigger<number>> = { handle: factory, payload: 8 };
// @ts-expect-error A number handle rejects a string payload.
factory.openWithPayload('wrong');
// @ts-expect-error Component payload inference follows its handle.
const wrongTrigger: ComponentProps<typeof First.Trigger<number>> = { handle: factory, payload: 'wrong' };
// @ts-expect-error Handles cannot change their payload type through assignment.
const wrongHandle: First.Handle<string> = constructed;
void [missingPayloadType, rootPayload, triggerPayload, plainRoot, strongTrigger, wrongTrigger, wrongHandle];
TS
cat > "$dialog_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Dialog as First } from '@sveltery/base';
import * as Second from '@sveltery/base/dialog';
import Consumer from './Consumer.svelte';
assert.equal(First.Root, Second.Root); assert.equal(First.Trigger, Second.Trigger);
assert.equal(First.Handle, Second.Handle); assert.equal(First.createHandle, Second.createHandle);
const handle = First.createHandle();
for (let request = 0; request < 2; request++) {
  const body = render(Consumer, { props: { handle } }).body;
  assert.match(body, /id="plain">Plain children/); assert.match(body, /id="payload">No payload/);
  assert.match(body, /id="detached"[^>]*aria-expanded="false"/);
  assert.doesNotMatch(body, /data-popup-open|role="dialog"/); assert.equal(handle.isOpen, false);
}
assert.equal(new Second.Handle().isOpen, false);
JS
cat > "$dialog_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$dialog_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$dialog_consumer" --tsconfig ./tsconfig.json
echo 'Isolated tarball Dialog public root/subpath generic handle SSR and types: PASS'
