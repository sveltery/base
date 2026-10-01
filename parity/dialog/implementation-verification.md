# Contained Dialog draft verification

2026-10-01, saved Linux environment, Node **24.19.0** / pinned pnpm **12.6.0**. Final feature base: main **`9b72e7c0a746f4b0a551a666209cc82fa07d44bf`**, including merged foundation and contracts. Initial verified PR2 head `76c81aa8bb18c7f569b590157f4be7cd16d4455c` was replaced by the parent's reviewed rebase `9a2633aca8f22ac96061c49491d9cda5687e6ee5`, then merged to main; feature commits were replayed without editing those contracts.

## Executed

- `bash scripts/bootstrap.sh`: frozen-lockfile install passes on the pinned toolchain.
- `bash scripts/verify.sh`: passes, including 9 script regressions, package/declaration build, library and fixture Svelte/TypeScript checks (zero errors/warnings), 19 existing runtime tests, **15 actual Svelte DOM supplemental tests**, fixture SSR/client build, runtime-import boundary scan, and isolated tarball utility + compiled Dialog SSR consumer. Packed Root/subpath imports render actual parts and unique generated IDs across two Roots. React reference bundling produces upstream `use client` directive warnings; this is a client-only reference fixture, not a runtime package dependency.
- `bash .github/standards/check.sh`: ESLint/scoped Prettier pass. TypeScript parser coverage extended to `.svelte.ts`; two precise `no-useless-assignment` comments explain externally observed Svelte bindable action writes. No broad lint exclusion added.
- `node parity/dialog/inventory.mjs /workspace/base-ui-reference --check`: byte-exact pinned Dialog inventory passes: 175 declarations / 371 expanded records. Shared manifest, scanner, mergeProps, scenario contracts and upstream inventory unchanged.
- `pnpm exec playwright test --list`: **31 probes collected**, no skips. Collection proves parsing/discovery only.
- `git diff --check`: passes.

## Blocked, not passed

Official `pnpm exec playwright install chromium` requests `https://cdn.playwright.dev/builds/cft/153.0.8010.12/linux64/chrome-linux64.zip` and returns **403 Domain forbidden**. No policy change or alternate-host bypass.

A Playwright smoke attempt selecting `DIALOG_CHROMIUM_PATH=/usr/bin/chromium`, with **`chromiumSandbox: true`**, fails at browser launch before interactions: SIGABRT; `setuid_sandbox_host.cc:166` requires `/usr/lib/chromium/chrome-sandbox` to be owned by root with mode 4755. Existing helper has mode 4755 and owner nobody. A bounded repeat after correcting runner shutdown confirms the same failure, with clean runner termination. Managed browser lookup also fails its environment preconditions; no launcher/security settings changed.

Therefore no real Chromium focus/Tab/trusted pointer/transition/hydration result is claimed. No browser assertion was adjusted to this failure and no test was marked skipped. Added CI check name: **`Dialog browser`**; it installs official Chromium/OS dependencies and runs the complete real fixture suite with sandboxing enabled. The first [CI run](https://github.com/sveltery/base/actions/runs/36844055397) at `901cab5` passed Standards and Verification. Its Ubuntu 24.04 browser job downloaded official Chromium successfully but all 31 probes failed before interaction with `zygote_host_impl_linux.cc:129`, **No usable sandbox!**, SIGTRAP. The error cites Ubuntu 23.10+ AppArmor user-namespace restrictions. The browser job now selects Ubuntu 22.04, supported by [GitHub runner images](https://github.com/actions/runner-images) and [Playwright requirements](https://playwright.dev/docs/intro#system-requirements); no sysctl/AppArmor changes, grants or sandbox-disabling flags. A future actual CI pass/failure must be recorded separately; green Standards/Verification do not certify browser acceptance. No branch-protection change is made.

## Independent review

Native **gpt-6.1-sol / high** reviewed source/test faithfulness and code quality, identified concrete attachment lifecycle, initial animation, native keyboard composition, focus return, deferred completion, ID registration and scroll restoration bugs; the implementation owner corrected them. Reviewer independently reran the current DOM suite, **15/15 passed**, and found no blocker to publishing the accurately bounded experimental draft. The owner subsequently added the reviewer's child-forwarding assertion and reran all verification/standards checks. Review did not execute blocked browsers or certify complete upstream parity.

See [implementation scope/API proposals](../../docs/dialog-first-slice.md), [DOM tests](../../packages/base/tests/dom/dialog.test.ts), [browser probes](../../tests/browser/dialog.spec.ts), and [original scenario contracts](scenarios.md). Every original upstream Dialog leaf remains unported. Unsupported behavior and decisions requiring parent API/environment approval are listed in the scope document.
