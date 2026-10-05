#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
remote_types_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-remote-types.XXXXXX")"
trap 'rm -rf "$remote_types_consumer"' EXIT
sveltery_pack_package @sveltery/base "$remote_types_consumer" > /dev/null
node --input-type=module - "$remote_types_consumer" "${1:-}" "${2:-2.70.3}" <<'JS'
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2], publicMode = process.argv[3] === '--public', kitVersion = process.argv[4];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: {
  '@sveltery/base': `file:${join(destination, tarball)}`, '@sveltejs/kit': kitVersion, svelte: '5.57.1'
} }));
const fields = publicMode ? '@sveltery/base/field' : './node_modules/@sveltery/base/dist/field/index.js';
const types = publicMode ? '@sveltery/base/form' : './node_modules/@sveltery/base/dist/remote-forms/types.js';
writeFileSync(join(destination, 'imports.ts'), `export { Field } from '${fields}';\nexport type { FieldRootProps } from '${fields}';\nexport type { RemoteFieldArguments, RemoteFieldName, RemoteFieldRootProps, RemoteFieldRootPropsForName, TypedField } from '${types}';\n`);
for (const name of ['forms.ts', 'Positive.svelte', 'Negative.svelte', 'TypedRoot.svelte', 'RecursivePositive.svelte', 'RecursiveNegative.svelte']) copyFileSync(join('scripts/fixtures/remote-form-types', name), join(destination, name));
if (kitVersion.startsWith('3.')) {
  const formsPath = join(destination, 'forms.ts');
  writeFileSync(formsPath, `import type {} from '@sveltejs/kit';\n` + readFileSync(formsPath, 'utf8').replace("from '@sveltejs/kit'", "from '$app/server'"));
}
const fixture = readFileSync('apps/fixtures/src/lib/remote-form.types.ts', 'utf8')
  .replaceAll("'../../../../packages/base/src/lib/field/index.js'", "'./imports.js'")
  .replaceAll("'../../../../packages/base/src/lib/field/types.js'", "'./imports.js'")
  .replaceAll("'../../../../packages/base/src/lib/remote-forms/types.js'", "'./imports.js'");
let publicTypes = kitVersion.startsWith('3.')
  ? `import type {} from '@sveltejs/kit';\n` + fixture.replace("from '@sveltejs/kit'", "from '$app/server'")
  : fixture;
if (publicMode) publicTypes += `\nimport type * as PublicRoot from '@sveltery/base';\nimport type * as PublicForm from '@sveltery/base/form';\ntype Same<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\ntype Assert<T extends true> = T;\nexport type SameRootProps = Assert<Same<PublicRoot.RemoteFieldRootProps<Remote['fields']>, PublicForm.RemoteFieldRootProps<Remote['fields']>>>;\nexport type SameName = Assert<Same<PublicRoot.RemoteFieldName<Remote['fields']>, PublicForm.RemoteFieldName<Remote['fields']>>>;\nexport type SameNamespace = Assert<Same<PublicRoot.TypedField<Remote['fields']>, PublicForm.TypedField<Remote['fields']>>>;\n`;
writeFileSync(join(destination, 'PublicTypes.ts'), publicTypes);
const options = { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true,
  skipLibCheck: true, verbatimModuleSyntax: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'] };
writeFileSync(join(destination, 'tsconfig.positive.json'), JSON.stringify({ compilerOptions: options, include: ['imports.ts', 'forms.ts', 'PublicTypes.ts', 'Positive.svelte', 'RecursivePositive.svelte', 'TypedRoot.svelte'] }));
writeFileSync(join(destination, 'tsconfig.negative.json'), JSON.stringify({ compilerOptions: options, include: ['imports.ts', 'forms.ts', 'Negative.svelte', 'RecursiveNegative.svelte', 'TypedRoot.svelte'] }));
JS
sveltery_prepare_consumer "$remote_types_consumer"
pnpm --dir "$remote_types_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$remote_types_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$remote_types_consumer" --tsconfig ./tsconfig.positive.json
if node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$remote_types_consumer" --tsconfig ./tsconfig.negative.json --output machine > "$remote_types_consumer/negative.log"; then
  echo 'Invalid remote field consumers unexpectedly type-checked.' >&2
  exit 1
fi
node --input-type=module - "$remote_types_consumer" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const sources = ['Negative.svelte', 'RecursiveNegative.svelte'];
const log = readFileSync(join(destination, 'negative.log'), 'utf8');
const errors = [...log.matchAll(/ ERROR "([^"]+)" (\d+):(\d+) /g)];
assert(errors.length > 0, `No machine diagnostics found:\n${log}`);
assert(errors.every(match => sources.some(source => match[1].endsWith(source))), `Unexpected diagnostic outside negative consumers:\n${log}`);
let rejected = 0;
for (const source of sources) {
  const lines = readFileSync(join(destination, source), 'utf8').split('\n');
  for (let line = 0; line < lines.length; line++) {
    if (!lines[line].includes('<!-- reject:')) continue;
    rejected++;
    assert(errors.some(match => match[1].endsWith(source) && Number(match[2]) === line + 2), `Missing error for ${lines[line]}:\n${log}`);
  }
}
console.log(`All ${rejected} invalid Svelte field consumers rejected; ${errors.length} diagnostics.`);

JS
if [[ "${1:-}" == '--public' ]]; then
  echo "Isolated tarball remote-field types: public root/subpaths and installed Kit ${2:-2.70.3} PASS"
else
  echo "Isolated tarball remote-field types: internal entries and installed Kit ${2:-2.70.3} PASS (public integration pending)"
fi
