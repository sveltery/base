# Continuous integration

`.github/workflows/ci.yml` runs on every pull request, pushes to `main`, and manual dispatch. Pull request jobs check out the exact head SHA, so the workflow run's `head_sha` can be compared with the final reviewed commit. Stable check names are `Standards` and `Verification`.

`Standards` installs both the workspace and the isolated standards toolchain with frozen lockfiles, then runs ESLint, scoped Prettier and commit whitespace checks. `Verification` installs the workspace with its frozen lockfile and runs script regressions, the library build, TypeScript/Svelte diagnostics, runtime tests, the fixture SSR/client build, packaged runtime boundary checks, and the isolated tarball consumer/license check. It uses the existing verification commands and does not publish a package.

Standards and Verification use Ubuntu 24.04; Dialog browser, Collapsible browser, Meter browser, Avatar browser and Accordion browser use Ubuntu 22.04 (an officially supported Playwright/GitHub runner image). Jobs use Node 24.x and pnpm 12.6.0. GitHub Actions are pinned to full commit SHAs; version comments identify the reviewed releases. Update pins in a reviewed PR. All jobs have `contents: read` permissions and cancellation of older runs for the same PR/ref. Standards, Verification and focused browser jobs have a 15-minute timeout; the combined Dialog browser job has 25 minutes for the expanded suite plus artifact collection and cleanup. Checkout does not persist credentials. There are no secrets, deployments, writable tokens or `pull_request_target` code execution.

`Dialog browser` installs official Chromium plus OS dependencies and runs real React/Svelte fixtures. Read that job's log in the [exact-head CI run](https://github.com/sveltery/base/actions/workflows/ci.yml) for the current execution count and result; each browser assertion suite is under `tests/browser`. Executions include paired reference fixtures, complete source ports, and supplemental regressions, so execution counts differ from upstream parity credit. The Playwright configuration explicitly enables the Chromium sandbox, retries are zero, and no blanket skips hide pending behavior. Local saved-environment startup is blocked. The first Ubuntu 24.04 browser job also failed before interaction with Chromium "No usable sandbox!"; the browser job uses Ubuntu 22.04 without changing sandbox flags or OS security policies. [Run 36844887195](https://github.com/sveltery/base/actions/runs/36844887195) records the original secured-browser acceptance checkpoint. A green `Standards` or `Verification` check alone does not establish browser parity. This change does not add the browser check to branch protection.

`Collapsible browser` runs the focused paired Collapsible file with the same secured Playwright configuration and pinned exact-head setup. Successful runs execute every collected case; diagnosis stops after five failures and saves their traces. The combined `Dialog browser` job still runs the complete browser suite. Neither execution count adds ordinary declaration credit.

The integrated Input/Meter suite collected 1,233 cases. [Run 37040246461](https://github.com/sveltery/base/actions/runs/37040246461) logged 1,233 passing assertions in 14.1 minutes, then the combined job was cancelled at its 15-minute wall-time boundary during artifact/cleanup completion. Increasing only that combined budget to 20 minutes preserves the full suite, sandbox, zero retries, source expectations and artifact retention; the successor still requires green exact-head CI.

After corrected Avatar/Accordion integration, [run 37055721029](https://github.com/sveltery/base/actions/runs/37055721029/job/110999817012) collected 1,693 combined cases at `a4b767041074d22ad3eca85d063d12a51ad16c2d`. The runner started at 19:41:15 UTC on 2026-10-02 and canceled at 20:01:29 after 1,667 passing cases, before suite completion; no assertion failed before cancellation. This incomplete run earns no combined acceptance. Raising only the combined budget from 20 to 25 minutes gives the expanded suite and cleanup room to finish. The full suite, sandbox, zero retries, expectations, pinned actions, permissions and artifact retention remain unchanged; fresh final-head green CI is required.

`Meter browser` runs the focused 224 paired Meter executions with the same secured configuration and exact-head setup. It retains failure traces and stops diagnosis after five failures; successful runs execute every case. The combined browser job still runs every suite. The 22 ordinary declarations, four parameterized variants, conformance and supplemental evidence remain separately accounted.

## Proposed main-branch protection

Apply only after both checks have passed on the reviewed PR head and the maintainer has approved the exact settings at action time:

- Require a pull request and resolve review conversations.
- Require `Standards` and `Verification`, with branches up to date before merge.
- Block force pushes and branch deletion.
- Apply the rules to administrators; keep normal reviewed PR merges available.
- Require zero GitHub human approvals while a single maintainer operates the repo; independent source review remains part of the documented merge procedure.
- Do not add bypass actors, new grants, secrets, deployment settings or signing requirements through this change.

This document proposes settings; it does not assert they are active. The available connector exposes no repository-administration write action. Adding browser checks to protection needs a new explicit proposal after the real job has passed.

`Accordion browser` runs the focused paired Accordion file with the same secured Chromium configuration and exact-head setup as Collapsible. The combined browser job continues to run the full suite. The isolated public package gate is included in Verification through check-package.sh; API consistency is registered in script regressions. Execution success does not create ordinary parity credit.
