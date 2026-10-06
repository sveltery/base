#!/usr/bin/env bash
# Documentation's real installed library composition; the Kit HTTP app is gated separately.
set -euo pipefail
cd "$(dirname "$0")/.."
export TMPDIR="${TMPDIR:-$PWD/.checks/docs-package/tmp}"
export NODE_COMPILE_CACHE="${NODE_COMPILE_CACHE:-$PWD/.checks/docs-package/node-cache}"
mkdir -p "$TMPDIR" "$NODE_COMPILE_CACHE" .checks/docs-package
source scripts/package-artifacts.sh
docs_consumer="$(mktemp -d "${TMPDIR}/sveltery-docs-consumer.XXXXXX")"
sveltery_pack_package @sveltery/base "$docs_consumer" > /dev/null
node --input-type=module - "$docs_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find((name) => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({private:true,type:'module',dependencies:{'@sveltery/base':`file:${join(directory,tarball)}`,svelte:'5.57.1',jsdom:'30.1.1'}}));
JS
sveltery_prepare_consumer "$docs_consumer"
pnpm --dir "$docs_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$docs_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
node --input-type=module - "$docs_consumer" "$SVELTERY_PACKAGE_ARTIFACTS" <<'JS' | tee .checks/docs-package/installed-artifacts.json
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
const directory = realpathSync(process.argv[2]);
const manifestPath = process.argv[3];
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const consumerMetadata = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
const consumerRequire = createRequire(join(directory, 'package.json'));
const baseRequire = createRequire(consumerRequire.resolve('@sveltery/base/dialog'));
const names = ['@sveltery/base', '@sveltery/utils'];
const packages = names.map((name) => {
  const entry = manifest.packages[name];
  assert(entry, `${name}: actual recorded package artifact required`);
  const archive = join(dirname(manifestPath), entry.tarball);
  const consumerArchive = consumerMetadata.dependencies[name].slice('file:'.length);
  assert.equal(createHash('sha256').update(readFileSync(archive)).digest('hex'), entry.sha256);
  assert.equal(createHash('sha256').update(readFileSync(consumerArchive)).digest('hex'), entry.sha256);
  const installedDirectory = realpathSync(join(directory, 'node_modules', name));
  assert(!relative(directory, installedDirectory).startsWith('..'), `${name}: consumer-local installation required`);
  const metadataPath = join(installedDirectory, 'package.json');
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
  assert.equal(metadata.name, name);
  assert.equal(metadata.version, entry.version);
  assert(existsSync(join(installedDirectory, 'THIRD_PARTY_NOTICES.md')));
  return { name, archive, consumerArchive, archiveSha256:entry.sha256, installedDirectory, metadataPath, metadata };
});
const base = packages[0], utils = packages[1];
assert.equal(base.metadata.dependencies['@sveltery/utils'], utils.metadata.version, 'packed Base must declare exact installed Utils version');
const utilsEntry = realpathSync(baseRequire.resolve('@sveltery/utils/useTimeout'));
assert(!relative(utils.installedDirectory, utilsEntry).startsWith('..'), 'Base Utils edge must resolve to the actual consumer-installed Utils archive');
assert(!relative(directory, utilsEntry).startsWith('..'), 'no workspace or registry fallback');
console.log(JSON.stringify({supplementaryAssertionCredit:0,frameworkBoundary:'Kit-free installed library consumer; actual documentation HTTP app is SvelteKit 3',artifactManifest:manifestPath,packages,baseUtilsResolvedEntry:utilsEntry},null,2));
JS
cp apps/fixtures/src/lib/docs/DialogExample.svelte "$docs_consumer/DialogExample.svelte"
cmp apps/fixtures/src/lib/docs/DialogExample.svelte "$docs_consumer/DialogExample.svelte"
cat > "$docs_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Collapsible } from '@sveltery/base/collapsible';
  import { ScrollArea } from '@sveltery/base/scroll-area';
  import DialogExample from './DialogExample.svelte';
  let expanded = $state(false);
