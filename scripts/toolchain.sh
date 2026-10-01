#!/usr/bin/env bash
# Shared by bootstrap, verification, and the standalone tarball check.
set -euo pipefail
sveltery_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  echo 'Sveltery requires Node 24.x for this reproducible toolchain.' >&2
  exit 1
fi
SVELTERY_PNPM_VERSION="$(node -p "require(process.argv[1]).packageManager.replace(/^pnpm@/, '')" "$sveltery_repo_root/package.json")"
export SVELTERY_PNPM_VERSION
# Keep tool caches writable in restricted workspaces; respect explicitly supplied paths.
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
