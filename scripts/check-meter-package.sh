#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
meter_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-meter-consumer.XXXXXX")"
trap 'rm -rf "$meter_consumer"' EXIT
sveltery_pack_package @sveltery/base "$meter_consumer" > /dev/null
mkdir -p "$meter_consumer/node_modules/@sveltery/base"
tar -xzf "$meter_consumer"/*.tgz --strip-components=1 -C "$meter_consumer/node_modules/@sveltery/base"
# Install the packed runtime closure (including Collapsible's esm-env) and Svelte peer.
node --input-type=module - "$meter_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
rm -rf "$meter_consumer/node_modules"
sveltery_prepare_consumer "$meter_consumer"
pnpm --dir "$meter_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$meter_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$meter_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$meter_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$meter_consumer/imports.js" <<'JS'
export { Meter as First } from '@sveltery/base';
export { Meter as Second } from '@sveltery/base/meter';
JS
  cat > "$meter_consumer/imports.d.ts" <<'TS'
export { Meter as First, type MeterRootProps, type MeterRootState, type MeterLabelProps, type MeterLabelState, type MeterTrackProps, type MeterTrackState, type MeterIndicatorProps, type MeterIndicatorState, type MeterValueProps, type MeterValueState } from '@sveltery/base';
export { Meter as Second, type MeterRootProps as SubpathMeterRootProps, type MeterRootState as SubpathMeterRootState, type MeterLabelProps as SubpathMeterLabelProps, type MeterLabelState as SubpathMeterLabelState, type MeterTrackProps as SubpathMeterTrackProps, type MeterTrackState as SubpathMeterTrackState, type MeterIndicatorProps as SubpathMeterIndicatorProps, type MeterIndicatorState as SubpathMeterIndicatorState, type MeterValueProps as SubpathMeterValueProps, type MeterValueState as SubpathMeterValueState } from '@sveltery/base/meter';
TS
else
  cat > "$meter_consumer/imports.js" <<'JS'
export { Meter as First, Meter as Second } from './node_modules/@sveltery/base/dist/meter/index.js';
JS
  cat > "$meter_consumer/imports.d.ts" <<'TS'
export { Meter as First, Meter as Second, type MeterRootProps, type MeterRootState, type MeterLabelProps, type MeterLabelState, type MeterTrackProps, type MeterTrackState, type MeterIndicatorProps, type MeterIndicatorState, type MeterValueProps, type MeterValueState } from './node_modules/@sveltery/base/dist/meter/index.js';
TS
fi
if [[ "${1:-}" == '--public' ]]; then
  cat > "$meter_consumer/public-types.ts" <<'TS'
import type { MeterRootProps, MeterRootState, MeterLabelProps, MeterLabelState, MeterTrackProps, MeterTrackState, MeterIndicatorProps, MeterIndicatorState, MeterValueProps, MeterValueState } from '@sveltery/base';
import type { MeterRootProps as RootProps, MeterRootState as RootState, MeterLabelProps as LabelProps, MeterLabelState as LabelState, MeterTrackProps as TrackProps, MeterTrackState as TrackState, MeterIndicatorProps as IndicatorProps, MeterIndicatorState as IndicatorState, MeterValueProps as ValueProps, MeterValueState as ValueState } from '@sveltery/base/meter';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const equal: Equal<[MeterRootProps, MeterRootState, MeterLabelProps, MeterLabelState, MeterTrackProps, MeterTrackState, MeterIndicatorProps, MeterIndicatorState, MeterValueProps, MeterValueState], [RootProps, RootState, LabelProps, LabelState, TrackProps, TrackState, IndicatorProps, IndicatorState, ValueProps, ValueState]> = true;
// @ts-expect-error Meter requires its numeric value.
const missing: MeterRootProps = {};
// @ts-expect-error Null is not an indeterminate Meter value.
const nullable: RootProps = { value: null };
void [equal, missing, nullable];
TS
fi
cat > "$meter_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type MeterRootProps, type MeterRootState, type MeterLabelProps, type MeterLabelState, type MeterTrackProps, type MeterTrackState, type MeterIndicatorProps, type MeterIndicatorState, type MeterValueProps, type MeterValueState } from './imports.js';
  const props: MeterRootProps = { value: 30, min: 20, max: 40 };
  const states: [MeterRootState, MeterLabelState, MeterTrackState, MeterIndicatorState, MeterValueState] = [{}, {}, {}, {}, {}];
  const parts: [MeterLabelProps, MeterTrackProps, MeterIndicatorProps, MeterValueProps] = [{}, {}, {}, {}];
  void [states, parts];
</script>
<First.Root {...props}><First.Label>Upload</First.Label><First.Value/><First.Track><First.Indicator/></First.Track></First.Root>
<Second.Root value={NaN}><Second.Value/></Second.Root>
SVELTE
cat > "$meter_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
for (const part of ['Root', 'Label', 'Track', 'Indicator', 'Value']) assert.equal(First[part], Second[part]);
const body = render(Consumer).body;
assert.equal((body.match(/role="meter"/g) ?? []).length, 2);
assert.equal((body.match(/>x<\/span>/g) ?? []).length, 2);
assert.match(body, /aria-valuenow="30"/); assert.match(body, /aria-valuetext="50%"/);
assert.match(body, /width:50%/); assert.match(body, /aria-valuenow="0"/);
assert(!body.includes('data-indeterminate'));
assert(!body.includes('aria-labelledby')); assert(!body.includes('name='));
JS
cat > "$meter_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$meter_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$meter_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Meter public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball Meter internal entry SSR and types: PASS (internal mode; public root/subpath mode is separate)'
fi
