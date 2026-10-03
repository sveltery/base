#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
otp_consumer_dir="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-otp-consumer.XXXXXX")"
trap 'rm -rf "$otp_consumer_dir"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$otp_consumer_dir" >/dev/null
node --input-type=module - "$otp_consumer_dir" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2];
const tarball = readdirSync(dir).find(name => name.endsWith('.tgz'));
writeFileSync(join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(dir,tarball)}`, svelte:'5.57.1', 'svelte-check':'4.7.6', typescript:'5.9.3' } }));
JS
pnpm --dir "$otp_consumer_dir" --ignore-workspace install --ignore-scripts >/dev/null
pnpm --dir "$otp_consumer_dir" --ignore-workspace install --frozen-lockfile --ignore-scripts >/dev/null
cat > "$otp_consumer_dir/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { OTPField, Field, OTPFieldRoot, OTPFieldInput } from '@sveltery/base';
  import { OTPField as Subpath, type OTPFieldRootProps, type OTPFieldInputProps } from '@sveltery/base/otp-field';
  import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
  let owner = $state('');
  const props: OTPFieldRootProps = { length:4, validationType:'alphanumeric', normalizeValue:value=>value.toUpperCase(), onValueChange(value,details) { if(details.reason==='input-paste'){const event:ClipboardEvent=details.event;void event;}if(details.reason==='keyboard'){const event:KeyboardEvent=details.event;void event;}owner=value; } };
  const input: OTPFieldInputProps = { readonly:false, oninput:event=>event.preventBaseUIHandler() };
</script>
<Field.Root name="code"><Field.Label>Code</Field.Label><OTPField.Root {...props} value={owner}><OTPField.Input/><OTPField.Input/><OTPField.Separator/><OTPField.Input/><OTPField.Input/></OTPField.Root></Field.Root>
<Subpath.Root length={2} defaultValue="12"><Subpath.Input {...input}/><Subpath.Input/></Subpath.Root>
<OTPFieldRoot length={1} defaultValue="a" validationType="alpha">
  {#snippet render(props,_state,children)}<section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>{/snippet}
  <OTPFieldInput>{#snippet render(props,state)}<input {...props as HTMLInputAttributes} data-index={state.index}/>{/snippet}</OTPFieldInput>
</OTPFieldRoot>
SVELTE
cat > "$otp_consumer_dir/types.ts" <<'TS'
import type { ComponentProps } from 'svelte';
import { OTPField } from '@sveltery/base';
import { OTPField as Subpath, type OTPFieldRootProps, type OTPFieldInputProps } from '@sveltery/base/otp-field';
const root: ComponentProps<typeof OTPField.Root> = { length:6, form:'form', inputMode:'tel', mask:true };
const subpath: ComponentProps<typeof Subpath.Input> = { disabled:true, readonly:true };
// @ts-expect-error length is required
const badRoot: OTPFieldRootProps = {};
// @ts-expect-error order is inferred
const badIndex: OTPFieldInputProps = { index:0 };
// @ts-expect-error sanitizeValue was renamed
const badName: OTPFieldRootProps = { length:6, sanitizeValue:(value:string)=>value };
void [root,subpath,badRoot,badIndex,badName];
TS
cat > "$otp_consumer_dir/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.ts","*.svelte"]}
JSON
pnpm --dir "$otp_consumer_dir" exec svelte-check --tsconfig tsconfig.json
cat > "$otp_consumer_dir/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { OTPField, OTPFieldRoot, OTPFieldInput } from '@sveltery/base';
import { OTPField as Subpath } from '@sveltery/base/otp-field';
import Consumer from './Consumer.svelte';
assert.equal(OTPField.Root, OTPFieldRoot);
assert.equal(OTPField.Input, OTPFieldInput);
assert.equal(Subpath.Root, OTPField.Root);
assert.equal(Subpath.Separator, OTPField.Separator);
const html=render(Consumer).body;
assert.equal((html.match(/role="group"/g)??[]).length,3);
assert.equal((html.match(/aria-hidden="true"/g)??[]).length,3);
assert.equal((html.match(/<input /g)??[]).length,10);
assert.match(html,/pattern="\[a-zA-Z0-9\]\{4\}"/);
assert.match(html,/<section /);
const metadata=JSON.parse(readFileSync(new URL('./node_modules/@sveltery/base/package.json',import.meta.url)));
assert(metadata.exports['./otp-field']);
assert(!metadata.dependencies.react);
console.log('OTP packed root/subpath strict types and SSR consumer: PASS');
JS
node --import "$PWD/scripts/svelte-ssr-loader.mjs" "$otp_consumer_dir/check.mjs"
