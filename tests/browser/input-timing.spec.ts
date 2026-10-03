// Exact native Chromium listener/FormData timing characterizations; no parity credit.
import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type { TimingResult } from '../../apps/fixtures/src/lib/input-timing/types.js';
test('same-dispatch native listener order and FormData versus settled controlled and native Svelte bindings', async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/input-timing'); await expect(page.locator('main')).toHaveAttribute('data-complete', 'true');
  const results = JSON.parse(await page.getByTestId('timing-results').textContent() ?? '[]') as TimingResult[];
  expect(results).toHaveLength(24);
  const path = testInfo.outputPath('input-timing-results.json'); await writeFile(path, JSON.stringify(results, null, 2));
  await testInfo.attach('input-timing-results.json', { path, contentType: 'application/json' });
  for (const result of results) {
    const callbackStages = result.preventBase ? ['consumer:prevent-base'] : ['callback:before-owner', 'callback:after-owner'];
    const stages = ['document:capture', 'root:capture', 'form:capture', 'target:capture', ...(result.framework === 'native-bind-accessor' ? callbackStages : []), 'target:bubble', 'form:bubble', 'root:before-delegation', ...(result.framework === 'native-bind-accessor' ? [] : callbackStages), 'root:after-delegation', 'document:before-registered-delegation', 'document:after-registered-delegation', 'dispatch:return'];
    expect(result.immediate.map(observation => observation.stage), `${result.framework}/${result.decision}${result.preventBase ? '/prevent-base' : ''}`).toEqual(stages);
    const owner = result.decision === 'accept' ? 'edit' : result.decision === 'reject' ? 'owner' : 'EDIT';
    expect(result.owner).toBe(owner);
    for (const observation of result.immediate) {
      expect(observation.formData).toBe(observation.value);
      const afterReact = ['root:after-delegation', 'document:before-registered-delegation', 'document:after-registered-delegation', 'dispatch:return'].includes(observation.stage);
      expect(observation.value).toBe((result.framework === 'react' || result.framework === 'input-final-wrapper' || result.framework === 'input-owned-final-wrapper') && afterReact ? owner : 'edit');
    }
    const settled = (result.framework === 'native-value' || result.framework === 'input') && (result.decision === 'reject' || result.preventBase) ? 'edit' : owner;
    expect(result.settled).toEqual([{ stage: 'after:tick', value: settled, formData: settled }]);
  }
  expect(errors).toEqual([]);
});
