// Test-only exact historical owner transport reproduction. Source business is never patched.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { stripVTControlCharacters } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = 'packages/base/src/lib/tabs/tab/TabsTab.svelte';
const witness = 'packages/base/tests/browser/tabs-attachment-lifetime.svelte.test.ts';
const archivePath = 'parity/tabs/native-button-owner-predecessor.json';
const archive = JSON.parse(readFileSync(resolve(root, archivePath), 'utf8'));
const predecessor = archive.files.find((record) => record.file === runtime);
assert.ok(predecessor, 'Full own TabsTab predecessor must exist');
const hash = (body) => createHash('sha256').update(body).digest('hex');
const predecessorBytes = Buffer.from(predecessor.body);
assert.equal(
  hash(predecessorBytes),
  predecessor.sha256,
  'Immutable predecessor bytes must match archive',
);
assert.equal(archive.sourcePin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
assert.equal(archive.runtimePredecessorCommit, 'f7a1ccca6b37425fe2ca81e4cf5474ac5bb6dfdf');
function replaceOnce(body, before, after) {
  assert.equal(
    body.split(before).length - 1,
    1,
    'Each bounded caller transform must occur exactly once',
  );
  return body.replace(before, after);
}
let expectedCurrent = replaceOnce(
  predecessor.body,
  '  const { getButtonProps, buttonRef } = useButton(() => ({',
  '  const button = useButton(() => ({',
);
expectedCurrent = replaceOnce(
  expectedCurrent,
  '    focusableWhenDisabled: true,\n  }));',
  '    focusableWhenDisabled: true,\n  }));\n  const { getButtonProps, buttonRef } = button;',
);
expectedCurrent = replaceOnce(
  expectedCurrent,
  '          buttonRef?.(null);',
  '          if (button.element === host) buttonRef(null);',
);
const currentBytes = readFileSync(resolve(root, runtime));
assert.deepEqual(
  currentBytes,
  Buffer.from(expectedCurrent),
  'Only the reviewed exact caller guard postimage may run',
);
const currentHash = hash(currentBytes);
// Exact 8bfd witness bytes and measured serialized poll callsites are retained
// in native-button-owner-reporter-predecessor.json; Source/runtime are unchanged.
const witnessHash = hash(readFileSync(resolve(root, witness)));
assert.equal(
  witnessHash,
  '900a00cc32014849e6bb38d05e9ee986b051ddc1d0f70696bdd58ab4f7e25209',
  'Only the exact measured browser witness bytes may run',
);
function validateExpectedRed(report, log) {
  assert.equal(report.numTotalTests, 2);
  assert.equal(report.numFailedTests, 2);
  assert.equal(report.numPassedTests, 0);
  assert.equal(report.numPendingTests, 0);
  assert.equal(report.numTodoTests, 0);
  assert.equal(report.numPendingTestSuites, 0);
  assert.doesNotMatch(
    log,
    /Unhandled Errors|Unhandled Rejection|Uncaught Exception|Error during test collection|Failed to load url|browserType\.launch|Failed to launch|Test timed out/,
  );
  assert.equal(
    report.testResults[0]?.message,
    '',
    'No transform, launch, collection or suite error may count as red evidence',
  );
  assert.equal(report.testResults.length, 1);
  assert.ok(
    report.testResults[0].name.endsWith(
      '/packages/base/tests/browser/tabs-attachment-lifetime.svelte.test.ts',
    ),
    'Only the exact focused witness suite may count',
  );
  const expectedFailures = new Map([
    [
      'retained old native outro cleanup leaves the current Tabs button disabled synchronization owned',
      { message: /expected true to be false/, callsite: '60:108' },
    ],
    [
      'retained old native outro cleanup leaves the current Tabs button diagnostic owned',
      { message: /expected false to be true/, callsite: '74:125' },
    ],
  ]);
  const assertions = report.testResults[0].assertionResults;
  assert.equal(assertions.length, 2);
  for (const assertion of assertions) {
    assert.equal(assertion.status, 'failed');
    const expected = expectedFailures.get(assertion.fullName);
    assert.ok(expected, 'Only the two intended owner witnesses may fail');
    const pattern = expected.message;
    assert.equal(
      assertion.failureMessages.length,
      1,
      'Exactly one intended assertion error per case is required',
    );
    const failures = stripVTControlCharacters(assertion.failureMessages.join('\n'));
    assert.equal(
      failures.split('\n')[0],
      `Error: ${pattern.source} // Object.is equality`,
      'The exact known poll assertion message is required',
    );
    assert.match(
      failures,
      /at Proxy\.__VITEST_POLL_CHAIN__ /,
      'The actual Vitest poll assertion chain is required',
    );
    assert.match(
      failures,
      new RegExp(
        String.raw`at [^\n]*\/packages\/base\/tests\/browser\/tabs-attachment-lifetime\.svelte\.test\.ts\?import&browserv=\d+:${expected.callsite}(?:\n|$)`,
      ),
      'The error must originate at its exact measured poll callsite in the focused witness URL',
    );
    assert.ok(
      stripVTControlCharacters(log).includes(
        `AssertionError: ${pattern.source} // Object.is equality`,
      ),
      'The default reporter must independently identify each intended assertion',
    );
    assert.match(
      failures,
      pattern,
      'Failure must expose the specific physical or diagnostic boolean',
    );
    expectedFailures.delete(assertion.fullName);
  }
  assert.equal(expectedFailures.size, 0);
  const snapshots = [
    ...stripVTControlCharacters(log).matchAll(/TABS_BUTTON_OWNER_SNAPSHOT\s+(\{[^\n]+\})/g),
  ].map((match) => JSON.parse(match[1]));
  assert.equal(snapshots.length, 2, 'Both actual host/ancestor snapshots must be recorded');
  for (const snapshot of snapshots) {
    assert.equal(snapshot.tag, 'BUTTON');
    assert.equal(snapshot.role, 'tab');
    assert.equal(snapshot.disabledFieldset, false);
    assert.ok(
      snapshot.ancestors.every(
        (parent) => !parent.disabled && !parent.inert && parent.ariaDisabled !== 'true',
      ),
    );
  }
  const physical = snapshots.find((snapshot) => snapshot.caseName === 'disabled synchronization');
  const diagnostic = snapshots.find((snapshot) => snapshot.caseName === 'diagnostic');
  assert.ok(physical && diagnostic);
  assert.equal(physical.disabled, true);
  assert.equal(physical.disabledAttribute, '');
  assert.equal(physical.ariaDisabled, 'true');
  assert.equal(diagnostic.disabled, false);
  return snapshots;
}
if (process.argv.includes('--check')) {
  console.log(
    JSON.stringify({
      status: 'READ_ONLY_VALIDATED',
      predecessor: predecessor.sha256,
      current: currentHash,
      sourcePin: archive.sourcePin,
    }),
  );
} else if (process.argv.includes('--validate-artifact')) {
  const index = process.argv.indexOf('--validate-artifact');
  assert.ok(process.argv[index + 1], 'An explicit approved artifact directory is required');
  const artifactDir = resolve(process.argv[index + 1]);
  const report = JSON.parse(readFileSync(resolve(artifactDir, 'predecessor-report.json'), 'utf8'));
  const log = readFileSync(resolve(artifactDir, 'predecessor.log'), 'utf8');
  const snapshots = validateExpectedRed(report, log);
  console.log(
    JSON.stringify({ status: 'READ_ONLY_ACTUAL_ARTIFACT_VALIDATED', cases: 2, snapshots }),
  );
} else {
  const outDir = resolve(root, '.checks/tabs-button-owner-browser');
  mkdirSync(outDir, { recursive: true });
  const reportPath = resolve(outDir, 'predecessor-report.json');
  rmSync(reportPath, { force: true });
  const args = [
    '--max-old-space-size=1536',
    resolve(root, 'packages/base/node_modules/vitest/vitest.mjs'),
    'run',
    '--project',
    'client',
    'tests/browser/tabs-attachment-lifetime.svelte.test.ts',
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${reportPath}`,
  ];
  const receipt = {
    sourcePin: archive.sourcePin,
    predecessorCommit: archive.runtimePredecessorCommit,
    predecessorSha256: predecessor.sha256,
    currentSha256: currentHash,
    witnessSha256: witnessHash,
    command: [process.execPath, ...args],
    security:
      'Existing client config: Chromium sandbox enabled, maxWorkers=1, fileParallelism=false, retry=0.',
    ordinaryAssertionCredit: 0,
  };
  try {
    writeFileSync(resolve(root, runtime), predecessorBytes);
    assert.equal(hash(readFileSync(resolve(root, runtime))), predecessor.sha256);
    const result = spawnSync(process.execPath, args, {
      cwd: resolve(root, 'packages/base'),
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    const log = (result.stdout ?? '') + (result.stderr ?? '');
    writeFileSync(resolve(outDir, 'predecessor.log'), log);
    process.stdout.write(log);
    receipt.exitCode = result.status;
    assert.equal(result.error, undefined, 'Browser command must launch successfully');
    assert.equal(result.signal, null, 'Browser command must not terminate by signal');
    assert.equal(result.status, 1, 'Predecessor must fail its actual focused assertions');
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    receipt.actualPredecessorHostSnapshots = validateExpectedRed(report, log);
    receipt.expectedRed =
      'Two exact named assertion failures with physical true→false and diagnostic false→true predicates; no runtime/suite error.';
  } catch (error) {
    receipt.failure = { name: error.name, message: error.message, stack: error.stack };
    throw error;
  } finally {
    writeFileSync(resolve(root, runtime), currentBytes);
    assert.deepEqual(
      readFileSync(resolve(root, runtime)),
      currentBytes,
      'Finally must restore exact current bytes',
    );
    receipt.restoredSha256 = hash(readFileSync(resolve(root, runtime)));
    assert.equal(receipt.restoredSha256, currentHash);
    writeFileSync(resolve(outDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log(`TABS_BUTTON_OWNER_RESTORED ${currentHash}`);
  }
  console.log(
    'Expected secured predecessor red verified; the unchanged normal full client suite must now establish repaired green.',
  );
}
