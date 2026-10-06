// Causal native browser evidence only; never accepts setup failures as a red regression.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [action, backup, output] = process.argv.slice(2);
const pin = '7253ff00a95e93e3f87cc9292f7bb793aa91ec5c';
const files = [
  [
    'packages/base/src/lib/number-field/root/StepperButton.svelte',
    '090983122c632d14bda7310efa2f35d81af64767b28bb5bba5224e1175c11071',
  ],
  [
    'packages/base/src/lib/number-field/root/useNumberFieldStepperButton.svelte.ts',
    '57d609ddf29d3468b94bcbc6a39bf47be418b9bd222b6307fe574c4eddc8155d',
  ],
];
const distFiles = [
  'packages/base/dist/number-field/root/StepperButton.svelte',
  'packages/base/dist/number-field/root/useNumberFieldStepperButton.svelte.js',
];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const receiptFile = output && join(output, 'source-receipt.json');
const readReceipt = () => JSON.parse(readFileSync(receiptFile, 'utf8'));
const writeReceipt = (receipt) =>
  writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`);

export function validateRedReport(report) {
  const tests = [];
  function collect(suites) {
    for (const suite of suites) {
      for (const spec of suite.specs ?? [])
        tests.push(...spec.tests.map((test) => ({ ...test, title: spec.title })));
      collect(suite.suites ?? []);
    }
  }
  collect(report.suites);
  assert.deepEqual(report.errors, [], 'Red setup errors are not accepted');
  assert.equal(tests.length, 1);
  const test = tests[0];
  assert.equal(
    test.title,
    'svelte NumberField stepper native outro retains its actual host diagnostics',
  );
  assert.equal(test.expectedStatus, 'passed');
  assert.equal(test.results.length, 1);
  const result = test.results[0];
  assert.equal(result.status, 'failed');
  assert.match(result.error.message, /stepper-owner current host diagnostics/);
  const message = result.error.message
    .replaceAll(String.fromCharCode(27), '')
    .replace(/\[[\d;]*m/g, '');
  assert.match(message, /Expected length:\s*1/);
  assert.match(message, /Received length:\s*0/);
  const attachment = result.attachments.find((item) => item.name === 'stepper-owner-lifetime');
  assert.ok(attachment, 'Missing preceding native lifecycle observations');
  const observations = JSON.parse(
    attachment.path
      ? readFileSync(attachment.path, 'utf8')
      : Buffer.from(attachment.body, 'base64').toString('utf8'),
  );
  assert.deepEqual(observations, {
    mode: 'outro',
    lifetime: [
      {
        phase: 'start',
        outgoingConnected: true,
        incomingConnected: true,
        publishedHost: 'B',
        publishedIsIncoming: true,
      },
      {
        phase: 'end',
        outgoingConnected: false,
        incomingConnected: true,
        publishedHost: 'B',
        publishedIsIncoming: true,
      },
    ],
    publishedHost: 'B',
    diagnosticPhase: 'settled',
    diagnostics: [],
  });
  return observations;
}

if (action === 'prepare') {
  mkdirSync(output, { recursive: true });
  const modules = JSON.parse(
    readFileSync('parity/number-field/native-integration-closure.json', 'utf8'),
  ).localClosure.modules;
  assert.equal(modules.length, 152, 'Changed closure needs a new reviewed predecessor proof');
  for (const module of modules)
    assert.equal(hash(readFileSync(module.local)), module.sha256, module.local);
  const helper = 'packages/base/src/lib/internals/use-button/useButton.svelte.ts';
  assert.equal(
    hash(readFileSync(helper)),
    hash(execFileSync('git', ['show', `${pin}:${helper}`])),
    'The canonical Button API changed; old-body build cannot establish this causal proof',
  );
  const bodies = files.map(([file, predecessorHash], index) => {
    const current = readFileSync(file);
    const predecessor = execFileSync('git', ['show', `${pin}:${file}`]);
    assert.equal(hash(predecessor), predecessorHash, 'Immutable predecessor body mismatch');
    writeFileSync(join(backup, `${index}.current`), current);
    writeFileSync(join(backup, `${index}.predecessor`), predecessor);
    writeFileSync(join(output, `${index}.current`), current);
    writeFileSync(join(output, `${index}.predecessor`), predecessor);
    return { file, currentSha256: hash(current), predecessorSha256: predecessorHash };
  });
  writeReceipt({
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    predecessor: pin,
    bodies,
    modules,
    initialDist: distFiles.map((file, index) => {
      const bytes = readFileSync(file);
      writeFileSync(join(output, `${index}.initial-current.dist`), bytes);
      return { file, sha256: hash(bytes) };
    }),
    witness: [
      'apps/fixtures/src/lib/NumberFieldStepperOwnerBrowserFixture.svelte',
      'tests/browser/number-field.spec.ts',
    ].map((file) => ({ file, sha256: hash(readFileSync(file)) })),
    assertionCredit: 0,
  });
} else if (action === 'install-red') {
  const receipt = readReceipt();
  receipt.bodies.forEach((body, index) => {
    const predecessor = readFileSync(join(backup, `${index}.predecessor`));
    assert.equal(hash(predecessor), body.predecessorSha256);
    writeFileSync(body.file, predecessor);
    assert.equal(hash(readFileSync(body.file)), body.predecessorSha256);
  });
} else if (action === 'restore' || action === 'verify-current' || action === 'verify-red-source') {
  const receipt = readReceipt();
  if (action === 'restore')
    receipt.bodies.forEach((body, index) =>
      writeFileSync(body.file, readFileSync(join(backup, `${index}.current`))),
    );
  for (const module of receipt.modules) {
    const predecessor =
      action === 'verify-red-source' && receipt.bodies.find((body) => body.file === module.local);
    assert.equal(
      hash(readFileSync(module.local)),
      predecessor ? predecessor.predecessorSha256 : module.sha256,
      `Changed source: ${module.local}`,
    );
  }
  for (const witness of receipt.witness)
    assert.equal(
      hash(readFileSync(witness.file)),
      witness.sha256,
      'The red and current witness must have identical bytes',
    );
  if (action !== 'restore') {
    const phase = action === 'verify-red-source' ? 'red' : 'current';
    const dist = distFiles.map((file, index) => {
      const bytes = readFileSync(file);
      writeFileSync(join(output, `${index}.${phase}.dist`), bytes);
      if (phase === 'red')
        assert.notEqual(
          hash(bytes),
          receipt.initialDist[index].sha256,
          'Predecessor dist was not actually rebuilt',
        );
      else
        assert.equal(
          hash(bytes),
          receipt.initialDist[index].sha256,
          'Current dist differs from the initial actual build',
        );
      return { file, sha256: hash(bytes) };
    });
    receipt[`${phase}Built`] = { dist, witness: receipt.witness, unchangedClosureBodies: 150 };
    writeReceipt(receipt);
  }
  console.log('Source phase, identical witness, and all 152 closure hashes: PASS');
} else if (action === 'verify-selection') {
  const report = JSON.parse(readFileSync(join(output, 'red-selection-results.json'), 'utf8'));
  assert.deepEqual(report.errors, []);
  const specs = [];
  function collect(suites) {
    for (const suite of suites) {
      specs.push(...(suite.specs ?? []));
      collect(suite.suites ?? []);
    }
  }
  collect(report.suites);
  assert.equal(specs.length, 1);
  assert.equal(
    specs[0].title,
    'svelte NumberField stepper native outro retains its actual host diagnostics',
  );
  assert.equal(specs[0].tests.length, 1);
  console.log('Exact single causal outro browser selection: VERIFIED');
} else if (action === 'verify-red') {
  const report = JSON.parse(readFileSync(join(output, 'red-results.json'), 'utf8'));
  const observations = validateRedReport(report);
  writeFileSync(join(output, 'red-lifetime.json'), `${JSON.stringify(observations, null, 2)}\n`);
  const receipt = readReceipt();
  receipt.red = {
    status: 'actual ordinary assertion failure after verified lifecycle',
    resultSha256: hash(readFileSync(join(output, 'red-results.json'))),
    observations,
  };
  writeReceipt(receipt);
  console.log(
    'Exact predecessor ordinary diagnostic assertion RED after native overlap/disposal observations: VERIFIED',
  );
} else if (action === 'verify-green') {
  const path = '.checks/number-field/browser-results.json';
  const report = JSON.parse(readFileSync(path, 'utf8'));
  assert.deepEqual(report.errors, []);
  assert.equal(report.stats.expected, 65);
  assert.equal(report.stats.unexpected, 0);
  assert.equal(report.stats.skipped, 0);
  assert.equal(report.stats.flaky, 0);
  const receipt = readReceipt();
  receipt.green = {
    status: '65 maintained browser executions passed, zero retries or skips',
    resultSha256: hash(readFileSync(path)),
    stats: report.stats,
  };
  writeReceipt(receipt);
  console.log('Mandatory current full NumberField suite GREEN65: VERIFIED');
} else if (action !== undefined) {
  throw new Error(`Unknown action ${action}`);
}
