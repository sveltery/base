import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

// Independent exact275 inference probes, retained without weakening the six invalid calls.
const root = resolve(import.meta.dirname, '..');
const workspace = resolve(process.argv[2]);
const source = process.argv[3] === '--source';
mkdirSync(workspace, { recursive: true });
for (const name of ['Positive.svelte', 'Negative.svelte', 'NominalNegative.svelte']) {
  const fixture = join(root, 'scripts/fixtures/alert-dialog-types', name);
  if (source) {
    const body = readFileSync(fixture, 'utf8')
      .replaceAll("from '@sveltery/base'", `from '${join(root, 'packages/base/src/lib/index.js')}'`)
      .replaceAll(
        "from '@sveltery/base/alert-dialog'",
        `from '${join(root, 'packages/base/src/lib/alert-dialog/index.js')}'`,
      )
      .replaceAll(
        "from '@sveltery/base/dialog'",
        `from '${join(root, 'packages/base/src/lib/dialog/index.js')}'`,
      );
    writeFileSync(join(workspace, name), body);
  } else copyFileSync(fixture, join(workspace, name));
}
const compilerOptions = {
  target: 'ES2022',
  module: 'ESNext',
  moduleResolution: 'Bundler',
  strict: true,
  skipLibCheck: false,
  verbatimModuleSyntax: true,
  lib: ['ES2022', 'DOM', 'DOM.Iterable'],
};
if (source) {
  // Use the repository's installed Node declarations for the real source DEV checks.
  const tooling = createRequire(join(root, 'packages/base/package.json'));
  const jsdom = createRequire(tooling.resolve('@types/jsdom/package.json'));
  compilerOptions.typeRoots = [dirname(dirname(jsdom.resolve('@types/node/package.json')))];
  compilerOptions.types = ['node'];
} else {
  compilerOptions.exactOptionalPropertyTypes = true;
  compilerOptions.noUncheckedIndexedAccess = true;
}
writeFileSync(
  join(workspace, 'tsconfig.positive.json'),
  JSON.stringify({ compilerOptions, include: ['Positive.svelte'] }),
);
writeFileSync(
  join(workspace, 'tsconfig.negative.json'),
  JSON.stringify({ compilerOptions, include: ['Negative.svelte', 'NominalNegative.svelte'] }),
);
const checker = join(root, 'packages/base/node_modules/svelte-check/bin/svelte-check');
function check(config, log) {
  const result = spawnSync(
    process.execPath,
    [checker, '--workspace', workspace, '--tsconfig', config, '--output', 'machine'],
    { encoding: 'utf8' },
  );
  const output = result.stdout + result.stderr;
  writeFileSync(join(workspace, log), output);
  process.stdout.write(output);
  assert.equal(result.signal, null, 'Type checker was terminated');
  assert.ifError(result.error);
  return { status: result.status, output };
}
const positive = check('./tsconfig.positive.json', 'positive.log');
assert.equal(
  positive.status,
  0,
  'Implicit handle/ref/state-class/Props-spread positives must pass',
);
assert.match(
  positive.output,
  /COMPLETED \d+ FILES 0 ERRORS 0 WARNINGS/,
  'Positive consumers must have zero diagnostics',
);
const negative = check('./tsconfig.negative.json', 'negative.log');
assert.equal(negative.status, 1, 'Invalid payload and ordinary handle calls must fail');
const errors = [...negative.output.matchAll(/ ERROR "([^"]+)" (\d+):(\d+) (.+)/g)];
const calls = new Map([
  ['Negative.svelte', [11, 12, 13, 14, 15, 16]],
  ['NominalNegative.svelte', [7, 8, 9, 10]],
]);
const required = errors.filter((error) =>
  /not assignable to type 'number|__alertDialogBrand/.test(error[4]),
);
assert.equal(
  required.length,
  10,
  `Expected six payload and four nominal-handle errors:\n${negative.output}`,
);
for (const [file, lines] of calls) {
  for (const line of lines)
    assert(
      required.some((error) => basename(error[1]) === file && Number(error[2]) === line),
      `Missing required payload/brand rejection at ${file}:${line}`,
    );
}
for (const error of errors) {
  const file = [...calls.keys()].find((name) => basename(error[1]) === name);
  assert(file && calls.get(file).includes(Number(error[2])), `Unexpected diagnostic: ${error[0]}`);
  // Svelte's invalid Props override also emits TS2590; it cannot count as a payload rejection.
  if (
    file === 'Negative.svelte' &&
    Number(error[2]) === 16 &&
    /union type that is too complex/.test(error[4])
  )
    continue;
  assert.match(
    error[4],
    file === 'Negative.svelte' ? /not assignable to type 'number/ : /__alertDialogBrand/,
  );
}
console.log(
  `AlertDialog ${source ? 'actual source' : 'installed root/subpath'} implicit inference: six positives, six payload rejections and four nominal-handle rejections PASS`,
);
