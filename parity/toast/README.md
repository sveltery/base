# Toast contract preparation

Toast is the next component because the original request calls for replacing Sonner. This PR prepares that work; it does not replace an application dependency or ship Toast parts. Foundation: main `e79368ed8668fbfcbdceeaa8cb6152cf04e85cde` after Dialog PR #9. No `AGENTS.md` was present in the saved checkout or workspace; `CONTRIBUTING.md`, architecture, upstream contracts and parity evidence rules apply.

Reference: React Base UI **v1.8.0 / `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`**. Read [contracts.md](contracts.md) for anatomy/types and [scenarios.md](scenarios.md) for fixtures, complete assertion obligations, the first slice and parallel ownership. All derived source/assertion excerpts retain [the full upstream MIT notice](UPSTREAM_LICENSE).

| Deliverable | Evidence boundary |
| --- | --- |
| [upstream-inventory.json](upstream-inventory.json), [inventory.mjs](inventory.mjs) | Immutable Git-object trace of 196 Toast leaf declarations / 199 literal parameter variants, two complete type-spec files, 15 separate local conformance-helper declarations, all Toast runtime source hashes and selected dependencies. All status/port placeholders stay `unported`/null. Called-helper assertions, conformance invocation options and upstream guards remain binding; counts do not imply full-library coverage. |
| [prerequisites.json](prerequisites.json) | Separate execution ledger: 24 complete `store.test.ts` leaves plus the complete manager ID leaf M:53; one complete manager data typing spec. These prove test-only framework-neutral prerequisites, not a Svelte Provider, reactive API, exported library implementation or Toast DOM. Six source-derived supplements earn zero leaf credit. |
| [store-prerequisite.ts](store-prerequisite.ts), [manager-prerequisite.ts](manager-prerequisite.ts) | Test-only adaptations of pinned manager/store algorithms. Synchronous immutable state replaces ReactStore; native timers replace Timeout; DOM focus transfer, touch routing and subscriptions/reactive store integration remain unimplemented. These files are outside `src/lib`, exports and tarballs. A future implementation must run the same complete bodies against its real core before inheriting credit. |
| [complete store bodies/helpers](../../packages/base/tests/toast-store-prerequisites.test.ts), [manager leaf/supplements](../../packages/base/tests/toast-manager-prerequisites.test.ts), [complete data spec](../../packages/base/tests/toast-manager-prerequisites.types.ts) | Existing Vitest and Svelte/TypeScript harnesses; no dependency/config change. Bodies and helper assertions are preserved. The native timer adapter implements start/clear behavior; no fake Toast DOM or mock Provider satisfies a component leaf. |
| [credit guard](../../scripts/tests/toast-prerequisites.test.mjs) | Whole callback SHA checks for every credited leaf, exact helper bodies, full type-spec statements after import adaptation, literal swipe variants and immutable source placeholders. |
| [verification.md](verification.md) | Local checks, independent source review, hosted checks and their limitations. |

The shared [manifest](../manifest.json), sources list, Dialog immutable inventory and existing credits are unchanged: **15 passing / 618 unported** out of 633. Its Toast entries still read unported. The separate pure-prerequisite ledger adds no aggregate component credit; the parent coordinates any later reconciliation. Of this Toast trace, 25 leaves have complete executed prerequisite evidence and 171 have no executed port; both provider-context `useToastManager` typing and all component/runtime integration plans remain explicitly unported. The single manager type-spec file is counted separately, never as an extra runtime leaf.

Reproduce after the repository's existing frozen bootstrap:

```sh
node parity/toast/inventory.mjs /path/to/base-ui --check
node scripts/parity-inventory.mjs --upstream /path/to/base-ui --check
node parity/dialog/inventory.mjs /path/to/base-ui --check
bash scripts/verify.sh
bash .github/standards/check.sh
```

Toast tracing reads committed objects at the pin, even if the upstream working tree/HEAD differs; it executes no upstream code. Regeneration without `--check` only rewrites the Toast source trace, never statuses in the shared manifest or prerequisite ledger. Draft-only publication targets main; the parent coordinates merge. No Toast DOM runtime, package/lockfile/export, shared overlay, npm publication, deployment or security changes are included.
