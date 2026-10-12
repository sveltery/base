#!/usr/bin/env bash
# Usage: bash scripts/verify.sh
# Full gate before pushing: every layer for the whole library, including the package build.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=scripts/toolchain.sh
source scripts/toolchain.sh
# shellcheck source=scripts/verify-lib.sh
source scripts/verify-lib.sh

port="${E2E_PORT:-4173}"
verify_require_browser
verify_require_port "$port"

VERIFY_EVIDENCE="${VERIFY_DIR:-.verify}/all/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$VERIFY_EVIDENCE"
VERIFY_FAILED=0
echo "verifying all at $(git rev-parse --short HEAD 2>/dev/null || echo unknown)" | tee "$VERIFY_EVIDENCE/summary.txt"

verify_step lint pnpm lint
verify_step types pnpm check
verify_step unit pnpm test:unit
verify_step component pnpm test:component
verify_step package pnpm run build
verify_step e2e env E2E_PORT="$port" E2E_OUTPUT_DIR="$VERIFY_EVIDENCE/playwright" pnpm test:e2e
verify_e2e_breakdown "$VERIFY_EVIDENCE/e2e.log"

verify_finish
