#!/usr/bin/env bash
# Usage: bash scripts/verify-component.sh <component>   e.g. toggle
# Runs every verification layer for one component and keeps logs and Playwright artifacts.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=scripts/toolchain.sh
source scripts/toolchain.sh
# shellcheck source=scripts/verify-lib.sh
source scripts/verify-lib.sh

component="${1:-}"
if [[ -z "$component" || ! -d "src/lib/$component" ]]; then
  echo "usage: bash scripts/verify-component.sh <component>" >&2
  echo "components: $(find src/lib -mindepth 1 -maxdepth 1 -type d ! -name internal -printf '%f ' | sort)" >&2
  exit 2
fi
fixture="src/routes/fixtures/$component"
port="${E2E_PORT:-4173}"

verify_require_browser
verify_require_port "$port"

VERIFY_EVIDENCE="${VERIFY_DIR:-.verify}/$component/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$VERIFY_EVIDENCE"
VERIFY_FAILED=0
echo "verifying $component at $(git rev-parse --short HEAD 2>/dev/null || echo unknown)" | tee "$VERIFY_EVIDENCE/summary.txt"

paths=("src/lib/$component")
[[ -d "$fixture" ]] && paths+=("$fixture")

verify_step format pnpm exec prettier --check "${paths[@]}"
verify_step lint pnpm exec eslint "${paths[@]}"
verify_step types pnpm check
verify_step unit pnpm exec vitest run --project server --passWithNoTests "src/lib/$component" src/lib/internal
verify_step component pnpm exec vitest run --project client "src/lib/$component"
if [[ -d "$fixture" ]]; then
  verify_step e2e env E2E_PORT="$port" E2E_OUTPUT_DIR="$VERIFY_EVIDENCE/playwright" \
    pnpm exec playwright test "$fixture"
  verify_e2e_breakdown "$VERIFY_EVIDENCE/e2e.log"
else
  echo "FAIL e2e (no fixture at $fixture)" | tee -a "$VERIFY_EVIDENCE/summary.txt"
  VERIFY_FAILED=1
fi

verify_finish
