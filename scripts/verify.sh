#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
node --test scripts/tests/*.test.mjs
pnpm --filter @sveltery/base build
pnpm check
pnpm test
pnpm --filter @sveltery/base test:dom
pnpm --filter @sveltery/fixtures build
node --import ./scripts/svelte-ssr-loader.mjs scripts/check-runtime.mjs
bash scripts/check-package.sh
