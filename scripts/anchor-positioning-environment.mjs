import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const root = new URL('../', import.meta.url);
const fixture = createRequire(new URL('apps/fixtures/package.json', root));
const native = createRequire(new URL('packages/base/package.json', root));
const base = createRequire(fixture.resolve('@base-ui/react/package.json'));
const adapter = createRequire(base.resolve('@floating-ui/react-dom/package.json'));
const dom = createRequire(adapter.resolve('@floating-ui/dom/package.json'));
const core = createRequire(dom.resolve('@floating-ui/core/package.json'));
const reactDom = createRequire(fixture.resolve('react-dom/package.json'));
const config = readFileSync(new URL('playwright.config.ts', root), 'utf8');
assert.match(config, /chromiumSandbox:\s*true/);
assert.match(config, /retries:\s*0/);
const report = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  node: process.version,
  pnpm: execFileSync('pnpm', ['--version'], { cwd: root, encoding: 'utf8' }).trim(),
  native: {
    dom: native('@floating-ui/dom/package.json').version,
    utils: native('@floating-ui/utils/package.json').version,
  },
  reference: {
    base: fixture('@base-ui/react/package.json').version,
    react: fixture('react/package.json').version,
    reactDom: fixture('react-dom/package.json').version,
    typesReact: fixture('@types/react/package.json').version,
    typesReactDom: fixture('@types/react-dom/package.json').version,
    scheduler: reactDom('scheduler/package.json').version,
    floatingAdapter: base('@floating-ui/react-dom/package.json').version,
    floatingDom: adapter('@floating-ui/dom/package.json').version,
    floatingCore: dom('@floating-ui/core/package.json').version,
    floatingUtils: core('@floating-ui/utils/package.json').version,
  },
  pinnedSourceReact: '19.2.8',
  fixture: {
    strictMode: true,
    strictEffects: true,
    sourceDeclarationOverrides: 'No ordinary family declarations are ported by this fixture.',
    animations: 'real browser default; no source test setup shim',
    timers: 'real',
    scope:
      'supplemental native layout and lifecycle evidence; not the complete source helper stack',
  },
  browser: { engine: 'official Playwright Chromium', chromiumSandbox: true, retries: 0 },
};
assert.deepEqual(report.native, { dom: '1.8.0', utils: '0.2.12' });
assert.equal(report.reference.base, '1.8.0');
assert.equal(report.reference.floatingAdapter, '2.1.9');
assert.equal(report.reference.floatingDom, '1.8.0');
assert.equal(report.reference.floatingCore, '1.8.0');
assert.equal(report.reference.floatingUtils, '0.2.12');
assert.equal(report.reference.react, '19.2.8');
assert.equal(report.reference.reactDom, '19.2.8');
assert.equal(report.reference.typesReact, '19.2.18');
assert.equal(report.reference.typesReactDom, '19.2.4');
assert.equal(report.reference.scheduler, '0.27.0');
mkdirSync(new URL('.checks/', root), { recursive: true });
writeFileSync(
  new URL('.checks/anchor-positioning-environment.json', root),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report, null, 2));
