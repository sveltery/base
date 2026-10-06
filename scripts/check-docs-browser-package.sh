#!/usr/bin/env bash
# Real secured Chromium acceptance of the already checked, installed tarball consumer.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
mkdir -p .checks/docs-package/browser
if [[ ! -f .checks/docs-package/consumer-path.txt ]]; then
  echo 'Run scripts/check-docs-package.sh successfully before the installed browser gate.' >&2
  exit 1
fi
docs_consumer="$(cat .checks/docs-package/consumer-path.txt)"
test -f "$docs_consumer/ssr.html"
test -f "$docs_consumer/Consumer.svelte"
cmp apps/fixtures/src/lib/docs/DialogExample.svelte "$docs_consumer/DialogExample.svelte"
node --input-type=module - "$docs_consumer" "$PWD" <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
const consumer = realpathSync(process.argv[2]);
const repository = process.argv[3];
const tooling = createRequire(join(repository, 'packages/base/package.json'));
const rootTooling = createRequire(join(repository, 'package.json'));
const installed = createRequire(join(consumer, 'package.json'));
for (const entry of ['@sveltery/base/dialog','@sveltery/base/collapsible','@sveltery/base/scroll-area','@sveltery/utils/useTimeout','svelte']) {
  assert(!relative(consumer, realpathSync(installed.resolve(entry))).startsWith('..'), `${entry}: runtime must resolve within consumer installation`);
}
const plugin = pathToFileURL(tooling.resolve('@sveltejs/vite-plugin-svelte')).href;
const viteCLI = join(dirname(tooling.resolve('vite/package.json')), 'bin/vite.js');
const playwrightManifestPath = rootTooling.resolve('@playwright/test/package.json');
const playwrightManifest = JSON.parse(readFileSync(playwrightManifestPath, 'utf8'));
assert.equal(playwrightManifest.version, '1.63.0', 'configured official Playwright pin required');
const playwrightImport = playwrightManifest.exports['.'].import;
assert.equal(playwrightImport, './index.mjs', 'use official package declared ESM import entry');
const playwrightEntry = pathToFileURL(join(dirname(playwrightManifestPath), playwrightImport)).href;
writeFileSync(join(consumer, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Installed documentation consumer</title></head><body><main>${readFileSync(join(consumer,'ssr.html'),'utf8')}</main><script type="module" src="/browser-entry.js"></script></body></html>`);
writeFileSync(join(consumer, 'browser-entry.js'), `import {hydrate, tick} from 'svelte';\nimport Consumer from './Consumer.svelte';\nwindow.docsConsumerHydrated = false;\nwindow.docsConsumerSSRHosts = {trigger:document.querySelector('#docs-code-trigger'),viewport:document.querySelector('#docs-code-viewport')};\nconst instance = hydrate(Consumer,{target:document.querySelector('main')});\nawait tick();\nwindow.docsConsumerHydrated = true;\nwindow.docsConsumerInstance = instance;\n`);
writeFileSync(join(consumer, 'vite.config.mjs'), `import {svelte} from ${JSON.stringify(plugin)};\nexport default {root:${JSON.stringify(consumer)},plugins:[svelte()],resolve:{dedupe:['svelte']},server:{host:'127.0.0.1',port:5189,strictPort:true}};\n`);
writeFileSync(join(consumer, 'playwright.config.mjs'), `import {defineConfig} from ${JSON.stringify(playwrightEntry)};\nexport default defineConfig({testDir:'.',testMatch:'docs-installed.spec.mjs',fullyParallel:false,workers:1,retries:0,outputDir:${JSON.stringify(join(repository,'.checks/docs-package/browser/test-results'))},reporter:[['list'],['json',{outputFile:${JSON.stringify(join(repository,'.checks/docs-package/browser/results.json'))}}]],use:{baseURL:'http://127.0.0.1:5189',browserName:'chromium',launchOptions:{chromiumSandbox:true},trace:'retain-on-failure'},webServer:{command:${JSON.stringify(`node "${viteCLI}" --config vite.config.mjs`)},cwd:${JSON.stringify(consumer)},url:'http://127.0.0.1:5189',reuseExistingServer:false,gracefulShutdown:{signal:'SIGTERM',timeout:5000}}});\n`);
writeFileSync(join(consumer, 'docs-installed.spec.mjs'), `import {test,expect} from ${JSON.stringify(playwrightEntry)};
test('installed tarball documentation SSR hydration, Dialog and nested code composition',async({page},testInfo)=>{
  const errors=[]; const warnings=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());if(message.type()==='warning')warnings.push(message.text());});
  await page.goto('/');
  await page.waitForFunction(()=>window.docsConsumerHydrated===true);
  expect(await page.evaluate(()=>({trigger:document.querySelector('#docs-code-trigger')===window.docsConsumerSSRHosts.trigger,viewport:document.querySelector('#docs-code-viewport')===window.docsConsumerSSRHosts.viewport}))).toEqual({trigger:true,viewport:true});
  const viewport=page.locator('#docs-code-viewport');
  const trigger=page.locator('#docs-code-trigger');
  await expect(viewport.locator('pre')).toHaveText('installed documentation composition');
  await expect(trigger).toHaveAttribute('aria-expanded','false');
  await expect(viewport).toHaveAttribute('aria-hidden','true');
  expect(await viewport.evaluate(node=>node.style.overflow)).toBe('');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await expect(viewport).toHaveAttribute('aria-hidden','false');
  expect(await viewport.evaluate(node=>node.style.overflow)).toBe('scroll');
  await expect(viewport.locator('pre')).toHaveText('installed documentation composition');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded','false');
  expect(await viewport.evaluate(node=>node.style.overflow)).toBe('');
  expect(await page.evaluate(()=>document.querySelector('#docs-code-viewport')===window.docsConsumerSSRHosts.viewport)).toBe(true);
  await page.getByRole('button',{name:'Explore a dialog',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('textbox',{name:'Your note'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Explore a dialog',exact:true})).toBeFocused();
  await page.screenshot({path:testInfo.outputPath('installed-docs.png'),fullPage:true});
  expect(errors).toEqual([]); expect(warnings).toEqual([]);
});
`);
console.log(`Installed browser consumer root: ${consumer}; Vite/compiler tooling: ${viteCLI}; browser runtime entries resolve only within the consumer installation.`);
JS
node node_modules/@playwright/test/cli.js test --config "$docs_consumer/playwright.config.mjs" | tee .checks/docs-package/browser/browser.log
