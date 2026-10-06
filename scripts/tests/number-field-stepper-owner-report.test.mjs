// Classifier safety with synthetic report data; this grants no native browser evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expect as playwrightExpect } from '@playwright/test';
import { validateRedReport } from '../number-field-stepper-owner-browser.mjs';

function report() {
  let error;
  try {
    playwrightExpect([], 'stepper-owner current host diagnostics').toHaveLength(1);
  } catch (failure) {
    error = failure;
  }
  const observations = {
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
  };
  const result = {
    status: 'failed',
    error: { message: error.message },
    attachments: [
      {
        name: 'stepper-owner-lifetime',
        body: Buffer.from(JSON.stringify(observations)).toString('base64'),
      },
    ],
  };
  return {
    errors: [],
    suites: [
      {
        specs: [
          {
            title: 'svelte NumberField stepper native outro retains its actual host diagnostics',
            tests: [{ expectedStatus: 'passed', results: [result] }],
          },
        ],
      },
    ],
  };
}
const resultOf = (input) => input.suites[0].specs[0].tests[0].results[0];

test('red classifier accepts the actual installed Playwright matcher format with preceding native-lifetime records', () => {
  assert.equal(validateRedReport(report()).diagnosticPhase, 'settled');
});
test('red classifier rejects browser setup failures', () => {
  const input = report();
  resultOf(input).error.message = 'browserType.launch: Executable does not exist';
  assert.throws(() => validateRedReport(input));
});
test('red classifier rejects a diagnostic failure without the overlap/disposal attachment', () => {
  const input = report();
  resultOf(input).attachments = [];
  assert.throws(() => validateRedReport(input));
});
test('red classifier rejects a missing actual native overlap', () => {
  const input = report();
  const attachment = resultOf(input).attachments[0];
  const observation = JSON.parse(Buffer.from(attachment.body, 'base64'));
  observation.lifetime[0].outgoingConnected = false;
  attachment.body = Buffer.from(JSON.stringify(observation)).toString('base64');
  assert.throws(() => validateRedReport(input));
});
test('red classifier rejects retries and expected failures', () => {
  const input = report();
  input.suites[0].specs[0].tests[0].results.push(resultOf(input));
  assert.throws(() => validateRedReport(input));
  const expectedFailure = report();
  expectedFailure.suites[0].specs[0].tests[0].expectedStatus = 'failed';
  assert.throws(() => validateRedReport(expectedFailure));
});
