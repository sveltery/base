// Byte/import/reachability inheritance for the actual normal-main successor; no review credit.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const previousHead = '3da0a1b3f8744fe4f26e6876dd4d9942e5afb46f';
const acceptedMain = '74f667da95ebc5670b0cc5bee38f2225e65fd0c0';
const integration = '378aa8d87add90123f8f582ae6e79d68c0ab279b';
const hash = body => createHash('sha256').update(body).digest('hex');
const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
const object = (head, file) => git(['show', `${head}:${file}`]);
const file = 'parity/number-field/source-correspondence.json';
const currentBody = readFileSync(resolve(root, file), 'utf8');
const current = JSON.parse(currentBody);
const previous = JSON.parse(object(previousHead, file));
const oldModules = new Map(previous.localClosure.modules.map(module => [module.local, module]));
const mainFiles = new Set(git(['ls-tree', '-r', '--name-only', acceptedMain]).trim().split('\n'));
const modules = current.localClosure.modules.map(module => {
  const prior = oldModules.get(module.local);
  const body = readFileSync(resolve(root, module.local), 'utf8');
  if (module.sha256 !== hash(body)) throw new Error(`Stale current module: ${module.local}`);
  if (prior && prior.sha256 !== hash(object(previousHead, module.local))) throw new Error(`Stale previous module: ${module.local}`);
  return {
    local: module.local,
    currentSHA256: module.sha256,
    previousSHA256: prior?.sha256 ?? null,
    bodyInherited: prior?.sha256 === module.sha256,
    importsInherited: prior ? JSON.stringify(prior.imports) === JSON.stringify(module.imports) : false,
    reachabilityInherited: prior ? JSON.stringify(prior.reachability) === JSON.stringify(module.reachability) : false,
    reachability: module.reachability,
    imports: module.imports,
    mainSHA256: mainFiles.has(module.local) ? hash(object(acceptedMain, module.local)) : null,
    byteIdenticalMain: mainFiles.has(module.local) && hash(object(acceptedMain, module.local)) === module.sha256,
  };
});
const removed = [...oldModules.keys()].filter(local => !modules.some(module => module.local === local));
const changed = modules.filter(module => !module.bodyInherited);
const button = 'packages/base/src/lib/internals/use-button/useButton.svelte.ts';
const currentButton = readFileSync(resolve(root, button), 'utf8');
const priorButton = object(previousHead, button);
const replacements = [
  ['Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. ', ''],
  ['Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as `role` or `aria-disabled`). ', ''],
];
let normalized = currentButton;
for (const [added, old] of replacements) {
  if (normalized.split(added).length !== 2) throw new Error('Expected one exact canonical DEV paragraph');
  normalized = normalized.replace(added, old);
}
if (normalized !== priorButton) throw new Error('Changes beyond the two source DEV paragraphs');
if (hash(currentButton) !== 'ee71d7077c51139162152716111472919bf80b71e6e9cde62d15ff0b7ce56f59') throw new Error('Canonical complete useButton differs');
if (changed.length !== 1 || changed[0].local !== button || removed.length || modules.some(module => !module.importsInherited || !module.reachabilityInherited)) throw new Error('Unexpected used-closure integration delta');
const parents = git(['show', '-s', '--format=%P', integration]).trim().split(' ');
if (parents.length !== 2 || parents[0] !== previousHead || parents[1] !== acceptedMain) throw new Error('Expected actual normal integration parents');
const output = {
  sourcePin: current.pin,
  previousHead,
  previousTree: git(['rev-parse', `${previousHead}^{tree}`]).trim(),
  previousIndependentReceiptSHA256: '73f9cc9c2c0b9ba23bf089ceab445f3107847d9ece847ab6b02dca982b2b4b2f',
  previousReview: 'Whole-used-closure source/native/maintainability clear at repaired3da; exact successor review remains required. Historical blocked31 raw evidence is preserved.',
  acceptedMain,
  normalIntegration: { head: integration, parents, tree: git(['rev-parse', `${integration}^{tree}`]).trim() },
  localGraphSHA256: hash(currentBody),
  counts: {
    modules: modules.length,
    runtime: modules.filter(module => module.reachability.includes('runtime')).length,
    typeOnly: modules.filter(module => !module.reachability.includes('runtime')).length,
    inheritedBodies: modules.filter(module => module.bodyInherited).length,
    changedBodies: changed.length,
    newModules: modules.filter(module => module.previousSHA256 === null).length,
    removedModules: removed.length,
    inheritedImports: modules.filter(module => module.importsInherited).length,
    inheritedReachability: modules.filter(module => module.reachabilityInherited).length,
    exactMainBodies: modules.filter(module => module.byteIdenticalMain).length,
  },
  changedBodies: changed.map(module => module.local),
  removedModules: removed,
  canonicalButtonProof: { local: button, sha256: hash(currentButton), onlyTwoCompleteDEVParagraphsChanged: true, allOtherBytesEqualRepaired3da: true, selectedBodyReviewDoesNotAcceptWholeDialogOrOtherFeatures: true },
  status: 'Machine inheritance evidence only; final whole-used-body independent source/native/maintainability review and current checks remain required; zero ordinary credit.',
  modules,
};
const text = JSON.stringify(output, null, 2) + '\n';
const destination = resolve(import.meta.dirname, 'integration-inheritance.json');
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== text) throw new Error('Stale NumberField normal integration inheritance');
} else writeFileSync(destination, text);
console.log(JSON.stringify(output.counts));
