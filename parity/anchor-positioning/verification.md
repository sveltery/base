# Anchor foundation verification

Current foundation is a proposed private implementation. Ordinary declaration credit remains zero. Every hosted result must identify the exact toolchain, actual installed reference packages, browser sandbox/retries, commit and assertion scope.

Local pre-commit bootstrap used Node 24.19.0 and repository-selected pnpm 12.6.0 with frozen lockfile. Existing runtime suite passed 195 tests; DOM suite passed 789 plus four existing expected failures. The three wiring variants and six hide variants passed within that DOM run. These are jsdom and middleware-wiring observations, not layout evidence. Initial fixture warnings were then repaired; successor checks are required. No secured geometry execution has been recorded yet.

Commands for final-head checks:

```sh
bash scripts/bootstrap.sh
bash scripts/verify.sh
bash .github/standards/check.sh
bash scripts/check-anchor-positioning-package.sh
pnpm exec playwright test tests/browser/anchor-positioning.spec.ts
```

The dedicated workflow uses official Chromium, `chromiumSandbox: true` and zero retries from the shared configuration. Its geometry witnesses execute rendered Svelte and actual installed React fixtures; lifecycle mocks and SSR witnesses remain supplemental. Local Chromium sandbox startup is subject to the managed environment's sandbox configuration; a blocked launch is never recorded as geometry acceptance or worked around by disabling sandboxing.
