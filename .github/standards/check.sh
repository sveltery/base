#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
source scripts/toolchain.sh
pnpm --dir .github/standards --ignore-workspace install --frozen-lockfile
node .github/standards/node_modules/eslint/bin/eslint.js --config .github/standards/eslint.config.mjs packages/base/src packages/base/tests apps/fixtures/src apps/fixtures/*.js apps/fixtures/*.ts scripts .github/standards/*.mjs
node .github/standards/node_modules/prettier/bin/prettier.cjs --config .github/standards/prettier.json --check '.github/**/*.{json,mjs,yml,md}' CONTRIBUTING.md SECURITY.md docs/ci.md docs/releasing.md
