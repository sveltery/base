// Actual f8-to-current-main body/import proof. Machine identity supplies no manual review credit.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const previousHead = 'f8c57282fe6a231bb0122027173a2d44a925bd47';
const acceptedMain = '95d3d2ae473dc18a2b9a48112284383a2c392315';
const integration = '17412f57729e1e103f6c1e9eb558a772507d57c6';
const hash = body => createHash('sha256').update(body).digest('hex');
const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
const object = (head, file) => git(['show', `${head}:${file}`]);
const sourceFile = 'parity/number-field/source-correspondence.json';
const currentBody = readFileSync(resolve(root, sourceFile), 'utf8');
const current = JSON.parse(currentBody);
const previous = JSON.parse(object(previousHead, sourceFile));
const oldModules = new Map(previous.localClosure.modules.map(module => [module.local, module]));
const mainFiles = new Set(git(['ls-tree', '-r', '--name-only', acceptedMain]).trim().split('\n'));
const changedExpected = new Map([
  ['packages/base/src/lib/internals/useAnimationsFinished.ts', '0ae8873174969326a7ac09377ab019af5cd575bbdfde7df9118317d0ec1c1e30'],
  ['packages/base/src/lib/internals/useOpenChangeComplete.svelte.ts', '5e966dd1b10cbc1ed448d3583ca948a384d812f9e71afc1e128395485575931f'],
]);
const modules = current.localClosure.modules.map(module => {
  const prior = oldModules.get(module.local);
  assert.ok(prior, `Unexpected new module: ${module.local}`);
  const body = readFileSync(resolve(root, module.local), 'utf8');
  assert.equal(hash(body), module.sha256, `Current body: ${module.local}`);
  assert.equal(hash(object(previousHead, module.local)), prior.sha256, `Prior body: ${module.local}`);
  assert.equal(body, object(integration, module.local), `Runtime/type source changed after integration: ${module.local}`);
  const mainSHA256 = mainFiles.has(module.local) ? hash(object(acceptedMain, module.local)) : null;
  return {
    local: module.local,
    currentSHA256: module.sha256,
    previousSHA256: prior.sha256,
    bodyInherited: module.sha256 === prior.sha256,
    importsInherited: JSON.stringify(module.imports) === JSON.stringify(prior.imports),
    reachabilityInherited: JSON.stringify(module.reachability) === JSON.stringify(prior.reachability),
    reachability: module.reachability,
    imports: module.imports,
    mainSHA256,
    byteIdenticalMain: mainSHA256 === module.sha256,
    reviewScope: module.sha256 === prior.sha256
      ? 'Eligible only for this module\'s exact complete-body manual scope in the f8 independent audit; hash identity alone supplies no manual scope or successor verdict.'
      : 'Incoming accepted-main canonical body; freshly examine selected type contract and incoming caller/import boundary. Type-only reachability grants no NumberField runtime execution or whole consuming feature acceptance.',
  };
});
const changed = modules.filter(module => !module.bodyInherited);
assert.equal(modules.length, 132);
assert.equal(oldModules.size, modules.length);
assert.equal(changed.length, changedExpected.size);
for (const module of changed) {
  assert.equal(module.currentSHA256, changedExpected.get(module.local));
  assert.deepEqual(module.reachability, ['type']);
  assert.ok(module.byteIdenticalMain);
}
assert.ok(modules.every(module => module.reachabilityInherited));
assert.equal(modules.filter(module => !module.importsInherited).length, 1);
const animation = current.localClosure.modules.find(module => module.local.endsWith('/useAnimationsFinished.ts'));
const oldAnimation = oldModules.get(animation.local);
assert.deepEqual(animation.imports.slice(1), oldAnimation.imports);
assert.deepEqual(animation.imports[0], { specifier: 'svelte', kind: 'runtime', resolved: 'external:svelte' });
const parents = git(['show', '-s', '--format=%P', integration]).trim().split(' ');
assert.deepEqual(parents, [previousHead, acceptedMain]);
const output = {
  sourcePin: current.pin,
  previousHead,
  previousTree: git(['rev-parse', `${previousHead}^{tree}`]).trim(),
  acceptedMain,
  normalIntegration: { head: integration, parents, tree: git(['rev-parse', `${integration}^{tree}`]).trim() },
  historicalProof: 'integration-inheritance.json and record-integration.mjs remain unchanged at their named 3da-to-f8 checkpoint; run that historical generator from f8, not from this changed current closure.',
  localGraphSHA256: hash(currentBody),
  counts: {
    modules: modules.length,
    runtime: modules.filter(module => module.reachability.includes('runtime')).length,
    typeOnly: modules.filter(module => !module.reachability.includes('runtime')).length,
    edges: modules.reduce((count, module) => count + module.imports.length, 0),
    inheritedBodies: modules.filter(module => module.bodyInherited).length,
    changedBodies: changed.length,
    newModules: 0,
    removedModules: 0,
    inheritedImports: modules.filter(module => module.importsInherited).length,
    inheritedReachability: modules.filter(module => module.reachabilityInherited).length,
    exactMainBodies: modules.filter(module => module.byteIdenticalMain).length,
  },
  changedBodies: changed.map(module => module.local),
  status: 'Machine proof only. Individual f8 manual scopes require exact body/contract checks; the current final-head independent Source/native/maintainability review, hosted gates and Root PM approval remain required. Zero ordinary declaration credit.',
  ordinaryDeclarationCredit: 0,
  modules,
};
const text = JSON.stringify(output, null, 2) + '\n';
const destination = resolve(import.meta.dirname, 'current-main-inheritance.json');
if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), text, 'Stale current-main proof');
else writeFileSync(destination, text);
console.log(JSON.stringify(output.counts));
