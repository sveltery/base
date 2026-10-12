#!/usr/bin/env bash
# Source this before running pnpm, Vitest or Playwright: `source scripts/toolchain.sh`.
# Checks for Node 22+ and selects the pnpm version pinned in package.json.
set -euo pipefail
sveltery_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if (( "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" < 22 )); then
  echo "Sveltery requires Node 22 or newer (found $(node -v 2>/dev/null || echo none))." >&2
  exit 1
fi

SVELTERY_PNPM_VERSION="$(node -p "require(process.argv[1]).packageManager.replace(/^pnpm@/, '')" "$sveltery_repo_root/package.json")"
export SVELTERY_PNPM_VERSION
if command -v pnpm >/dev/null && [[ "$(pnpm --version)" == "$SVELTERY_PNPM_VERSION" ]]; then
  :
elif command -v corepack >/dev/null; then
  # This launcher is also inherited by pnpm commands inside package scripts.
  export PATH="$sveltery_repo_root/scripts/bin:$PATH"
else
  echo "Install pnpm $SVELTERY_PNPM_VERSION or provide Corepack, then rerun." >&2
  exit 1
fi