</script>
<DialogExample />
<Collapsible.Root open={expanded} onOpenChange={(open) => { expanded = open; }}>
  <ScrollArea.Root class="DemoCodeBlockRoot" tabindex={-1} data-closed={expanded ? undefined : ''}>
    <Collapsible.Panel keepMounted hidden={false}>
      {#snippet render(props, _state, children)}
        <ScrollArea.Viewport
          {...props}
          {children}
          class="ScrollAreaViewport DemoCodeBlockViewport"
          aria-hidden={!expanded}
          data-closed={expanded ? undefined : ''}
          {...!expanded && { tabindex: undefined }}
        >
          {#snippet render(viewportProps, _viewportState, viewportChildren)}
            <div {...viewportProps} id="docs-code-viewport" style:overflow={expanded ? 'scroll' : undefined}>
              {@render viewportChildren?.()}
            </div>
          {/snippet}
        </ScrollArea.Viewport>
      {/snippet}
      <pre>installed documentation composition</pre>
    </Collapsible.Panel>
    {#if expanded}
      <ScrollArea.Corner />
      <ScrollArea.Scrollbar><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal"><ScrollArea.Thumb /></ScrollArea.Scrollbar>
    {/if}
    <Collapsible.Trigger id="docs-code-trigger">{expanded ? 'Hide code' : 'Show code'}</Collapsible.Trigger>
  </ScrollArea.Root>
</Collapsible.Root>
SVELTE
cat > "$docs_consumer/PublicTypes.ts" <<'TS'
import type { DialogRootProps, DialogPopupProps } from '@sveltery/base/dialog';
import type { CollapsibleRootProps, CollapsiblePanelProps } from '@sveltery/base/collapsible';
import type { ScrollAreaRootProps, ScrollAreaScrollbarProps } from '@sveltery/base/scroll-area';
const dialog: DialogRootProps = { defaultOpen: false, onOpenChange: (_open, details) => details.cancel() };
const collapsible: CollapsibleRootProps = { defaultOpen: false, onOpenChange: (_open, details) => details.cancel() };
const scroll: ScrollAreaRootProps = { overflowEdgeThreshold: { xStart: 5 } };
// @ts-expect-error Dialog open is boolean business state.
const badDialog: DialogRootProps = { open: 'yes' };
// @ts-expect-error Native Dialog replacement requires a snippet.
const badDialogRender: DialogPopupProps = { render: 'section' };
// @ts-expect-error Collapsible open is boolean business state.
const badCollapsible: CollapsibleRootProps = { open: 1 };
// @ts-expect-error Native styles are strings or string-returning state functions.
const badPanelStyle: CollapsiblePanelProps = { style: { overflow: 'hidden' } };
// @ts-expect-error ScrollArea orientation has two supported values.
const badOrientation: ScrollAreaScrollbarProps = { orientation: 'diagonal' };
// @ts-expect-error ScrollArea threshold is numeric.
const badThreshold: ScrollAreaRootProps = { overflowEdgeThreshold: { xStart: '5' } };
void [dialog, collapsible, scroll, badDialog, badDialogRender, badCollapsible, badPanelStyle, badOrientation, badThreshold];
TS
cat > "$docs_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$docs_consumer" --tsconfig ./tsconfig.json | tee .checks/docs-package/types.log
cat > "$docs_consumer/ssr.mjs" <<'JS'
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
const html = render(Consumer).body;
assert.match(html, /Explore a dialog/);
assert.match(html, /Show code/);
assert.match(html, /installed documentation composition/);
assert.match(html, /data-closed/);
assert.doesNotMatch(html, /overflow:\s*scroll/);
writeFileSync(new URL('./ssr.html', import.meta.url), html);
console.log('Installed canonical documentation Dialog sample and native Collapsible/ScrollArea composition SSR: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$docs_consumer/ssr.mjs" | tee .checks/docs-package/ssr.log
cat > "$docs_consumer/dom-loader.mjs" <<'JS'
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('./package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const options = { filename: fileURLToPath(url), generate: 'client' };
    const result = url.endsWith('.svelte') ? compile(source, options) : compileModule(source, options);
    return { format: 'module', source: result.js.code, shortCircuit: true };
  }
  return nextLoad(url, context);
} });
JS
cat > "$docs_consumer/dom.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><main></main>', { url:'http://localhost', pretendToBeVisual:true });
for (const key of ['window','document','navigator','HTMLElement','HTMLDivElement','HTMLInputElement','HTMLFormElement','HTMLButtonElement','Element','SVGElement','Node','Text','Comment','Event','MouseEvent','KeyboardEvent','CustomEvent','MutationObserver','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) {
  const value = dom.window[key];
  Object.defineProperty(globalThis,key,{configurable:true,value:typeof value === 'function' && ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? value.bind(dom.window) : value});
}
const warnings = [];
const originalWarn = console.warn;
console.warn = (...values) => { warnings.push(values.map(String).join(' ')); originalWarn(...values); };
const { hydrate, flushSync, tick, unmount } = await import('svelte');
const { default: Consumer } = await import('./Consumer.svelte');
const target = document.querySelector('main');
target.innerHTML = readFileSync(new URL('./ssr.html', import.meta.url), 'utf8');
const trigger = target.querySelector('#docs-code-trigger');
const viewport = target.querySelector('#docs-code-viewport');
const dialogTrigger = [...target.querySelectorAll('button')].find((button) => button.textContent === 'Explore a dialog');
const instance = hydrate(Consumer, { target });
flushSync(); await tick();
assert.equal(target.querySelector('#docs-code-trigger'), trigger, 'hydration must retain the actual SSR trigger');
assert.equal(target.querySelector('#docs-code-viewport'), viewport, 'hydration must retain the native viewport snippet host');
assert.equal([...target.querySelectorAll('button')].find((button) => button.textContent === 'Explore a dialog'), dialogTrigger);
assert.equal(viewport.style.overflow, '', 'closed native overflow directive removes the property');
assert.equal(viewport.getAttribute('aria-hidden'), 'true');
assert.equal(viewport.hasAttribute('tabindex'), false);
assert.equal(trigger.getAttribute('aria-expanded'), 'false');
trigger.click(); flushSync(); await tick();
assert.equal(trigger.getAttribute('aria-expanded'), 'true');
assert.equal(viewport.style.overflow, 'scroll');
assert.equal(viewport.getAttribute('aria-hidden'), 'false');
assert.equal(viewport.hasAttribute('data-closed'), false);
assert.equal(viewport.getAttribute('tabindex'), null, 'measured native forwarded-props composition leaves tabindex absent after opening');
assert.equal(target.querySelector('#docs-code-trigger'), trigger);
assert.equal(target.querySelector('#docs-code-viewport'), viewport);
trigger.click(); flushSync(); await tick();
assert.equal(trigger.getAttribute('aria-expanded'), 'false');
assert.equal(viewport.style.overflow, '');
assert.equal(viewport.getAttribute('aria-hidden'), 'true');
assert.equal(viewport.hasAttribute('data-closed'), true);
assert.deepEqual(warnings, [], 'hydration/lifetime warnings are failures');
await unmount(instance);
assert.equal(target.children.length, 0);
console.warn = originalWarn;
dom.window.close();
console.log('Installed documentation composition jsdom hydration, SSR node reuse, native snippet/style, toggle and teardown: PASS (no secured-browser credit)');
JS
printf '%s\n' "$docs_consumer" > .checks/docs-package/consumer-path.txt
node --conditions=browser --import "$docs_consumer/dom-loader.mjs" "$docs_consumer/dom.mjs" | tee .checks/docs-package/hydration.log
