// Exact f2-to-delivery identity proof; no new manual review or assertion credit.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const previousHead = 'f2fa90c077627070de519237bcb2412f8f20b460';
const acceptedMain = 'dc2fb8247750b519efab708fc221c201f8cfd517';
const integration = 'd7170f2efdb4e9a43d8a864c268152dbec555038';
const hash = body => createHash('sha256').update(body).digest('hex');
const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
const object = (head, file) => git(['show', `${head}:${file}`]);
const graphFile = 'parity/number-field/source-correspondence.json';
const graphBody = readFileSync(resolve(root, graphFile), 'utf8');
assert.equal(graphBody, object(previousHead, graphFile));
const graph = JSON.parse(graphBody);
const modules = graph.localClosure.modules.map(module => {
  const body = readFileSync(resolve(root, module.local), 'utf8');
  assert.equal(hash(body), module.sha256, module.local);
  assert.equal(body, object(previousHead, module.local), module.local);
  assert.equal(body, object(integration, module.local), module.local);
  return {
    local: module.local, sha256: module.sha256, bodyInherited: true,
    importsInherited: true, reachabilityInherited: true,
    imports: module.imports, reachability: module.reachability,
    manualScope: 'Eligible only for this exact module complete-body scope in the independent f2 audit, with unchanged current imports/callers. Machine identity grants no manual reading or current-head verdict.',
  };
});
const parents = git(['show', '-s', '--format=%P', integration]).trim().split(' ');
assert.deepEqual(parents, [previousHead, acceptedMain]);
const incomingLibraryFiles = git(['diff', '--name-only', `${acceptedMain}^1`, acceptedMain, '--', 'packages/base/src/lib']).trim().split('\n').filter(Boolean);
const selected = new Set(modules.map(module => module.local));
const selectedIncomingFiles = incomingLibraryFiles.filter(file => selected.has(file));
assert.deepEqual(selectedIncomingFiles, []);
const indexFile = 'packages/base/src/lib/index.ts';
const indexBody = readFileSync(resolve(root, indexFile), 'utf8');
assert.equal(indexBody, object(acceptedMain, indexFile) + "export * from './number-field/index.js';\n");
const packageFile = 'packages/base/package.json';
const packageBody = readFileSync(resolve(root, packageFile), 'utf8');
const currentPackage = JSON.parse(packageBody);
const mainPackage = JSON.parse(object(acceptedMain, packageFile));
assert.deepEqual(currentPackage.exports['./number-field'], {
  types: './dist/number-field/index.d.ts', svelte: './dist/number-field/index.js', default: './dist/number-field/index.js',
});
delete currentPackage.exports['./number-field'];
assert.deepEqual(currentPackage, mainPackage);
const output = {
  sourcePin: graph.pin, previousHead,
  previousTree: git(['rev-parse', `${previousHead}^{tree}`]).trim(), acceptedMain,
  normalIntegration: { head: integration, parents, tree: git(['rev-parse', `${integration}^{tree}`]).trim() },
  historicalProofs: ['integration-inheritance.json', 'current-main-inheritance.json'],
  localGraphSHA256: hash(graphBody),
  counts: {
    modules: modules.length, runtime: modules.filter(module => module.reachability.includes('runtime')).length,
    typeOnly: modules.filter(module => !module.reachability.includes('runtime')).length,
    directEdges: modules.reduce((count, module) => count + module.imports.length, 0),
    inheritedBodies: modules.length, inheritedImports: modules.length, inheritedReachability: modules.length,
    changedSelectedBodies: 0, newSelectedModules: 0, removedSelectedModules: 0,
  },
  incomingLibraryFiles, selectedIncomingFiles,
  publicSeam: { indexSHA256: hash(indexBody), packageSHA256: hash(packageBody), result: 'Exact accepted-main root and package exports plus NumberField only; all other package metadata/dependencies unchanged.' },
  status: 'Machine proof only. Preserve individually scoped f2 Source/native/maintainability evidence; freshly review the delivery documentation and six authored native characterizations. New-head hosted gates, configured review and Root exact-head PM approval remain required.',
  ordinaryDeclarationCredit: 0, modules,
};
assert.deepEqual(output.counts, { modules: 132, runtime: 73, typeOnly: 59, directEdges: 517, inheritedBodies: 132, inheritedImports: 132, inheritedReachability: 132, changedSelectedBodies: 0, newSelectedModules: 0, removedSelectedModules: 0 });
const text = JSON.stringify(output, null, 2) + '\n';
const destination = resolve(import.meta.dirname, 'delivery-inheritance.json');
if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), text, 'Stale delivery proof');
else writeFileSync(destination, text);
console.log(JSON.stringify(output.counts));
