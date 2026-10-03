// Actual used NumberField closure and per-source correspondence; no assertion credit.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const hash = body => createHash('sha256').update(body).digest('hex');
const entries = ['packages/base/src/lib/number-field/index.ts'];
const queue = entries.map(local => ({ local, reachability: 'runtime' })), records = new Map();
function resolveImport(file, specifier) {
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const base = resolve(root, dirname(file), specifier);
  for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'), `${base}.ts`, `${base}/index.ts`]) if (existsSync(candidate)) return relative(root, candidate);
  throw new Error(`Unresolved ${file} → ${specifier}`);
}
while (queue.length) {
  const { local, reachability } = queue.shift();
  let record = records.get(local);
  if (!record) {
    const body = readFileSync(resolve(root, local), 'utf8');
    const code = local.endsWith('.svelte') ? [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n') : body;
    const ast = ts.createSourceFile(local, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS), imports = [], declarations = [];
    function edge(specifier, kind) { const resolved = resolveImport(local, specifier); if (!imports.some(edge => edge.resolved === resolved && edge.kind === kind)) imports.push({ specifier, kind, resolved }); }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause, names = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
        edge(node.moduleSpecifier.text, clause?.isTypeOnly || (!clause?.name && names?.length && names.every(name => name.isTypeOnly)) ? 'type' : 'runtime');
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) edge(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime');
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) edge(node.argument.literal.text, 'type');
      if ((ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name) declarations.push(node.name.text);
      ts.forEachChild(node, visit);
    }
    visit(ast); record = { local, sha256: hash(body), reachability: [], declarations, imports }; records.set(local, record);
  }
  if (record.reachability.includes(reachability)) continue;
  record.reachability.push(reachability);
  for (const edge of record.imports) if (!edge.resolved.startsWith('external:')) queue.push({ local: edge.resolved, reachability: reachability === 'type' || edge.kind === 'type' ? 'type' : 'runtime' });
}
const graph = JSON.parse(readFileSync(resolve(import.meta.dirname, 'source-graph.json'), 'utf8'));
const inherited = new Map();
for (const feature of ['field-form', 'boolean-controls', 'radio']) {
  const data = JSON.parse(readFileSync(resolve(root, `parity/${feature}/source-correspondence.json`), 'utf8'));
  for (const item of data.records ?? []) { const values = inherited.get(item.source) ?? []; values.push(item); inherited.set(item.source, values); }
}
const mappings = graph.modules.map(source => {
  const localCandidates = [];
  let correspondence;
  if (source.source.includes('/number-field/')) {
    const suffix = source.source.split('/number-field/')[1];
    const local = `packages/base/src/lib/number-field/${suffix.replace(/\.tsx$/, '.svelte').replace(/useNumberFieldStepperButton\.ts$/, 'useNumberFieldStepperButton.svelte.ts')}`;
    if (records.has(local)) localCandidates.push(local);
    if (suffix.endsWith('.tsx')) localCandidates.push('packages/base/src/lib/number-field/types.ts');
    correspondence = 'Actual used source business component/helper body; native runes/context/refs/snippets/attachments/events replace React representation. See per-function Markdown correspondence.';
  } else if (source.source === 'packages/react/src/internals/usePressAndHold.ts') {
    localCandidates.push('packages/base/src/lib/internals/usePressAndHold.svelte.ts');
    correspondence = 'Actual complete source start/stop/timer/pointer handlers. Native mount/unmount and reactive disabled synchronization own external timers and window listeners.';
  } else if (source.source.startsWith('packages/utils/')) {
    const suffix = source.source.split('/src/')[1];
    for (const candidate of [`packages/base/src/lib/utils/${suffix}`, `packages/base/src/lib/utils/${suffix.replace(/\.ts$/, '.svelte.ts')}`]) if (records.has(candidate)) localCandidates.push(candidate);
    correspondence = localCandidates.length ? 'Reuse canonical source utility body at its actual shared path; final NumberField review includes this exact out-of-diff body.' : undefined;
    if (suffix === 'useForcedRerendering.ts' || suffix === 'useValueAsRef.ts') {
      localCandidates.push('packages/base/src/lib/number-field/root/NumberFieldRoot.svelte');
      correspondence = suffix === 'useForcedRerendering.ts' ? 'Native inputRevision rune invalidates formatted external text synchronization; actual source setValue calls it after the same cancellation/order branches.' : 'Native live numeric/format readers and one same-interaction transient numeric slot preserve source commitValue write authority until DOM sync; no React render/ref tracking.';
    }
    if (suffix === 'warn.ts') { localCandidates.push('packages/base/src/lib/number-field/input/NumberFieldInput.svelte', 'packages/base/src/lib/utils/createLogOnce.ts'); correspondence = 'Actual canonical createLogOnce warn factory with Base UI prefix; React owner-stack text unavailable in native Svelte. Source clipboard catch/return preserved.'; }
    if (/^(safeReact|reactVersion|getReactElementRef|fastHooks)\.ts$/.test(suffix)) correspondence = 'Native snippets/setup/lifecycle/ref attachments replace React-only SafeReact/version/insertion/element-ref machinery under the user native-Svelte directive; no business helper is omitted.';
  }
  const reused = (inherited.get(source.source) ?? []).filter(item => item.local && records.has(item.local));
  for (const item of reused) localCandidates.push(item.local);
  if (!correspondence && reused.length) correspondence = 'Actual reused canonical Field/Form/Labelable/button/render/utility business dependency. All inherited bodies remain part of fresh final NumberField whole-closure source/native/maintainability review.';
  if (source.source.includes('/floating-ui-react/utils') || source.source === 'packages/utils/src/shadowDom.ts') {
    if (/\/(utils|shadowDom|element)\.ts$/.test(source.source)) localCandidates.push('packages/base/src/lib/utils/shadowDom.ts');
    correspondence = 'Only actual selected activeElement/getTarget and their canonical shadow-DOM business bodies are consumed. Other exports reached through original Floating barrels are explicitly unselected, not copied or claimed as implemented.';
  }
  if (!correspondence) correspondence = 'Unselected recursive barrel/type export or framework-only machinery: this original module is retained in the complete graph but no NumberField business symbol from it is imported by the actual local closure.';
  return { ...source, local: [...new Set(localCandidates)].filter(local => records.has(local)).map(local => ({ local, sha256: records.get(local).sha256 })), correspondence, inheritedEvidence: reused.map(item => ({ symbol: item.symbol, local: item.local, adaptation: item.adaptation ?? item.correspondence })), reviewStatus: 'implementation checkpoint; fresh final exact-head whole-closure review outstanding' };
});
const output = { pin: graph.pin, ordinaryDeclarationCredit: 0, publicParts: ['Root','Input','Group','Increment','Decrement','ScrubArea','ScrubAreaCursor'], sourceModules: mappings,
  unselectedFamilySourceFiles: ['utils/constants.ts', 'root/NumberFieldRootDataAttributes.ts', 'input/NumberFieldInputDataAttributes.ts', 'group/NumberFieldGroupDataAttributes.ts', 'increment/NumberFieldIncrementDataAttributes.ts', 'decrement/NumberFieldDecrementDataAttributes.ts', 'scrub-area/NumberFieldScrubAreaDataAttributes.ts', 'scrub-area-cursor/NumberFieldScrubAreaCursorDataAttributes.ts'].map(file => ({ source: `packages/react/src/number-field/${file}`, correspondence: file.endsWith('constants.ts') ? 'Original legacy timer constants have no import in the pinned family. Actual usePressAndHold owns its exact 60/400 source constants; no dead copy retained.' : 'Original standalone attribute constants have no import in the pinned public family. Actual canonical stateAttributesMapping/getStateAttributesProps generates those same attributes; no dead copy retained.' })),
  developmentDependencies: { platform: { pr: 55, publishedHead: '35ba718b3d6e425cab5729eb46fb1c30be2c042c', status: 'normally locally integrated unmerged development dependency; actual accepted main integration required before final acceptance' }, canonicalListeners: { pr: 42, publishedHead: '17006204a66c9ddb77cade10f83605b51925569a', files: ['utils/addEventListener.ts','utils/mergeCleanups.ts'], status: 'exact canonical published bodies reused at same paths; fresh final entire-closure review required' } },
  localClosure: { entries, status: 'actual-used runtime/type imports, not accepted review evidence', modules: [...records.values()].sort((a,b) => a.local.localeCompare(b.local)) } };
const text = JSON.stringify(output,null,2)+'\n';
const destination = resolve(import.meta.dirname,'source-correspondence.json');
if (process.argv.includes('--check')) { if(readFileSync(destination,'utf8') !== text) throw new Error('NumberField actual source correspondence is stale'); }
else writeFileSync(destination,text);
console.log(`${graph.modules.length} original modules; ${records.size} actual used local modules; zero ordinary credit`);
