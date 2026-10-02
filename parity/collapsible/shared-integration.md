# Serialized integration handoff

Component workers own only Collapsible source, tests, fixture/reference/browser routes and component-local docs/parity records. Input PR #26 owns shared exports/catalog/runner integration. The parent serializes the additions below; this document is an exact desired patch description, not evidence that public integration has happened.

- `packages/base/src/lib/index.ts`: export `{ Collapsible } from './collapsible/index.js'`; export named CollapsibleRootProps/State, CollapsibleTriggerProps/State, CollapsiblePanelProps/State, CollapsibleTransitionStatus and CollapsibleRootChangeEventReason/Details from './collapsible/index.js'.
- `packages/base/package.json`: add `./collapsible` export with types `./dist/collapsible/index.d.ts`, svelte/default `./dist/collapsible/index.js`; add direct runtime `esm-env` dependency pinned at `1.2.2` and its lockfile importer (the package/snapshot already exists). The component-local checkout uses an untracked resolution symlink only until this serialized dependency patch is applied. A fresh checkout requires that dependency integration before claiming hosted checks or complete package dependency installation.
- Shared runtime/package consumer gates: exercise both public namespace imports and exact type imports from root and subpath, SSR closed and initial open without browser globals, native form prop preservation and tarball dependency completeness.
- Shared parity runner/catalog: add immutable Collapsible inventory registration without ordinary credit until the ordered assertion executions are verified. Scope47 sites / 49 variants / portable 41 sites / 43 variants, six deferred Activity; three conformance and 10 type assertions excluded from ordinary credit.
- Central docs: link docs/collapsible.md and parity/collapsible/README.md; record C-01 accepted framework baseline, C-02 inherited D-03 and C-03 Activity deferral; add paired shared-quirk evidence only after reproduction.

All local import consumers use the component-specific source entry until this patch lands. Browser routes/configuration remain the browser owner's handoff and must join the parent-authorized central fixture route table sequentially.

The exact parent-prepared patch is [integration.patch](integration.patch); this text describes its intent and does not supersede it.
