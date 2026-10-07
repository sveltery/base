#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const state = process.env.SVELTERY_DOCS_STATE ?? '/tmp/sveltery-docs-verify';
const port = (await readFile(path.join(state, 'session', 'port'), 'utf8')).trim();
const base = `http://127.0.0.1:${port}`;
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const evidence = path.join(state, 'evidence', runId);
await mkdir(evidence, { recursive: true });

const lines = [];
const traffic = [];
function log(line) {
  console.log(line);
  lines.push(line);
}

const noteText = `verify-note-${runId}`;
const browser = await chromium.launch({ chromiumSandbox: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('request', (request) => {
  traffic.push(`${request.method()} ${request.url()}`);
});

try {
  await page.goto(`${base}/docs/components/dialog`, { waitUntil: 'domcontentloaded' });
  await page.locator('.sveltery-docs[data-hydrated="true"]').waitFor();
  log(`hydrated url=${page.url()}`);
  if ((await page.getByRole('dialog').count()) !== 0) {
    throw new Error('dialog was open before the trigger click');
  }
  await page.screenshot({ path: path.join(evidence, 'before-open.png') });

  const trigger = page.getByRole('button', { name: 'Explore a dialog' });
  await trigger.click();
  const popup = page.getByRole('dialog', { name: 'A little room to focus' });
  await popup.waitFor();
  const description = await popup.locator('.example-description').innerText();
  if (!description.includes('experimental Sveltery Dialog')) {
    throw new Error(`unexpected description: ${description}`);
  }
  const note = page.getByRole('textbox', { name: 'Your note' });
  const noteFocused = await note.evaluate((element) => element === document.activeElement);
  if (!noteFocused) {
    throw new Error('Your note was not focused after open');
  }
  await note.fill(noteText);
  const typed = await note.inputValue();
  if (typed !== noteText) {
    throw new Error(`note value ${typed}`);
  }
  log(`open description=${JSON.stringify(description)} note=${typed}`);
  await page.screenshot({ path: path.join(evidence, 'dialog-open.png') });

  const writes = traffic.filter((line) => /^(POST|PUT|PATCH|DELETE)\s/.test(line));
  if (writes.length > 0) {
    throw new Error(`note triggered a write: ${writes.join(', ')}`);
  }
  log('writes none');

  await page.getByRole('button', { name: 'Done exploring' }).click();
  await popup.waitFor({ state: 'detached' });
  if ((await page.getByRole('dialog').count()) !== 0) {
    throw new Error('dialog still present after Done exploring');
  }
  const triggerFocused = await trigger.evaluate((element) => element === document.activeElement);
  if (!triggerFocused) {
    throw new Error('focus did not return to Explore a dialog');
  }
  log('closed focus=trigger');
  await page.screenshot({ path: path.join(evidence, 'after-close.png') });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.sveltery-docs[data-hydrated="true"]').waitFor();
  if ((await page.getByRole('dialog').count()) !== 0) {
    throw new Error('dialog open after reload');
  }
  if ((await page.content()).includes(noteText)) {
    throw new Error('note text survived reload');
  }
  log('reload dialog=0 note-persisted=false');
  log('PASS live-dialog');
} catch (error) {
  log(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  await page.screenshot({ path: path.join(evidence, 'failure.png') }).catch(() => {});
  throw error;
} finally {
  await writeFile(path.join(evidence, 'transcript.txt'), `${lines.join('\n')}\n`);
  await writeFile(path.join(evidence, 'requests.txt'), `${traffic.join('\n')}\n`);
  await browser.close();
  console.log(`evidence ${evidence}`);
}
