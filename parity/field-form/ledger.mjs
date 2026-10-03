// Source-bound incomplete-scope ledger. MIT. Classifications never manufacture execution credit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const root = resolve(process.argv[2] ?? '../direction-provider-upstream');
const inventory = JSON.parse(readFileSync(new URL('./upstream-inventory.json', import.meta.url), 'utf8'));
const nativePorts = JSON.parse(readFileSync(new URL('./fieldset-ports.json', import.meta.url), 'utf8'));
const primitivePorts = JSON.parse(readFileSync(new URL('./primitive-ports.json', import.meta.url), 'utf8'));
const validationPorts = JSON.parse(readFileSync(new URL('./validation-ports.json', import.meta.url), 'utf8'));
const portsById = new Map([...nativePorts.ports, ...primitivePorts.ports, ...validationPorts.ports].map(port => [port.id, port]));
const bodies = new Map();
const declarationsById = new Map(inventory.declarations.map(declaration => [declaration.id, declaration]));
for (const source of new Set(inventory.declarations.map(declaration => declaration.source))) {
  const text = execFileSync('git', ['-C', root, 'show', `${inventory.upstream.commit}:${source}`], { encoding: 'utf8' });
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = node => {
    if (ts.isCallExpression(node)) {
      const body = node.arguments.find(argument => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));
      const id = `${source}:${tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1}`;
      const declaration = declarationsById.get(id);
      if (body && declaration) {
        const text = body.body.getText(tree);
        if (createHash('sha256').update(text).digest('hex') === declaration.bodySha256) bodies.set(id, text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const families = ['CheckboxGroup', 'Checkbox', 'RadioGroup', 'Radio', 'Switch', 'NumberField', 'Select', 'Slider'];
const renderCountSites = ['packages/react/src/field/control/FieldControl.test.tsx:26', 'packages/react/src/field/control/FieldControl.test.tsx:54'];
const declarations = inventory.declarations.map(declaration => {
  const body = bodies.get(declaration.id);
  if (!body) throw new Error(`Missing immutable declaration body: ${declaration.id}`);
  const dependencies = families.filter(family => new RegExp(`\\b${family}\\b`).test(body));
  const reactLifecycle = /\.react17\.test\.tsx$/.test(declaration.source) || renderCountSites.includes(declaration.id) || /\b(?:React\.)?(?:Activity|Suspense|StrictMode|strictMode)\b/.test(body);
  const port = portsById.get(declaration.id);
  if (port && port.bodySha256 !== declaration.bodySha256) throw new Error(`Native port source body differs: ${declaration.id}`);
  return { id: declaration.id, title: declaration.title, bodySha256: declaration.bodySha256, assertionLines: declaration.assertions.map(assertion => assertion.line),
    status: dependencies.length ? 'deferred-consumer-family' : reactLifecycle ? 'deferred-react-lifecycle-contract' : port ? 'native-dom-port-pending-final-gates' : 'unported',
    reason: dependencies.length ? `The exact declaration uses ${dependencies.join(', ')}; a text-input substitute cannot establish its consumer contract.` : reactLifecycle ? 'The exact declaration uses React17, React lifecycle/scheduler behavior or React render counts. Svelte observable supplements do not execute that lifecycle contract.' : port ? 'Complete native DOM body and assertion adaptation passed locally; bounded source/public/closure/browser gates passed at8619e34/8438374. Ordinary-assertion-specific final review, execution accounting and approved main-merge acceptance remain pending. No ordinary credit is awarded.' : 'No complete ordinary source declaration port has been executed. Related grouped supplements remain separate and uncredited.',
    dependencies, port: port ? { file: port.port, declarationLine: port.portDeclarationLine, bodySha256: port.portBodySha256, assertionLines: port.portAssertionLines } : null, ordinaryDeclarationCredit: 0 };
});
const counts = declarations.reduce((result, declaration) => { result[declaration.status] = (result[declaration.status] ?? 0) + 1; return result; }, {});
const output = JSON.stringify({ upstream: inventory.upstream,
  scope: 'All 209 immutable ordinary declaration sites accounted for. Forty-two complete native DOM body adaptations are separately mapped in fieldset-ports.json, primitive-ports.json and validation-ports.json and await ordinary-assertion-specific final review, execution accounting and approved main-merge acceptance with zero credit; bounded source/public/closure/browser gates passed separately. The stale-error template has both source mode executions but remains one declaration. Consumer/lifecycle classifications identify concrete blockers, not approved differences or completed parity; no grouped supplement is credited.',
  counts, ordinaryDeclarationCredit: 0, declarations,
  helperInventory: { file: 'conformance.json', invocations: 9, distinctHelperDeclarationSites: 15, invocationMappings: 135, plannedRealReactSvelteExecutions: 270, ordinaryDeclarationCredit: 0, status: 'bounded-source-270-conformance-executions-passed-ordinary-helper-credit-accounting-pending' },
  typeAssertions: inventory.typeAssertions.map(assertion => ({ id: `${assertion.source}:${assertion.line}`, assertion: assertion.text, port: 'packages/base/tests/field-form.types.ts', status: 'source-type-check-and-public-contract-consumers-passed-unchanged-body-public-execution-and-credit-accounting-separate', ordinaryDeclarationCredit: 0 })),
  supplements: [
    { file: 'packages/base/tests/dom/field-form.test.ts', executions: 22, status: 'passing-local-dom', checkpoint: '275b50d6be0f69d29ac999e043e241db044002f4', ordinaryDeclarationCredit: 0 },
    { file: 'packages/base/tests/field-form-ssr.test.ts', executions: 4, status: 'passing-local-ssr', checkpoint: 'f2515eb481880e88a94bdf9f377077817814d749', ordinaryDeclarationCredit: 0 },
    { file: 'tests/browser/field-form.spec.ts', executions: 34, status: 'passing-secured-paired-browser', evidence: 'browser-evidence.json', ordinaryDeclarationCredit: 0 },
    { file: 'tests/browser/field-form-remote.spec.ts', acceptanceSupplements: 9, diagnosticExecutions: 3, unmetAcceptanceWitness: 1, status: 'invalid-submit-no-effect-requirement-fails', checkpoint: 'cfbe5eb867f498b57828911ff5acc1177f405a99', ordinaryDeclarationCredit: 0 },
    { file: 'packages/base/tests/dom/field-error-ownership.test.ts', executions: 8, status: 'passing-local-actual-pin-matched-dom', checkpoint: 'a168a1502d517a0deb9aca5ed060228a57fd286e', ordinaryDeclarationCredit: 0 },
  ] }, null, 2) + '\n';
const destination = new URL('./ledger.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Field/Form incomplete-scope ledger differs from immutable source'); }
else writeFileSync(destination, output);
console.log(`Field/Form ordinary ledger: ${declarations.length} sites; ${JSON.stringify(counts)}; zero ordinary credit`);
