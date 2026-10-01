# Toast preparation verification

Foundation: main `e79368ed8668fbfcbdceeaa8cb6152cf04e85cde`. Source pin: Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Saved cloud environment: Node 24.19.0, repository-selected pnpm 12.6.0, existing frozen workspace and standards lockfiles. No AGENTS.md was present. The upstream checkout lives outside the repository and the tracer reads pinned Git objects.

Execution is **pure prerequisite evidence only**: the unchanged complete 24 store test bodies/helpers, manager ID leaf M:53, full manager data typing spec, and six separately labelled source-derived supplements. No Svelte Toast runtime, DOM mounting, browser parity, public export, shared overlay or package/lock/CI changes are delivered. Shared parity totals/credits remain unchanged. [prerequisites.json](prerequisites.json) is the execution ledger; the source inventory retains every unported placeholder.

Local verification passed:

- Frozen bootstrap, unchanged workspace/standards lockfiles, Node 24.19.0 / pnpm 12.6.0.
- Toast pinned inventory audit: 196 Toast leaves / 199 variants, two type specs and 15 separate helper leaves. Shared inventory audit: 633 entries, 15 passing / 618 unported. Dialog inventory audit: unchanged 175 declarations / 371 candidate records.
- `bash scripts/verify.sh`: 16 script regressions, 50 runtime tests (31 Toast prerequisites/supplements plus 19 existing), 98 existing DOM tests; library and fixture builds, both Svelte/TypeScript checks with zero diagnostics, runtime boundary, tarball consumer and unique-ID Dialog SSR consumer passed. Existing React fixture bundling emits its prior `use client` directive warnings.
- `bash .github/standards/check.sh` and `git diff --check`: passed. No Toast part is mounted by these tests.

Independent Sol/high source review and final-head hosted outcomes are recorded with the draft PR. The existing hosted Standards, Verification and Dialog browser checks must run on the final PR head; passing Dialog browser checks protect existing Dialog behavior and do not establish Toast DOM execution. The parent coordinates merge after checking that the reviewed SHA equals the hosted head.

Commands:

```sh
bash scripts/bootstrap.sh
node parity/toast/inventory.mjs /workspace/base-ui-upstream --check
node scripts/parity-inventory.mjs --upstream /workspace/base-ui-upstream --check
node parity/dialog/inventory.mjs /workspace/base-ui-upstream --check
bash scripts/verify.sh
bash .github/standards/check.sh
git diff --check
```

The scanner guard verifies full adapted test callback hashes and both metadata helper bodies, the complete data-spec body after import mapping, all positive/negative type directives, literal real-pointer variants and immutable status placeholders. The manager's import binding is the only normalized expression in its full-body check. Test-only container/timer changes and omitted DOM/reactive behavior are described per entry; passing these cannot be inherited by an unexecuted Svelte implementation.

Local browser startup remains the repository's already documented sandbox/CDN limitation; no browser flags or security settings are changed. New Toast browser fixtures in scenarios.md are plans, not skipped or mocked passing tests. Hosted existing browser acceptance is required for the draft; Toast/Dialog coexistence remains explicitly unported pending its own real fixtures.
