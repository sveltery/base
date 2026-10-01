#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm --filter @sveltery/base build
pnpm check
pnpm test
pnpm --filter @sveltery/fixtures build
node scripts/check-runtime.mjs
bash scripts/check-package.sh
