// Regenerate current class/body ownership; baseline call hashes and receipts remain historical.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const path = resolve(root, 'parity/native-framework/callsite-inventory.json');
const data = JSON.parse(readFileSync(path, 'utf8'));
const graph = JSON.parse(
  readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json'), 'utf8'),
);
const modules = new Map(graph.native.modules.map((module) => [module.path, module]));
const formerField =
  'packages/base/src/lib/internals/field-register-control/useFieldControlRegistration.svelte.ts';
const field =
  'packages/base/src/lib/internals/field-register-control/FieldControlRegistration.svelte.ts';
const classes = (module) =>
  module.symbols
    .filter((symbol) => symbol.kind === 'ClassDeclaration')
    .map((symbol) => symbol.name);
for (const record of data.modules) {
  const module = modules.get(record.path === formerField ? field : record.path);
  if (module) {
    record.currentOwners = [{ path: module.path, sha256: module.sha256, classes: classes(module) }];
    record.currentFileSha256 = module.sha256;
  } else {
    delete record.currentFileSha256;
    record.currentOwners = [];
    record.currentStatus =
      'Retired React ref/renderer transport; direct native ownership grants zero divergent Original assertion credit.';
  }
}
const retired = new Map((data.retiredNativeOwners ?? []).map((owner) => [owner.path, owner]));
for (const owner of data.nativeOwners)
  if (!modules.has(owner.path))
    retired.set(owner.path, {
      ...owner,
      currentStatus:
        'Retired by PR77 direct native ref/attachment ownership; no current runtime/API export.',
    });
data.retiredNativeOwners = [...retired.values()];
data.nativeOwners = data.nativeOwners
  .filter((owner) => modules.has(owner.path))
  .map((owner) => ({
    ...owner,
    sha256: modules.get(owner.path).sha256,
    classes: classes(modules.get(owner.path)),
  }));
if (!data.nativeOwners.some((owner) => owner.path === field))
  data.nativeOwners.push({
    path: field,
    role: 'Pinned active Field registration/source/baseline/cancellation owner with actual native invalidation',
    sha256: modules.get(field).sha256,
    classes: classes(modules.get(field)),
  });
for (const [path, role] of [
  [
    'packages/base/src/lib/utils/popups/popupStoreUtils.svelte.ts',
    'Trigger registration resource and implicit active-trigger reconciliation owners',
  ],
  [
    'packages/base/src/lib/utils/popups/usePopupHandleStore.svelte.ts',
    'Popup handle Store lifetime and committed native hydration owner',
  ],
  [
    'packages/base/src/lib/utils/popups/useTriggerFocusGuards.svelte.ts',
    'Pre-focus host and live guard event owner',
  ],
  [
    'packages/base/src/lib/utils/useOpenInteractionType.svelte.ts',
    'Open modality and close observation owner',
  ],
  [
    'packages/base/src/lib/utils/useAnchoredPopupScrollLock.svelte.ts',
    'Touch-open popup width decision and canonical scroll-lock resource owner',
  ],
  [
    'packages/utils/src/lib/useEnhancedClickHandler.ts',
    'Last pointer type and stable detached click callback owner',
  ],
]) {
  const module = modules.get(path);
  const owner = { path, role, sha256: module.sha256, classes: classes(module) };
  const index = data.nativeOwners.findIndex((existing) => existing.path === path);
  if (index === -1) data.nativeOwners.push(owner);
  else data.nativeOwners[index] = { ...data.nativeOwners[index], ...owner };
}
data.checkpointEvidence.currentIntegration =
  'Actual PR77 source-only body/parser/import proof is parity/native-snippets/integration-current.json. Earlier scan/execution entries describe their predecessor checkpoint and supply zero integrated acceptance.';
writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(
  `Recorded ${data.nativeOwners.length} actual class/resource owners and ${data.retiredNativeOwners.length} retired predecessor owners.`,
);
