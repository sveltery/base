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

The initial secured run at `ecfeb9847028785d1e5b33424f47a31f30c9de6a` is now inspected: [37079740765](https://github.com/sveltery/base/actions/runs/37079740765) passed 20/23 supplements, including all eleven Svelte geometry witnesses and Svelte SSR/hydration, and failed three actual React witnesses (function-offset transform origin, initial provider RTL and anchor replacement). Node 24.21.0, pnpm 12.6.0, actual React/ReactDOM 19.2.8 and Floating UI DOM/core 1.8.0/utils 0.2.12 were recorded; official Chromium 153.0.8010.12 used the sandbox with zero retries. Combined [CI 37079740727](https://github.com/sveltery/base/actions/runs/37079740727) passed 1,732 browser executions and failed the same three Floating witnesses; Verification, Standards and the six other jobs passed. This red checkpoint is preserved and earns no acceptance or ordinary parity credit. Its fixture wiring and native/reference scheduling are under source investigation in [source-correspondence.md](source-correspondence.md).

The native source-refactor checkpoint separates `useAnchorPositioning` and the native `useFloating` driver, reuses the real direction context internally, preserves source external-anchor identity registration and initializes requested placement/strategy before browser measurement. Local Node 24.19.0/pnpm 12.6.0 full verification passed: source/script checks, build, zero-diagnostic workspace types, 195 runtime tests, 796 DOM passes plus four inherited expected failures, fixture SSR/client build, runtime boundary and all public installed tarball consumers. Standards, sixteen focused anchor DOM variants, paired no-browser SSR (including initial RTL logical output), provenance and isolated private tarball dependency/types also passed. These checks establish no new secured layout credit. The successor fixture uses one original DirectionContext module graph and actual `refs.setReference` host registration. Its function-offset origin witness explicitly expects the observed React/native closure difference with zero unchanged assertion credit. Secured successor CI and source/native/maintainability review remain pending.
