#!/usr/bin/env bash
# Source this before running pnpm, Vitest or Playwright: `source scripts/toolchain.sh`.
# Selects Node 24 and pnpm from package.json, and keeps tool caches inside the repo.
set -euo pipefail
sveltery_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

sveltery_node_major() {
  node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0
}
if [[ "$(sveltery_node_major)" != 24 ]]; then
  # Some hosts put an older node first on PATH; prefer an installed nvm Node 24.
  sveltery_node24="$(find "$HOME/.nvm/versions/node" -maxdepth 1 -type d -name 'v24.*' 2>/dev/null | sort -V | tail -1 || true)"
  if [[ -n "$sveltery_node24" ]]; then
    export PATH="$sveltery_node24/bin:$PATH"
    hash -r
  fi
fi
if [[ "$(sveltery_node_major)" != 24 ]]; then
  echo "Sveltery requires Node 24.x (found $(node -v 2>/dev/null || echo none)). Install it, e.g. 'nvm install 24'." >&2
  exit 1
fi

SVELTERY_PNPM_VERSION="$(node -p "require(process.argv[1]).packageManager.replace(/^pnpm@/, '')" "$sveltery_repo_root/package.json")"
export SVELTERY_PNPM_VERSION
# Keep tool caches (including Playwright browsers) writable and repo-local; respect explicit paths.
export COREPACK_HOME="${COREPACK_HOME:-$sveltery_repo_root/.checks/corepack}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$sveltery_repo_root/.checks/cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$sveltery_repo_root/.checks/data}"
if command -v pnpm >/dev/null && [[ "$(pnpm --version)" == "$SVELTERY_PNPM_VERSION" ]]; then
  :
elif command -v corepack >/dev/null; then
  # This launcher is also inherited by pnpm commands inside package scripts.
  export PATH="$sveltery_repo_root/scripts/bin:$PATH"
else
  echo "Install pnpm $SVELTERY_PNPM_VERSION or provide Corepack, then rerun." >&2
  exit 1
fi
if [[ "$(pnpm --version)" != "$SVELTERY_PNPM_VERSION" ]]; then
  echo "Could not select pinned pnpm $SVELTERY_PNPM_VERSION." >&2
  exit 1
fi
