# Continuous integration

`.github/workflows/ci.yml` runs on every pull request, pushes to `main`, and manual dispatch. Pull request jobs check out the exact head SHA, so the workflow run's `head_sha` can be compared with the final reviewed commit. Stable check names are `Standards` and `Verification`.

`Standards` installs both the workspace and the isolated standards toolchain with frozen lockfiles, then runs ESLint, scoped Prettier and commit whitespace checks. `Verification` installs the workspace with its frozen lockfile and runs script regressions, the library build, TypeScript/Svelte diagnostics, runtime tests, the fixture SSR/client build, packaged runtime boundary checks, and the isolated tarball consumer/license check. It uses the existing verification commands and does not publish a package.

Jobs use Ubuntu 24.04, Node 24.x and pnpm 12.6.0. GitHub Actions are pinned to full commit SHAs; version comments identify the reviewed releases. Update pins in a reviewed PR. All jobs have `contents: read` permissions, a 15-minute timeout and cancellation of older runs for the same PR/ref. Checkout does not persist credentials. There are no secrets, deployments, writable tokens or `pull_request_target` code execution.

No browser job is included at this checkpoint. Add one only with a real component harness, installed browser dependencies and non-empty behavior assertions. Component changes still need browser evidence; a green foundation workflow alone does not establish browser parity.

## Proposed main-branch protection

Apply only after both checks have passed on the reviewed PR head and the maintainer has approved the exact settings at action time:

- Require a pull request and resolve review conversations.
- Require `Standards` and `Verification`, with branches up to date before merge.
- Block force pushes and branch deletion.
- Apply the rules to administrators; keep normal reviewed PR merges available.
- Require zero GitHub human approvals while a single maintainer operates the repo; independent source review remains part of the documented merge procedure.
- Do not add bypass actors, new grants, secrets, deployment settings or signing requirements through this change.

This document proposes settings; it does not assert they are active. The available connector exposes no repository-administration write action. Adding browser checks to protection needs a new explicit proposal after the real job has passed.
