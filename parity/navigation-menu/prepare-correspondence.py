"""Evidence-only planned reuse and precise inherited whole-body scopes."""
import gzip
import hashlib
import json
import pathlib
import subprocess

OUT = pathlib.Path(__file__).resolve().parent
REPO = OUT.parents[1]
BASE = '74f667da95ebc5670b0cc5bee38f2225e65fd0c0'
MENU = '1dc439d3a36495dbc4fc19f3f85c6e253dcfc0af'
PIN = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c'
AUTHORITATIVE = pathlib.Path('/workspace/sveltery-tmp/menu-family-repair-review-1dc439d/audit.json')
menu = json.loads(AUTHORITATIVE.read_text())
original = {row['source']: row for row in menu['originalModules']}
native = {row['source']: row for row in menu['nativeModules']}
graph = json.loads((OUT / 'source-graph.json').read_text())
selected = {row['source']: row for row in json.loads((OUT / 'selected-source.json').read_text())['modules']}
sha = lambda body: hashlib.sha256(body).hexdigest()
git = lambda ref, path: subprocess.check_output(['git', '-C', str(REPO), 'show', f'{ref}:{path}'], stderr=subprocess.DEVNULL)
fresh_shared = {
    'packages/react/src/floating-ui-react/index.ts',
    'packages/react/src/floating-ui-react/types.ts',
    'packages/react/src/floating-ui-react/utils.ts',
    'packages/react/src/floating-ui-react/components/FloatingRootStore.ts',
    'packages/react/src/floating-ui-react/components/FloatingTree.tsx',
    'packages/react/src/floating-ui-react/components/FloatingTreeStore.ts',
    'packages/react/src/floating-ui-react/hooks/useFloating.ts',
    'packages/react/src/floating-ui-react/hooks/useFloatingRootContext.ts',
    'packages/react/src/floating-ui-react/utils/getEmptyRootContext.ts',
    'packages/react/src/internals/use-button/index.ts',
    'packages/react/src/types/index.ts',
    'packages/react/src/utils/usePositioner.tsx',
    'packages/react/src/utils/getCssDimensions.ts',
    'packages/utils/src/store/index.ts',
}
fresh_native = {
    'packages/base/src/lib/floating-ui/components/FloatingRootStore.svelte.ts',
    'packages/base/src/lib/floating-ui/components/FloatingTree.svelte.ts',
    'packages/base/src/lib/floating-ui/components/FloatingPortal.svelte',
    'packages/base/src/lib/floating-ui/hooks/useFloating.svelte.ts',
    'packages/base/src/lib/internals/anchor-positioning/useAnchorPositioning.svelte.ts',
    'packages/base/src/lib/utils/usePositioner.svelte.ts',
    'packages/base/src/lib/utils/useControlled.svelte.ts',
    'packages/base/src/lib/internals/useTransitionStatus.svelte.ts',
    'packages/base/src/lib/internals/useOpenChangeComplete.svelte.ts',
}
missing = {
    'packages/react/src/floating-ui-react/hooks/useFloatingRootContext.ts': {
        'targets': ['packages/base/src/lib/floating-ui/hooks/useFloatingRootContext.svelte.ts'],
        'plan': 'Port real per-hook FloatingRootStore/PopupTriggerMap initialization and Source skip-undefined element synchronization; live callback/nested context and DEV real-element diagnostic. Native Svelte IDs, runes and external store synchronization; no independent open engine.',
    },
    'packages/react/src/floating-ui-react/utils/getEmptyRootContext.ts': {
        'targets': ['packages/base/src/lib/floating-ui/utils/getEmptyRootContext.ts'],
        'plan': 'Port the exact real inert FloatingRootStore factory over canonical Store/PopupTriggerMap. List owns one fallback; Positioner and Viewport own Source module-level fallback. Fallback never replaces provided interaction state.',
    },
}
primitives = {
    'packages/utils/src/fastHooks.ts': 'Direct Svelte state/lifecycle initialization; React hook dispatch/registration machinery has no native counterpart.',
    'packages/utils/src/getReactElementRef.ts': 'Native shared RenderElement snippet/attachment/ref transport; no React element inspection.',
    'packages/utils/src/inertValue.ts': 'Native boolean inert prop in Svelte 5; no React-version string compatibility.',
    'packages/utils/src/reactVersion.ts': 'No React runtime/version boundary in native Svelte.',
    'packages/utils/src/safeReact.ts': 'No React runtime boundary in native Svelte.',
    'packages/utils/src/store/useStore.ts': 'Existing canonical SvelteStore createSubscriber/selected-read transport, retaining Source Store algorithms.',
    'packages/utils/src/useValueAsRef.ts': 'Live native getter for source latest-value reads; plain mutable cell only for intentional business-owned refs.',
}
canonical_rows, records, authority_original = {}, [], []
for module in graph['modules']:
    source = module['source']
    own = '/navigation-menu/' in source
    authority = original.get(source)
    if authority and authority['sha256'] != module['sha256']:
        raise RuntimeError('Immutable Original authority mismatch: ' + source)
    is_selected = source in selected
    fresh = own or source in fresh_shared
    manual = 'fresh-complete-Original-body-manual-read' if fresh else (
        'precise-authoritative-Original-scope-inheritance' if authority and authority.get('manualReviewKind') != 'unselected-fanout-hash-only' and is_selected else 'immutable-hash/member-provenance-only-no-manual-body-claim')
    targets = []
    if own:
        relative = source.split('/navigation-menu/', 1)[1]
        if relative.endswith('.tsx'):
            if '/NavigationMenu' in relative:
                part = relative.split('/NavigationMenu')[-1].replace('.tsx', '')
                targets = [f'packages/base/src/lib/navigation-menu/{part}.svelte', 'packages/base/src/lib/navigation-menu/types.ts']
            else:
                targets = ['packages/base/src/lib/navigation-menu/' + relative]
        else:
            targets = ['packages/base/src/lib/navigation-menu/' + relative]
        boundary = 'Original NavigationMenu business port, preserving full named composition/branches/ownership; native Svelte runes/context/snippets/attachments replace React representation. No implementation exists at this checkpoint.'
    elif source in missing:
        targets = missing[source]['targets']
        boundary = missing[source]['plan']
    elif source in primitives:
        boundary = primitives[source]
    elif authority and is_selected:
        targets = [target for target in authority.get('local', []) if '/menu/' not in target and '/menubar/' not in target and '/context-menu/' not in target]
        boundary = authority.get('correspondence', '')
        if not targets:
            boundary = 'Resolve selected export directly to the canonical member/type or native primitive below; barrel fanout is provenance and does not select unrelated engines.'
        for target in targets:
            if target not in native:
                raise RuntimeError('No whole-body native authority for intended target: ' + target)
            current_bytes = git(MENU, target)
            actual = pathlib.Path('/workspace/menu-family-repair-review', target).read_bytes()
            if current_bytes != actual or sha(actual) != native[target]['sha256']:
                raise RuntimeError('Canonical full-body mismatch: ' + target)
            try:
                base_bytes = git(BASE, target)
                on_main = base_bytes == current_bytes
            except subprocess.CalledProcessError:
                base_bytes, on_main = None, False
            canonical_rows[target] = {
                'local': target, 'sha256': sha(current_bytes),
                'selectedFromOriginal': sorted(set(canonical_rows.get(target, {}).get('selectedFromOriginal', []) + [source])),
                'baseMainSha256': sha(base_bytes) if base_bytes is not None else None,
                'actualAcceptedMainBodyIdentical': on_main,
                'plannedProvider': {'head': BASE, 'status': 'actual accepted main'} if on_main else {'head': MENU, 'pr': 'https://github.com/sveltery/base/pull/63', 'status': 'public unmerged development dependency; not accepted main'},
                'wholeBodyScope': 'supplemental fresh full native body read plus precise authoritative whole-body scope' if target in fresh_native else 'precise authoritative whole-body scope only; not a fresh manual reread',
                'authoritativeNativeRecord': native[target],
                'futureUsedClosureReviewRequired': True,
            }
    else:
        boundary = 'Unselected syntax barrel/type fanout. Archive/import-member provenance only; no implementation or business-body credit.'
    if authority and manual == 'precise-authoritative-Original-scope-inheritance':
        authority_original.append(authority)
    records.append({
        'source': source, 'url': module['url'], 'sha256': module['sha256'],
        'selectedMembers': selected[source]['selectedMembers'] if is_selected else [],
        'publicEntrySelected': is_selected, 'declarations': module['declarations'],
        'plannedTargets': targets, 'plannedBoundary': boundary,
        'originalManualScope': manual,
        'inheritedOriginalScope': { 'receipt': str(AUTHORITATIVE), 'receiptSha256': sha(AUTHORITATIVE.read_bytes()), 'moduleSource': source, 'moduleSha256': authority['sha256'], 'manualReviewKind': authority.get('manualReviewKind'), 'manualScope': authority.get('manualScope'), 'priorManualScope': authority.get('priorManualScopeRetainedVerbatim'), 'verdict': authority.get('verdict') } if authority and manual == 'precise-authoritative-Original-scope-inheritance' else None,
        'status': 'pre-code planned correspondence; used implementation and independent final-head Source review pending',
        'ordinaryCredit': 0,
    })

