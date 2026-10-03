// Immutable describeConformance expansion; MIT. Repeated invocations earn zero ordinary credit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(process.argv[2] ?? '../direction-provider-upstream');
const inventory = JSON.parse(readFileSync(new URL('./upstream-inventory.json', import.meta.url), 'utf8'));
const upstream = inventory.upstream;
const base = JSON.parse(readFileSync(new URL('../input/conformance.json', import.meta.url), 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
const sources = Object.fromEntries(Object.entries(base.sources).filter(([path]) => path.startsWith('packages/react/test/')));
for (const [path, sha256] of Object.entries(sources)) {
  const source = execFileSync('git', ['-C', root, 'show', `${upstream.commit}:${path}`], { encoding: 'utf8' });
  if (hash(source) !== sha256) throw new Error(`Conformance helper source mismatch: ${path}`);
}
const parts = ['Field.Control', 'Field.Description', 'Field.Error', 'Field.Item', 'Field.Label', 'Field.Root', 'Fieldset.Legend', 'Fieldset.Root', 'Form'];
const invocations = inventory.conformance.map((invocation, index) => {
  const part = parts[index]; const refInstanceof = invocation.text.match(/refInstanceof: window\.(\w+)/)?.[1];
  const testRenderPropWith = invocation.text.match(/testRenderPropWith: '(\w+)'/)?.[1] ?? 'div';
  const inheritComponent = invocation.text.match(/inheritComponent: '(\w+)'/)?.[1] ?? null;
  return { id: `${invocation.source}:${invocation.line}`, part, declarationSha256: invocation.declarationSha256,
    options: { refInstanceof, testRenderPropWith, inheritComponent, only: ['propsSpread', 'refForwarding', 'renderProp', 'className'], skip: [], wrappingAllowed: true, button: false,
      wrapper: part === 'Fieldset.Legend' ? 'Fieldset.Root' : part === 'Field.Error' ? 'Field.Root invalid=true; minimal Field.Error match=true' : ['Field.Control', 'Field.Description', 'Field.Item', 'Field.Label'].includes(part) ? 'Field.Root' : null },
    helpers: base.helpers.map(helper => ({ sourceId: helper.sourceId, title: helper.title, sourceBodySha256: helper.sourceBodySha256, sourceCallbackSha256: helper.sourceCallbackSha256,
      assertionLines: helper.assertionLines, inactiveAssertionLines: helper.inactiveAssertionLines, scenario: helper.scenario,
      sourceConditions: helper.sourceConditions.map(condition => condition === 'Element=div' ? `Element=${testRenderPropWith}` : condition),
      status: 'uncredited-pending-execution', ordinaryDeclarationCredit: 0,
      test: 'tests/browser/field-form-conformance.spec.ts', fixtures: ['apps/fixtures/src/lib/FieldFormConformanceFixture.svelte', 'apps/fixtures/src/lib/field-form-conformance-reference.ts'],
      plannedExecutions: [`Svelte ${part} uncredited conformance ${helper.scenario}`, `React ${part} uncredited conformance ${helper.scenario}`] })) };
});
const output = JSON.stringify({ upstream, scope: 'Nine invocations of fifteen distinct helper declaration sites: 135 invocation mappings, 270 planned real React/Svelte executions. These are helpers, not the 209 ordinary family declaration sites. All helpers remain uncredited independently of execution.',
  sources, invocations, ordinaryDeclarationCredit: 0 }, null, 2) + '\n';
const destination = new URL('./conformance.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Field/Form conformance ledger differs from immutable source'); }
else writeFileSync(destination, output);
console.log(`Field/Form conformance: ${invocations.length} invocations; ${invocations.reduce((sum, invocation) => sum + invocation.helpers.length, 0)} helper mappings; zero ordinary credit`);
