#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh

# Combined verification sets this only after its native package build/pack.
if [[ "${SVELTERY_WORKSPACE_READY:-}" != 1 ]]; then
  pnpm package:build
else
  node scripts/package-artifacts.mjs entries "${SVELTERY_PACKAGE_ARTIFACTS:?Pass the prepared archive manifest}" > /dev/null
fi
