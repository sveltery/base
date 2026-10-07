import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SourceTextModule } from 'node:vm';
import { createHash } from 'node:crypto';
import { createServer } from '../../apps/fixtures/node_modules/vite/dist/node/index.js';
const base = 'apps/fixtures/node_modules/@base-ui/react/';
const paths = ['floating-ui-react/utils/composite', 'internals/composite/composite'];
const names = [['isElementVisible', 'isListIndexDisabled'], ['isNativeInput', 'scrollIntoViewIfNeeded']];
const observations = [];
for (let i = 0; i < paths.length; i++) {
  const cjs = new SourceTextModule(readFileSync(base + paths[i] + '.js', 'utf8'));
  const importer = new SourceTextModule(`import { ${names[i].join(', ')} } from 'actual-cjs';`);
  let error;
  try { await importer.link(() => cjs); } catch (caught) { error = caught.message; }
  assert.match(error, /does not provide an export named/);
  const esm = await import('../../' + base + paths[i] + '.mjs');
  for (const name of names[i]) assert.equal(typeof esm[name], 'function');
  const bytes = readFileSync(base + paths[i] + '.mjs');
  observations.push({ path: base + paths[i] + '.mjs', sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, names: names[i], originalCjsLinkError: error });
}
process.chdir('apps/fixtures');
const server = await createServer({ server: { middlewareMode: true } });
try {
  const transformed = await server.transformRequest('/src/compositeStyleProbe.ts');
  assert.ok(transformed);
  assert.match(transformed.code, /floating-ui-react\/utils\/composite\.mjs/);
  assert.match(transformed.code, /internals\/composite\/composite\.mjs/);
  assert.doesNotMatch(transformed.code, /@base-ui\/react\/[^"']+composite\.js/);
  console.log(JSON.stringify({ observations, actualViteProbeEsmImports: 'PASS', browserAssertions: 0 }, null, 2));
} finally { await server.close(); }