metadata = {'pin': PIN, 'base': BASE, 'status': 'Phase 1 only; no runtime implementation, no NavigationMenu Source CLEAR or ordinary credit', 'ordinaryCredit': 0}
(OUT / 'source-correspondence.json').write_text(json.dumps({**metadata, 'records': records}, indent=2) + '\n')
(OUT / 'canonical-reuse-plan.json').write_text(json.dumps({**metadata, 'canonicalProviderHead': MENU, 'modules': list(canonical_rows.values()), 'missingSharedBoundaries': missing}, indent=2) + '\n')
archive = {'authoritativeReceipt': str(AUTHORITATIVE), 'authoritativeReceiptSha256': sha(AUTHORITATIVE.read_bytes()), 'authoritativeHead': MENU, 'originalScopes': authority_original, 'nativeScopes': [row['authoritativeNativeRecord'] for row in canonical_rows.values()], 'note': 'Exact inherited module-specific complete-body scopes. No blanket feature acceptance or fresh read claim.'}
with gzip.GzipFile(filename=str(OUT / 'inherited-manual-scopes.json.gz'), mode='wb', mtime=0) as f:
    f.write((json.dumps(archive, indent=2) + '\n').encode())
counts = {}
for row in records:
    counts[row['originalManualScope']] = counts.get(row['originalManualScope'], 0) + 1
print(json.dumps({'originalScopes': counts, 'canonicalNativeBodyScopes': len(canonical_rows), 'acceptedMainIdentical': sum(row['actualAcceptedMainBodyIdentical'] for row in canonical_rows.values()), 'publicDevelopmentOnly': sum(not row['actualAcceptedMainBodyIdentical'] for row in canonical_rows.values())}, indent=2))
