#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  echo 'Sveltery requires Node 24.x for this reproducible bootstrap.' >&2
  exit 1
fi
if command -v pnpm >/dev/null && [[ "$(pnpm --version)" == 12.6.0 ]]; then
  pnpm install --frozen-lockfile
elif command -v corepack >/dev/null; then
  corepack pnpm install --frozen-lockfile
else
  echo 'Install pnpm 12.6.0 or provide Corepack, then rerun bootstrap.' >&2
  exit 1
fi
