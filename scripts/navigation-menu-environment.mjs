import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
const root = new URL('../', import.meta.url);
const fixture = createRequire(new URL('apps/fixtures/package.json', root));
const config = readFileSync(new URL('playwright.navigation-menu.config.ts', root), 'utf8');
const baseConfig = readFileSync(new URL('playwright.config.ts', root), 'utf8');
assert.match(config, /chromiumSandbox:\s*true/);
assert.match(baseConfig, /workers:\s*1/);
assert.match(baseConfig, /retries:\s*0/);
const browser = await chromium.launch({ chromiumSandbox: true });
let version;
try { version = browser.version(); } finally { await browser.close(); }
assert.equal(version, '153.0.8010.12');
const report = {
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourcePin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  node: process.version,
  actualOriginal: { base: fixture('@base-ui/react/package.json').version, react: fixture('react/package.json').version, reactDom: fixture('react-dom/package.json').version },
  native: { svelte: fixture('svelte/package.json').version },
  browser: { engine: 'official Playwright Chromium', version, chromiumSandbox: true, workers: 1, retries: 0 },
  assertionAuthority: 'Immutable Original declarations; candidates remain pending until full sequence and helper correspondence is reviewed.',
};
assert.deepEqual(report.actualOriginal, { base: '1.8.0', react: '19.2.8', reactDom: '19.2.8' });
assert.equal(report.native.svelte, '5.57.1');
mkdirSync(new URL('.checks/navigation-menu/', root), { recursive: true });
writeFileSync(new URL('.checks/navigation-menu/environment.json', root), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
