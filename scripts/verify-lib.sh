#!/usr/bin/env bash
# Shared helpers for verify.sh and verify-component.sh. Source, do not run.

verify_port_in_use() {
  local hex
  hex="$(printf '%04X' "$1")"
  awk -v hex="$hex" 'NR>1 { addr=$2; sub(/.*:/, "", addr); if (addr==hex && $4=="0A") found=1 } END { exit found ? 0 : 1 }' \
    /proc/net/tcp /proc/net/tcp6 2>/dev/null
}

verify_require_browser() {
  if ! compgen -G "$XDG_CACHE_HOME/ms-playwright/chromium*" >/dev/null; then
    echo "Chromium is not installed in $XDG_CACHE_HOME/ms-playwright." >&2
    echo "Run: source scripts/toolchain.sh && pnpm exec playwright install chromium" >&2
    exit 1
  fi
}

verify_require_port() {
  if verify_port_in_use "$1"; then
    echo "Port $1 is already in use. Playwright starts its own preview server there." >&2
    echo "Stop the process you started on it, or rerun with E2E_PORT=<free port>." >&2
    exit 1
  fi
}

# verify_step <name> <command...>: runs the command, logs to $VERIFY_EVIDENCE/<name>.log,
# appends PASS/FAIL to summary.txt and keeps going so every layer reports.
verify_step() {
  local name="$1"
  shift
  local log="$VERIFY_EVIDENCE/$name.log"
  printf '%-10s ... ' "$name"
  if "$@" >"$log" 2>&1; then
    echo PASS
    echo "PASS $name" >>"$VERIFY_EVIDENCE/summary.txt"
  else
    echo "FAIL (see $log)"
    echo "FAIL $name ($log)" >>"$VERIFY_EVIDENCE/summary.txt"
    VERIFY_FAILED=1
  fi
}

# Splits Playwright results by framework project so a Svelte regression is not confused
# with a fixture or React-reference problem.
verify_e2e_breakdown() {
  local log="$1" framework passed failed
  for framework in svelte react; do
    passed="$(grep -cE "✓ .* › $framework( |$)" "$log" || true)"
    failed="$(grep -cE "✘ .* › $framework( |$)" "$log" || true)"
    echo "e2e $framework: $passed passed, $failed failed" | tee -a "$VERIFY_EVIDENCE/summary.txt"
  done
}

verify_finish() {
  echo "evidence: $VERIFY_EVIDENCE"
  if [[ "${VERIFY_FAILED:-0}" != 0 ]]; then
    echo "RESULT FAIL" | tee -a "$VERIFY_EVIDENCE/summary.txt"
    exit 1
  fi
  echo "RESULT PASS" | tee -a "$VERIFY_EVIDENCE/summary.txt"
}
