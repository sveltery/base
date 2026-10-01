# Shared local/cloud bootstrap

Both macOS and Linux use Node 24.x and pnpm 12.6.0. Provide these tools in the saved environment, or Node 24 plus Corepack. No application secrets are needed for this library build. Repository read/write access is managed separately by the environment owner.

```sh
git clone https://github.com/sveltery/base.git
cd base
git switch feat/foundation-bootstrap
bash scripts/bootstrap.sh
bash scripts/verify.sh
```

Bootstrap runs a frozen-lockfile install. With Corepack, the `packageManager` field selects pnpm. If pnpm is already provided, it must match 12.6.0. Verification packages the library, checks TypeScript/Svelte, runs unit tests, builds SSR/client fixtures, checks runtime import boundaries, and imports root/subpath exports from a locally packed tarball in an isolated consumer directory. It does not publish or deploy.

Network: npm registry and GitHub are needed for setup and immutable upstream references. pnpm 12 may also check registry metadata when executing scripts, so normal development commands require registry access. Future browser tests need Playwright's browser download hosts and a Chromium-compatible Linux image. Disk cache persistence is useful but not required. No paid service is required.

Fixtures: `pnpm --filter @sveltery/fixtures dev --port 5173`. This app uses adapter-auto for local verification; choosing a deployment adapter and publishing docs are out of scope.

`sveltery/ui` is deliberately README-only. Its initial cloud environment requires a checkout and basic Git tooling, with no dependency install. Do not add a styled implementation until the Base milestone is accepted.

The setup owner must create saved environments explicitly for each repository. This repository does not change credentials, OAuth grants, service security settings, or existing environments.
