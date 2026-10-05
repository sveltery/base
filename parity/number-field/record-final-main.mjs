// Exact final accepted-main integration; per-body machine identity is not manual review.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const previousHead = '947c23eaeda34a86f347958159b3f5166e165b70';
const reviewedHead = 'f2fa90c077627070de519237bcb2412f8f20b460';
const acceptedMain = 'c1600456d3b4e72910d42823b9df69280c74a262';
const integration = '6a126f6db42ad1e30ca81a3238993ec2780c8530';
const hash = body => createHash('sha256').update(body).digest('hex');
const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
const object = (head, file) => git(['show', `${head}:${file}`]);
const graphFile = 'parity/number-field/source-correspondence.json';
const graphBody = readFileSync(resolve(root, graphFile), 'utf8');
assert.equal(graphBody, object(reviewedHead, graphFile));
assert.equal(graphBody, object(previousHead, graphFile));
const graph = JSON.parse(graphBody);
const previousProof = JSON.parse(readFileSync(resolve(import.meta.dirname, 'delivery-inheritance.json'), 'utf8'));
const priorRows = new Map(previousProof.modules.map(module => [module.local, module]));
const modules = graph.localClosure.modules.map(module => {
  const prior = priorRows.get(module.local);
  assert.ok(prior, module.local);
  assert.equal(module.sha256, prior.sha256);
  assert.deepEqual(module.imports, prior.imports);
  assert.deepEqual(module.reachability, prior.reachability);
  const body = readFileSync(resolve(root, module.local), 'utf8');
  assert.equal(hash(body), module.sha256, module.local);
  for (const head of [reviewedHead, previousHead, integration]) assert.equal(body, object(head, module.local), module.local);
  return {
    local: module.local, sha256: module.sha256, bodyInherited: true,
    importsSHA256: hash(JSON.stringify(module.imports)), importsInherited: true,
    reachability: module.reachability, reachabilityInherited: true,
    manualScope: 'Only this exact complete-body/import/caller scope from the independent f2 audit is individually eligible; delivery-inheritance.json retains its complete imports. No machine or whole-verdict review credit.',
  };
});
const parents = git(['show', '-s', '--format=%P', integration]).trim().split(' ');
assert.deepEqual(parents, [previousHead, acceptedMain]);
const incomingLibraryFiles = git(['diff', '--name-only', `${acceptedMain}^1`, acceptedMain, '--', 'packages/base/src/lib']).trim().split('\n').filter(Boolean);
const selected = new Map(modules.map(module => [module.local, module]));
const selectedIncomingFiles = incomingLibraryFiles.filter(file => selected.has(file)).map(local => {
  const mainSHA256 = hash(object(acceptedMain, local));
  assert.equal(mainSHA256, selected.get(local).sha256);
  return { local, mainSHA256, byteIdenticalReviewedAndCurrent: true };
});
assert.deepEqual(selectedIncomingFiles.map(module => module.local).sort(), ['packages/base/src/lib/utils/addEventListener.ts', 'packages/base/src/lib/utils/clamp.ts']);
const indexFile = 'packages/base/src/lib/index.ts';
const indexBody = readFileSync(resolve(root, indexFile), 'utf8');
assert.equal(indexBody, object(acceptedMain, indexFile) + "export * from './number-field/index.js';\n");
const packageFile = 'packages/base/package.json';
const packageBody = readFileSync(resolve(root, packageFile), 'utf8');
const currentPackage = JSON.parse(packageBody);
assert.deepEqual(currentPackage.exports['./number-field'], { types: './dist/number-field/index.d.ts', svelte: './dist/number-field/index.js', default: './dist/number-field/index.js' });
delete currentPackage.exports['./number-field'];
assert.deepEqual(currentPackage, JSON.parse(object(acceptedMain, packageFile)));
const preserved = ['source-graph.json', 'source-correspondence.json', 'integration-inheritance.json', 'record-integration.mjs', 'current-main-inheritance.json', 'record-current-main.mjs', 'delivery-inheritance.json', 'record-delivery.mjs'].map(file => {
  const path = `parity/number-field/${file}`, body = readFileSync(resolve(root, path), 'utf8');
  assert.equal(body, object(previousHead, path), path);
  return { path, sha256: hash(body), byteIdentical947: true };
});
for (const head of [previousHead, acceptedMain]) {
  for (const paragraph of object(head, 'docs/upstream-differences.md').trim().split('\n\n')) assert.ok(readFileSync(resolve(root, 'docs/upstream-differences.md'), 'utf8').includes(paragraph), `Compatibility history lost: ${head}`);
}
const catalog = JSON.parse(readFileSync(resolve(root, 'parity/catalog.json'), 'utf8'));
const catalogCounts = Object.fromEntries(['bounded', 'unimplemented'].map(status => [status, catalog.modules.filter(module => module.status === status).length]));
assert.deepEqual(catalogCounts, { bounded: 27, unimplemented: 15 });
assert.ok(readFileSync(resolve(root, 'docs/catalog.md'), 'utf8').includes(`These ${catalogCounts.bounded} modules are bounded and the remaining ${catalogCounts.unimplemented} are unimplemented.`));
const output = {
  sourcePin: graph.pin, previousHead, reviewedHead, acceptedMain,
  normalIntegration: { head: integration, parents, tree: git(['rev-parse', `${integration}^{tree}`]).trim() },
  localGraphSHA256: hash(graphBody),
  counts: { modules: modules.length, runtime: modules.filter(module => module.reachability.includes('runtime')).length, typeOnly: modules.filter(module => !module.reachability.includes('runtime')).length, directEdges: graph.localClosure.modules.reduce((count, module) => count + module.imports.length, 0), inheritedBodies: modules.length, inheritedImports: modules.length, inheritedReachability: modules.length, changedSelectedBodies: 0 },
  selectedIncomingFiles,
  publicSeam: { indexSHA256: hash(indexBody), packageSHA256: hash(packageBody), result: 'Exact accepted-main root/subpaths plus NumberField only; all remaining package metadata/dependencies unchanged.' },
  catalogCounts, historicalFiles: preserved,
  status: 'Machine proof only. Individual f2 Source/native/maintainability scopes remain eligible, with fresh current documentation/characterization review, hosted gates, configured review/disposition, bug tracking and Root exact-head PM approval required. Historical947/f2 execution is not current-head acceptance.',
  ordinaryDeclarationCredit: 0, modules,
};
assert.deepEqual(output.counts, { modules: 132, runtime: 73, typeOnly: 59, directEdges: 517, inheritedBodies: 132, inheritedImports: 132, inheritedReachability: 132, changedSelectedBodies: 0 });
const text = JSON.stringify(output, null, 2) + '\n';
const destination = resolve(import.meta.dirname, 'final-main-inheritance.json');
if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), text, 'Stale final-main proof');
else writeFileSync(destination, text);
console.log(JSON.stringify(output.counts));
