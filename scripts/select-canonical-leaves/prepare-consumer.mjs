// Reuse maintained assertions verbatim except installed-file import routing.
// Native lifetime/type/package supplements earn zero unchanged Original credit.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
const destination = resolve(process.argv[2]);
const toolchain = JSON.parse(readFileSync('packages/base/package.json', 'utf8')).devDependencies;
const playwrightVersion = JSON.parse(readFileSync('package.json', 'utf8')).devDependencies[
  '@playwright/test'
];
const installedDist = `${join(destination, 'node_modules/@sveltery/base/dist')}/`;
function write(name, body) {
  writeFileSync(join(destination, name), body);
}
function copy(source, target) {
  const body = readFileSync(source, 'utf8')
    .replaceAll('../../src/lib/', installedDist)
    .replaceAll('../src/lib/', installedDist)
    .replaceAll(
      './dom/SelectCanonicalLeavesFixture.svelte',
      './SelectCanonicalLeavesFixture.svelte',
    );
  assert(!body.includes('src/lib/'), source);
  write(target, body);
}
const artifacts = JSON.parse(
  readFileSync(
    process.env.SVELTERY_PACKAGE_ARTIFACTS ?? join(destination, 'artifacts.json'),
    'utf8',
  ),
);
const tarball = artifacts.packages['@sveltery/base'].tarball;
assert(tarball);
write(
  'package.json',
  JSON.stringify({
    private: true,
    type: 'module',
    dependencies: {
      '@sveltery/base': `file:${join(destination, tarball)}`,
      svelte: '5.57.1',
    },
    // Install the pinned test harness locally so Vitest's nested optimizer requests
    // and internal subpaths resolve through its actual package, without aliases.
    devDependencies: {
      playwright: playwrightVersion,
      ...Object.fromEntries(
        [
          'vitest',
          '@vitest/browser-playwright',
          '@sveltejs/vite-plugin-svelte',
          'vite',
          'jsdom',
        ].map((name) => [name, toolchain[name]]),
      ),
    },
  }),
);
copy(
  'packages/base/tests/dom/SelectCanonicalLeavesFixture.svelte',
  'SelectCanonicalLeavesFixture.svelte',
);
copy('packages/base/tests/select-canonical-leaves.types.ts', 'types.ts');
copy('packages/base/tests/expect-type.ts', 'expect-type.ts');
copy('packages/base/tests/select-canonical-leaves.test.ts', 'helpers.test.ts');
copy('packages/base/tests/select-canonical-leaves-ssr.test.ts', 'ssr.test.ts');
copy('packages/base/tests/dom/select-canonical-leaves.test.ts', 'dom.test.ts');
write(
  'browser.test.ts',
  "// Secured installed-file native supplements; zero new upstream credit.\nimport './dom.test.js';\nimport './hydration.test.js';\n",
);
let hydration = readFileSync(
  'packages/base/tests/dom/select-canonical-leaves-hydration.test.ts',
  'utf8',
);
hydration = hydration
  .replace("import { execFileSync } from 'node:child_process';\n", '')
  .replace("import { resolve } from 'node:path';\n", '')
  .replace(
    "import Fixture from './SelectCanonicalLeavesFixture.svelte';",
    "import Fixture from './SelectCanonicalLeavesFixture.svelte';\nimport serverMarkup from './server-markup.json';",
  );
const start = hydration.indexOf('    const script =');
const end = hydration.indexOf('    const target =', start);
assert(start !== -1 && end > start);
hydration =
  hydration.slice(0, start) +
  '    const markup = serverMarkup[String(custom) as "false" | "true"];\n' +
  hydration.slice(end);
write('hydration.test.ts', hydration);
write(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      exactOptionalPropertyTypes: true,
      skipLibCheck: false,
      verbatimModuleSyntax: true,
      resolveJsonModule: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    },
    include: ['*.svelte', 'types.ts', 'expect-type.ts'],
  }),
);
write(
  'check.mjs',
  `
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { render } from 'svelte/server';
import * as Root from '@sveltery/base';
import Fixture from './SelectCanonicalLeavesFixture.svelte';
assert.equal(typeof document, 'undefined');
for (const name of ['ListboxSeparator', 'compareItemEquality', 'resolveMultipleLabels']) assert.equal(name in Root, false);
const metadata = JSON.parse(readFileSync(new URL('./node_modules/@sveltery/base/package.json', import.meta.url)));
assert(!Object.keys(metadata.exports).some(key => /listbox-separator|item-equality|resolve-value-label/.test(key)));
const markup = {};
for (const custom of [false, true]) {
  const body = render(Fixture, { props: { custom } }).body;
  assert.match(body, /role="presentation"/);
  assert.match(body, /data-orientation="horizontal"/);
  assert.match(body, /Authored/);
  assert(!body.includes('[object Object]'));
  markup[String(custom)] = body;
}
writeFileSync(new URL('./server-markup.json', import.meta.url), JSON.stringify(markup));
console.log('Installed private leaves, non-public exports and real no-browser SSR: PASS');
`,
);
write(
  'vitest.config.mjs',
  `
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
export default defineConfig({ root: ${JSON.stringify(destination)}, plugins: [svelte()],
 resolve: { dedupe: ['svelte'] }, test: { maxWorkers: 1, fileParallelism: false, retry: 0,
 projects: [
  { extends: true, test: { name: 'server', environment: 'node', include: ['helpers.test.ts', 'ssr.test.ts'] } },
  { extends: true, resolve: { conditions: ['browser'] }, test: { name: 'dom', environment: 'jsdom', include: ['dom.test.ts', 'hydration.test.ts'] } },
  { extends: true, test: { name: 'browser', include: ['browser.test.ts'], browser: { enabled: true,
   provider: playwright({ launchOptions: { chromiumSandbox: true } }),
   instances: [{ browser: 'chromium', headless: true }] } } }
 ] } });
`,
);
