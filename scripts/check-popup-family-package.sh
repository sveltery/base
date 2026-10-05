#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
popup_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-popup-consumer.XXXXXX")"
trap 'rm -rf "$popup_consumer"' EXIT
sveltery_pack_package @sveltery/base "$popup_consumer" > /dev/null
node --input-type=module - "$popup_consumer" <<'JS'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
console.log(`Actual installed Popup family package: ${tarball} SHA256 ${createHash('sha256').update(readFileSync(join(destination, tarball))).digest('hex')}`);
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$popup_consumer"
pnpm --dir "$popup_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$popup_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$popup_consumer/node_modules/@sveltery/base/LICENSE"
test -f "$popup_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cp parity/popup-family/packed-consumer/Consumer.svelte parity/popup-family/packed-consumer/PayloadTypes.svelte parity/popup-family/packed-consumer/Types.ts parity/popup-family/packed-consumer/expect-type.ts "$popup_consumer/"
cat > "$popup_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
cat > "$popup_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Popover, PreviewCard, Tooltip } from '@sveltery/base';
import { Popover as SubPopover } from '@sveltery/base/popover';
import { PreviewCard as SubPreviewCard } from '@sveltery/base/preview-card';
import { Tooltip as SubTooltip } from '@sveltery/base/tooltip';
import Consumer from './Consumer.svelte';
for (const [name, root, sub, parts] of [
  ['Popover', Popover, SubPopover, ['Root', 'Trigger', 'Portal', 'Positioner', 'Popup', 'Arrow', 'Backdrop', 'Title', 'Description', 'Close', 'Viewport']],
  ['PreviewCard', PreviewCard, SubPreviewCard, ['Root', 'Trigger', 'Portal', 'Positioner', 'Popup', 'Arrow', 'Backdrop', 'Viewport']],
  ['Tooltip', Tooltip, SubTooltip, ['Provider', 'Root', 'Trigger', 'Portal', 'Positioner', 'Popup', 'Arrow', 'Viewport']],
]) for (const part of [...parts, 'Handle', 'createHandle']) assert.equal(root[part], sub[part], `${name}.${part}`);
for (const family of ['popover', 'preview-card', 'tooltip']) {
  const body = render(Consumer, { props: { family } }).body;
  assert.match(body, /id="opener"/); assert.match(body, /id="second"/); assert.doesNotMatch(body, /data-testid="popup"/);
}
console.log('Installed Popup family root/subpath identity and SSR: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$popup_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$popup_consumer" --tsconfig ./tsconfig.json
cp parity/popup-family/packed-consumer/Negative.svelte "$popup_consumer/"
set +e
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$popup_consumer" --tsconfig ./tsconfig.json --output machine > "$popup_consumer/negative.log"
popup_negative_status=$?
set -e
if [[ "$popup_negative_status" != 1 ]]; then cat "$popup_consumer/negative.log"; exit 1; fi
node --input-type=module - "$popup_consumer/negative.log" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const output = readFileSync(process.argv[2], 'utf8');
const errors = output.split('\n').filter(line => /\bERROR\b/.test(line));
assert.equal(errors.length, 9, output); assert(errors.every(line => line.includes('Negative.svelte')), output);
console.log('Installed Popup family strict positive contracts, 5 Source directives, 3 type equalities and 9 negative diagnostics: PASS (native nullable href earns no Original credit)');
JS
