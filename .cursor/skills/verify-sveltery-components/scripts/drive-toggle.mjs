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
function log(line) {
  console.log(line);
  lines.push(line);
}

const browser = await chromium.launch({ chromiumSandbox: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(`${base}/toggle?case=uncontrolled`, { waitUntil: 'domcontentloaded' });
  await page.locator('main[data-hydrated="true"]').waitFor();
  const toggle = page.getByRole('button', { name: 'Toggle', exact: true });
  if ((await toggle.getAttribute('id')) !== 'tested-toggle') {
    throw new Error('Toggle button is not #tested-toggle');
  }
  if ((await toggle.getAttribute('aria-pressed')) !== 'false') {
    throw new Error('uncontrolled Toggle did not start released');
  }
  log(`hydrated url=${page.url()} aria-pressed=false`);
  await page.screenshot({ path: path.join(evidence, 'toggle-before.png') });

  await toggle.click();
  if ((await toggle.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('first click did not press the Toggle');
  }
  const calls = JSON.parse(await page.getByTestId('calls').innerText());
  if (!Array.isArray(calls) || calls.length < 1 || calls.at(-1).pressed !== true) {
    throw new Error(`press callback missing: ${JSON.stringify(calls)}`);
  }
  log(`pressed calls=${calls.length}`);
  await page.screenshot({ path: path.join(evidence, 'toggle-pressed.png') });

  await toggle.click();
  if ((await toggle.getAttribute('aria-pressed')) !== 'false') {
    throw new Error('second click did not release the Toggle');
  }
  log('released aria-pressed=false');
  await page.screenshot({ path: path.join(evidence, 'toggle-released.png') });
  log('PASS toggle-uncontrolled');
} catch (error) {
  log(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  await page.screenshot({ path: path.join(evidence, 'failure.png') }).catch(() => {});
  throw error;
} finally {
  await writeFile(path.join(evidence, 'transcript.txt'), `${lines.join('\n')}\n`);
  await browser.close();
  console.log(`evidence ${evidence}`);
}
