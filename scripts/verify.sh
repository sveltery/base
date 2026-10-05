#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
artifact_directory="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-artifacts.XXXXXX")"
trap 'rm -rf "$artifact_directory"' EXIT
sveltery_create_package_artifacts "$artifact_directory" @sveltery/base
node --test scripts/tests/*.test.mjs
pnpm check
pnpm test
pnpm --filter @sveltery/base test:dom
pnpm --filter @sveltery/fixtures build
node --import ./scripts/svelte-ssr-loader.mjs scripts/check-runtime.mjs
bash scripts/check-package.sh
bash scripts/check-use-click-package.sh
