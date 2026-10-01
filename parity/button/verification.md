# Button verification ledger

2026-10-01, Node 24.19.0 / pnpm 12.6.0. Before implementation an inert native-button baseline was mounted against `tests/dom/button.test.ts`: **7 of 10 Button companions failed** (custom host/role, modifier click, four disabled variants, reactive aria-disabled). The absent preventBaseUIHandler channel also raised three uncaught event errors. The broad command additionally reported seven unrelated fixture import failures because the library distribution had not yet been built. These are recorded separately and earn no red Button assertion credit. Baseline removed before the test-only commit. Detailed transient log: `/tmp/button-red.log`.

No browser execution or passing parity is claimed at the test-first checkpoint. The test-only commit intentionally references the not-yet-implemented Button component.

Implementation checkpoint: `bash scripts/verify.sh` and `bash .github/standards/check.sh` pass: 22 script checks, 113 runtime tests, 127 DOM tests, zero TypeScript/Svelte diagnostics, fixture SSR/client build, runtime-boundary scan and isolated tarball root/subpath SSR consumer. Button-only DOM run: 12 passing. Provenance check matches all 42 source declarations at the pin. The `becomes-disabled` fixture's initial-state filter was corrected identically on both frameworks; consumer attachment counters use `untrack` to avoid subscribing the attachment to its own observation state.

Local official Chromium download is blocked by HTTP 403 / Domain forbidden. No sandbox/security configuration was changed. Hosted secured Chromium evidence and final exact-head reviews remain pending.
