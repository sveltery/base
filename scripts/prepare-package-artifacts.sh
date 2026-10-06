#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
sveltery_create_package_artifacts "${1:-.checks/npm-package}" "${2:-@sveltery/base}"
