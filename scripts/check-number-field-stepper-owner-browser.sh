#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
export NODE_OPTIONS="--max-old-space-size=1024"
owner_evidence=".checks/number-field/stepper-owner-paired"
owner_backup="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-stepper-owner.XXXXXX")"
owner_prepared=false
owner_dist_current=true
restore_owner() {
  local result="$?"
  trap - EXIT
  if [[ "$owner_prepared" == true ]]; then
    node scripts/number-field-stepper-owner-browser.mjs restore "$owner_backup" "$owner_evidence" || result=1
    if [[ "$owner_dist_current" != true ]]; then
      pnpm --filter @sveltery/base run prepack > "$owner_evidence/current-dist-emergency-restoration.log" 2>&1 || result=1
    fi
  fi
  rm -rf "$owner_backup"
  exit "$result"
}
trap restore_owner EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
mkdir -p "$owner_evidence"
node scripts/number-field-stepper-owner-browser.mjs prepare "$owner_backup" "$owner_evidence"
owner_prepared=true
PLAYWRIGHT_JSON_OUTPUT_NAME="$owner_evidence/red-selection-results.json" pnpm exec playwright test tests/browser/number-field.spec.ts --grep 'svelte NumberField stepper native outro retains its actual host diagnostics$' --list --reporter=list,json | tee "$owner_evidence/red-selection.log"
node scripts/number-field-stepper-owner-browser.mjs verify-selection "$owner_backup" "$owner_evidence"
node scripts/number-field-stepper-owner-browser.mjs install-red "$owner_backup" "$owner_evidence"
# Public exports consume dist, so execute the actual rebuilt predecessor body.
owner_dist_current=false
pnpm --filter @sveltery/base run prepack > "$owner_evidence/red-package-build.log" 2>&1
node scripts/number-field-stepper-owner-browser.mjs verify-red-source "$owner_backup" "$owner_evidence"
set +e
PLAYWRIGHT_JSON_OUTPUT_NAME="$owner_evidence/red-results.json" pnpm exec playwright test tests/browser/number-field.spec.ts --grep 'svelte NumberField stepper native outro retains its actual host diagnostics$' --output="$owner_evidence/red-traces" --reporter=list,json 2>&1 | tee "$owner_evidence/red-browser.log"
owner_red_pipe=("${PIPESTATUS[@]}")
owner_red_result="${owner_red_pipe[0]}"
set -e
if [[ "${owner_red_pipe[1]}" -ne 0 ]]; then exit 1; fi
if [[ "$owner_red_result" -ne 1 ]]; then
  echo "Expected ordinary predecessor assertion failure; received status $owner_red_result" >&2
  exit 1
fi
node scripts/number-field-stepper-owner-browser.mjs verify-red "$owner_backup" "$owner_evidence"
node scripts/number-field-stepper-owner-browser.mjs restore "$owner_backup" "$owner_evidence"
pnpm --filter @sveltery/base run prepack > "$owner_evidence/current-package-build.log" 2>&1
owner_dist_current=true
node scripts/number-field-stepper-owner-browser.mjs verify-current "$owner_backup" "$owner_evidence"
# Mandatory normal full suite: same secured runner, one worker, zero retries, no expected failures.
set +e
PLAYWRIGHT_JSON_OUTPUT_NAME=.checks/number-field/browser-results.json pnpm exec playwright test tests/browser/number-field.spec.ts --reporter=list,json 2>&1 | tee .checks/number-field/browser.log
owner_green_pipe=("${PIPESTATUS[@]}")
owner_green_result="${owner_green_pipe[0]}"
set -e
if [[ "${owner_green_pipe[1]}" -ne 0 ]]; then owner_green_result=1; fi
node scripts/number-field-stepper-owner-browser.mjs verify-current "$owner_backup" "$owner_evidence"
if [[ "$owner_green_result" -eq 0 ]]; then
  node scripts/number-field-stepper-owner-browser.mjs verify-green "$owner_backup" "$owner_evidence"
fi
exit "$owner_green_result"
