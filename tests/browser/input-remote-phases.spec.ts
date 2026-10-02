// Trusted Chromium remote-form phase diagnostics. No runtime bridge or parity credit.
import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
for (const mode of ['native', 'default', 'replacement']) test(`trusted Kit remote field phase diagnostics (${mode})`, async ({ page }, testInfo) => {
  await page.goto(`/input-remote?${mode === 'default' ? '' : mode}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const input = page.getByRole('textbox', { name: 'Email', exact: true });
  try {
    await input.fill(''); await input.pressSequentially('a@b.co');
    await expect(input).toHaveValue('a@b.co'); await expect(page.getByTestId('remote-value')).toHaveText('a@b.co');
    const phases = JSON.parse(await page.getByTestId('phases').textContent() ?? '[]') as { phase: string; trusted: boolean; eventPhase: number; name: string; value: string; formData: string | null; remote: string | undefined; getter: string; sameForm: boolean }[];
    const stages = ['form:capture', 'target:bubble', 'target:after-tick', 'form:bubble-after-Kit', ...(mode === 'native' ? ['delegated:native'] : ['delegated:consumer', 'delegated:value'])];
    const edits = ['', 'a', 'a@', 'a@b', 'a@b.', 'a@b.c', 'a@b.co']; expect(phases).toHaveLength(edits.length * stages.length);
    for (const [index, edit] of edits.entries()) {
      const sequence = phases.slice(index * stages.length, (index + 1) * stages.length);
      expect(sequence.map(record => record.phase), `${mode}/edit-${index}`).toEqual(stages);
      for (const [stage, record] of sequence.entries()) {
        expect(record.trusted).toBe(true); expect(record.eventPhase).toBe(stage === 0 ? 1 : stage < 3 ? 2 : 3);
        expect(record.sameForm).toBe(true); expect(record.name).toBe('email'); expect(record.value).toBe(edit); expect(record.formData).toBe(edit);
        expect(record.remote).toBe(stage < 3 ? index === 0 ? undefined : edits[index - 1] : edit);
        expect(record.getter).toBe(stage < 3 ? index === 0 ? 'seed@example.com' : edits[index - 1] : edit);
      }
    }
  } finally {
    const raw = await page.getByTestId('phases').textContent() ?? '[]';
    const path = testInfo.outputPath(`input-remote-phases-${mode}.json`); await writeFile(path, raw);
    await testInfo.attach(`input-remote-phases-${mode}.json`, { path, contentType: 'application/json' });
    console.info(`INPUT_REMOTE_PHASES_${mode}`, JSON.stringify((JSON.parse(raw) as unknown[]).slice(-18)));
  }
});
